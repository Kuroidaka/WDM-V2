import { ServiceWeddingService } from './../service_wedding/service_wedding.service';

import { BadGatewayException, BadRequestException, ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createWeddingDto } from './create_wedding.dto';
import { CustomerService } from 'src/customer/customer.service';
import { LobbyService } from 'src/lobby/lobby.service';
import { LobbyIncludedLobType } from 'src/lobby/lobby.interface';
import { WeddingInterface, foodOrderWedding, serviceOrder } from './wedding.interface';
import { FoodService } from 'src/food/food.service';
import { FoodInterFace } from 'src/food/food.interface';
import { ServiceInterFace } from 'src/service_wedding/service.interface';
import { calculateTimeDifference } from 'utils';
import { BillService } from 'src/bill/bill.service';
import { BillInterface } from 'src/bill/bill.interface';

@Injectable()
export class WeddingService {
  constructor(
    private prisma:PrismaService,
    private customerService:CustomerService,
    private lobbyService:LobbyService,
    private foodService:FoodService,
    private serviceWeddingService:ServiceWeddingService,
    private billService:BillService,
  ) {}

  async weddingNum() {
    try {

      const weddingNum = await this.prisma.wedding.count();
      
      return weddingNum;

    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getMonthWedding(month:number, year:number) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); 

      const weddings = await this.prisma.wedding.findMany({
          where: {
            "wedding_date": {
              gte: startDate,
              lte: endDate
            }
          }
        }
      );
      
      return weddings;

    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findEventOnDate (wedding_date:(string | Date)) {
    const startDate = new Date(wedding_date);
    startDate.setHours(0, 0, 0, 0);
  
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);
  
    const events = await this.prisma.wedding.findMany({
        where: {
            wedding_date: {
                gte: startDate,
                lt: endDate,
            },
        },
    });
  
    return events
  }

  async getWeddings(bill?: boolean) {
    try {
      let queryObject:{
        include: {
          Bill?: any,
          Customer: boolean,
        }
      } = {
        include: {
          Bill: true,
          Customer: true,
        }
      };

      if(bill) {
        queryObject = { ...queryObject, include: {
          ...queryObject.include,
          Bill: {
            orderBy: {
                "created_at": 'desc'
            }
          }
        }}
      }

      const weddingData = await this.prisma.wedding.findMany(queryObject);
      console.log(weddingData)
      const weddingList = weddingData.map(data => {
        if(data.Bill.length > 0) {
            if(data.Bill[0]["remain_amount"] <= 0)
                return {...data, status: "paid"} 
            return {...data, status: "deposit"} 
        }
        return {...data, status: "pending"} 
      })
      
      return weddingList;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getWeddingById({id, bill}:{id:string, bill?: boolean}) {
    try {
      let queryObject:{
        where: { id:string,},
        include?: any,
      } = { 
        where: { id, },
      }

      if(bill) {
        queryObject = { ...queryObject, include: {
          Bill: {
            orderBy: {
                "created_at": 'desc'
            }
          }
        }}
      }

      const wedding = await this.prisma.wedding.findUnique(queryObject)

      return wedding
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createWedding(dataCreate:createWeddingDto) {
    try {
      const { 
        lobby_id,
        groom,
        bride,
        phone,
        wedding_date,
        note,
        shift,
        table_count,
      } = dataCreate;
  
      // Check phone number exist
      if(!phone) throw new BadRequestException('Missing phone number');
  
      // Check exist customer with phone number
      let customer = await this.customerService.findByPhone(phone);
  
      if(!customer) {
        const name = `${groom}/${bride}`;
        customer = await this.customerService.createCustomer(name, phone);
      }
      
      // valid lobby
      const lobby:LobbyIncludedLobType = await this.lobbyService.getLobbyById(lobby_id, false);
      if(!lobby) throw new NotFoundException('Lobby not found')
  
      // Check valid max table number
      if(table_count > lobby.LobType["max_table_count"]) throw new BadRequestException(`This lobby's max table is ${lobby.LobType["max_table_count"]}(your order: ${table_count})`)
  
      // Check valid lobby and date for weeding
      const eventOnDate = await this.findEventOnDate(wedding_date);
      const isValidDate = eventOnDate.some(data => data.shift === shift)
      const isSameLob = eventOnDate.some(data => data['lobby_id'] === lobby_id)
  
      if(isValidDate && isSameLob) throw new ConflictException('This date & shift had a wedding');
  
      // Create wedding 
      const newWedding = await this.prisma.wedding.create({
        data: {
          groom,
          bride,
          wedding_date: new Date(wedding_date),
          shift,
          lobby_id,
          customer_id: customer.id,
          table_count,
          note,
        } as WeddingInterface
      })
  
      return newWedding
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getFoodPriceForWedding (weddingId:string) {

    const dataWedding = await this.prisma.wedding.findUnique({
      where : {
        id: weddingId
      }
    })

    if(!dataWedding) throw new NotFoundException(`not found any wedding data for id: ${weddingId}`)

    const tableCount = dataWedding['table_count']

    const foodWedding = await this.prisma.foodOrder.findMany({
      where: {
        "wedding_id":weddingId
      }
    })

    const foodPrice = foodWedding.reduce((total, current) => {
      return total += current.food_price * current.count * tableCount
    }, 0)

    return foodPrice
  }

  async getServicePriceForWedding(weddingId) {

    const serviceWedding = await this.prisma.serviceOrder.findMany({
      where: {
        "wedding_id":weddingId
      }
    })

    const servicePrice = serviceWedding.reduce((total, current) => {
      return total += current.service_price * current.count
    }, 0)

    return servicePrice
  }

  // Food Order
  async orderFood(weddingId:string, foods:{id:string, count:number}[]) {
      /*DEFINE*/
      const resetFoodOrder = async (weddingId:string) => { // reset previous data food order
        await this.prisma.foodOrder.deleteMany({
          where: {
            "wedding_id": weddingId
          }
        })
      }      
      const foodOrderProcess = async ({// Process order food
        foods,
        weddingId,
        tableCount,
        minTablePrice,
        lobName,
        lobTypeName
      }: {
        foods: {id:string, count:number}[],
        weddingId:string,
        tableCount:number,
        minTablePrice:number,
        lobName:string,
        lobTypeName:string
      }) => {
        // Customer data
        let totalPrice = 0;
        const errorFoodList = []
        let tablePrice = 0

        await resetFoodOrder(weddingId)
        //calc food price for each table
        for (const food of foods) {
          // check exist food
          const foodID = food.id
          const foodData:any = await this.foodService.findFoodByID(foodID)
          if(!foodData) {
            errorFoodList.push(`Not found any data for food with ID:${foodID}`);
            continue;
          }

          // Insert food order data
          const orderData = await insertFoodOrderData(food, weddingId, foodData)
          if(orderData?.msg) {
            errorFoodList.push(orderData.msg)
            continue
          }

          // calculate the total price
          tablePrice += foodData.price * food.count
          totalPrice += foodData.price * food.count * tableCount
        }

        // check valid lob min price
        if(tablePrice < minTablePrice) {
          throw new BadGatewayException (`Lobby ${lobName} (Type ${lobTypeName}) : min table price ${minTablePrice}(your: ${tablePrice})`)
        }

        return {
          msg: errorFoodList,
          totalPrice
        }
      }
      const insertFoodOrderData = async (
        foodOrderData:{id:string, count:number},
        weddingId:string,
        foodFound:FoodInterFace
      ) => {
        try {
          // check food inventory
          const inventory = foodFound.inventory - foodOrderData.count
          if(inventory < 0) return { msg: `${foodFound.name} remains: ${foodFound.inventory}, not enough to fulfill the order.`, };
    
          await this.prisma.foodOrder.create({
              data: {
                  "food_id": foodFound.id,
                  "food_name": foodFound.name,
                  "food_price": foodFound.price,
                  "wedding_id": weddingId,
                  count: foodOrderData.count
              } as any
          });
        } catch (error) {
          console.log(error);
          throw error;
        }
      }
    try {

      const dataWedding = await this.prisma.wedding.findUnique({
        where : {
          id: weddingId
        },
        include: {
          Lobby: {
            include: {
              LobType: true
            }
          }
        }
      })
      const tableCount = dataWedding['table_count']
      const minTablePrice = dataWedding.Lobby.LobType["min_table_price"] 
      const lobName = dataWedding.Lobby.name
      const lobTypeName = dataWedding.Lobby.LobType["type_name"]

      

      const result = await foodOrderProcess({
        foods,
        tableCount,
        weddingId,
        minTablePrice,
        lobName,
        lobTypeName
      })

      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Service Order
  async orderService(weddingId:string, services:serviceOrder[]){

        //  Define
        const serviceOrderProcess = async (services:serviceOrder[], weddingId:string) => {
          let totalPrice = 0
      
          const errorFoodList = [];
          // reset previous service order for wedding
          await this.prisma.serviceOrder.deleteMany({ where: { "wedding_id": weddingId } })
      
          for (const service of services) {
            
            const serviceID = service.id
            const serviceData = await this.serviceWeddingService.findServiceByID(serviceID)
            if(!serviceData) {
              errorFoodList.push(`Not found any data for service with ID:${serviceID}`);
              continue;
            }

            await insertServiceOrderData(
              service,
              weddingId,
              serviceData
            )
           
      
            totalPrice += serviceData.price
      
          }
      
          return {
            servicePrice: totalPrice
          }
        }
        const insertServiceOrderData = async(
          serviceOrderData: serviceOrder,
          weddingId:string,
          serviceFound:ServiceInterFace
        ) => {
          try {
      
            const serviceID = serviceOrderData.id;
            const serviceData = await this.serviceWeddingService.findServiceByID(serviceID);

            // check service inventory
            const inventory = serviceFound.inventory - serviceOrderData.count
            if(inventory < 0) return { msg: `${serviceFound.name} remains: ${serviceFound.inventory}, not enough to fulfill the order.`, };
    
      
            await this.prisma.serviceOrder.create({
                data: {
                    "service_id": serviceData.id,
                    "service_name": serviceData.name,
                    "service_price": serviceData.price,
                    "wedding_id": weddingId,
                    count: serviceOrderData.count
                } as any
            });


      
          } catch (error) {
            console.log(error);
            throw error;
          }
        }

    // Main 
    try {
      
      let totalPrice = 0
      // get food price
      const foodPrice = await this.getFoodPriceForWedding(weddingId)

      totalPrice += foodPrice

      const serviceData = await serviceOrderProcess(services, weddingId);

      const dataWeeding = await this.getWeddingById({id: weddingId});

      return { 
        totalPrice: totalPrice + serviceData.servicePrice,
        service: serviceData,
        weddingData: dataWeeding
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async modifyInventory(foodList:foodOrderWedding[]) {

    for(const food of foodList) {
      const foodID = food.food_id
      const foodData = await this.foodService.findFoodByID(foodID)

      let inventory = foodData.inventory

      inventory -= food.count
      
      await this.foodService.updateInventory(foodID, inventory);

    }
  }

  // Get Deposit
  async getDeposit(weddingId) {

    const weddingWithLobType = await this.prisma.wedding.findUnique({
        where: {
            id: weddingId,
        },
        include: {
          Lobby: {
            include: {
              LobType: true
            }
          }
        },
    });
    return weddingWithLobType.Lobby.LobType["deposit_percent"]
  }

  async preparePriceForPayment(weddingId:string) {
     // calc price
     const foodPrice = await this.getFoodPriceForWedding(weddingId);
     const servicePrice = await this.getServicePriceForWedding(weddingId);
     const totalPrice = servicePrice + foodPrice

     return {
      foodPrice,
      servicePrice,
      totalPrice
     }
  }

  async getPenalty(totalPrice:number, isPenalty:boolean, weddingDate:Date) {
    // check penalty 
    let extraFee = 0
    if(isPenalty) {
      const payDate = new Date()

      const timeDifference = calculateTimeDifference(weddingDate, payDate);

      if(timeDifference.days > 0) {
        extraFee = timeDifference.days* (totalPrice / 100)
      }
    }

    return extraFee;
  }

  calculateRemainPrice ({
    bills,
    isPenalty,
    extraFee,
    totalPrice,
    transactionAmount=0,
  }: {
    bills:BillInterface[],
    isPenalty:boolean,
    extraFee:number,
    totalPrice:number,
    transactionAmount?:number,
  }):{
    remainPrice: (number | string),
    newTotalPrice?: number
  } {
    const recentBill = bills[0]
    let remainPrice = 0;
    let newTotalPrice = 0
    if(bills.length > 0) { //deposit before
      if(recentBill['remain_amount'] <= 0) {
        return { remainPrice: 'your bill have been fully paid' };
      }

      newTotalPrice = recentBill['remain_amount']
      // calc remain price
      if(!isPenalty && recentBill["extra_fee"] > 0) {
        newTotalPrice -= recentBill["extra_fee"] 
      }
      else if(isPenalty && recentBill["extra_fee"] === 0) {
        newTotalPrice += extraFee 
      }
      remainPrice = newTotalPrice - transactionAmount
    }
    else { //first time payment (no deposit before)
      // calc remain price
      newTotalPrice = totalPrice
      if(isPenalty) {
        newTotalPrice = totalPrice + extraFee 
      } 
      remainPrice = newTotalPrice - transactionAmount
    }

    return {
      remainPrice,
      newTotalPrice
    }
  }

  // Deposit
  async depositOrder(
    transactionAmount:number,
    weddingId:string
  ) {
    try {
      
      let finalData:{
        extraFee?: number,
        totalPrice?: number,
        weddingData?: WeddingInterface,
        deposit_amount?: number,
        remain?: number,
        foodPrice?: number,
        servicePrice?: number,
      } = {}
      // calc price
      const { foodPrice, servicePrice, totalPrice } = await this.preparePriceForPayment(weddingId);
      // Get data wedding
      const dataWeeding = await this.getWeddingById({id: weddingId});
      if(!dataWeeding) throw new NotFoundException(`No wedding data id: ${weddingId}`);
      const weddingDate = new Date(dataWeeding.wedding_date);
      const isPenalty = dataWeeding["is_penalty_mode"]
      const deposit = await this.getDeposit(weddingId)
      const depositRequire = deposit * totalPrice / 100

      // Get penalty 
      const extraFee = await this.getPenalty(totalPrice, isPenalty, weddingDate);
      /*=============
      PREVIOUS DEPOSIT
      ===============*/

      // check exist bill
      const bills = await this.billService.getBillsByWeddingId(weddingId);

      // calculate remain price
      const { remainPrice } = this.calculateRemainPrice({
        bills,
        isPenalty: isPenalty,
        extraFee,
        totalPrice,
        transactionAmount
      })
      if(typeof remainPrice === 'string') {
        return { msg: remainPrice }
      }

      // deposit
      if(transactionAmount < depositRequire) {
        throw new UnprocessableEntityException(`deposit amount for this lobby need to be ${deposit}% <=> ${depositRequire}`);
      }

      // final data
      finalData = {
        ...finalData,
        totalPrice: totalPrice,
        weddingData: dataWeeding,
        "deposit_amount": transactionAmount,
        "remain": remainPrice,
        "foodPrice": foodPrice,
        "servicePrice": servicePrice,
        extraFee
      }

      // create bill
      await this.billService.createBill({
        wedding_id: weddingId,
        service_total_price: servicePrice,
        food_total_price: foodPrice,
        total_price: totalPrice,
        deposit_require: deposit,
        deposit_amount: transactionAmount,
        remain_amount: remainPrice,
        extra_fee: extraFee,
      })


      return finalData;

    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Full pay deposit
  async fullPayOrder(
    transactionAmount:number,
    weddingId:string
  ) {
    try {
      
      let finalData:{
        extraFee?: number,
        totalPrice?: number,
        weddingData?: WeddingInterface,
        deposit_amount?: number,
        remain?: number,
        foodPrice?: number,
        servicePrice?: number,
      } = {}
      // calc price
      const { foodPrice, servicePrice, totalPrice } = await this.preparePriceForPayment(weddingId);
      // Get data wedding
      const dataWeeding = await this.getWeddingById({id: weddingId});
      if(!dataWeeding) throw new NotFoundException(`No wedding data id: ${weddingId}`);

      const weddingDate = new Date(dataWeeding.wedding_date);
      const isPenalty = dataWeeding["is_penalty_mode"]

      // Get penalty 
      const extraFee = await this.getPenalty(totalPrice, isPenalty, weddingDate);

      /*=============
      PREVIOUS DEPOSIT
      ===============*/

      // check exist bill
      const bills = await this.billService.getBillsByWeddingId(weddingId);

      // if bill exist
      const { remainPrice, newTotalPrice } = this.calculateRemainPrice({
        bills,
        isPenalty: isPenalty,
        extraFee,
        totalPrice,
        transactionAmount
      })
      if(typeof remainPrice === 'string') {
        return { msg: remainPrice }
      }
      
      if(remainPrice > 0) {
        return { msg: `payment is not enough, you paid: ${transactionAmount} in total: ${newTotalPrice}`};
      }
       // update inventory
      const foodDataWedding = await this.prisma.foodOrder.findMany({
        where: {
          "wedding_id": weddingId
        }
      })
      await this.modifyInventory(foodDataWedding);
      // final data
      finalData = {
        ...finalData,
        totalPrice: totalPrice,
        weddingData: dataWeeding,
        "deposit_amount": transactionAmount,
        "remain": remainPrice,
        "foodPrice": foodPrice,
        "servicePrice": servicePrice,
        extraFee
      }
      // get deposit data
      const deposit = await this.getDeposit(weddingId)

      // create bill
      await this.billService.createBill({
        wedding_id: weddingId,
        service_total_price: servicePrice,
        food_total_price: foodPrice,
        total_price: totalPrice,
        deposit_require: deposit,
        deposit_amount: transactionAmount,
        remain_amount: remainPrice,
        extra_fee: extraFee
      })


      return finalData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async togglePenalty(weddingId:string) {
    try {
      let totalPrice = 0
      const wedding = await this.getWeddingById({id: weddingId});

      const currentState = wedding['is_penalty_mode']

      const order = await this.prisma.wedding.findUnique({
        where: { id: weddingId, },
        include: { 
          Bill: {
            orderBy: {
              "created_at": 'desc'
            }
          },
        },
      })
      
      const bill = order.Bill[0]
      totalPrice = bill.total_price
      // if(!currentState) {
      //   
      //   const penalData = calcPenalty(orderDate, new Date(), totalPrice)
        
      //   if(penalData.isPenal) {
      //     totalPrice = penalData.extraFee + totalPrice
      //     extraFee = penalData.extraFee
      //   }
      // }
      const weddingDate = new Date(order.wedding_date)
      const extraFee = await this.getPenalty(totalPrice, !currentState, weddingDate);
      // calculate remain price
      const { remainPrice } = this.calculateRemainPrice({
        bills: order.Bill,
        isPenalty: !currentState,
        extraFee,
        totalPrice,
      })

      const result = await this.prisma.wedding.update({
        where: { id: weddingId, },
        data: { "is_penalty_mode": !currentState, },
      })

      const finalResult = {
        is_penalty_mode : result['is_penalty_mode'],
        total: totalPrice,
        extraFee,
        remainPrice
      }

      return finalResult;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
