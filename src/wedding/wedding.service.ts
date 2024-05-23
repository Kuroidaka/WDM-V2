import { CustomerInterface } from './../customer/customer.interface';
import { ServiceWeddingService } from './../service_wedding/service_wedding.service';

import { BadGatewayException, BadRequestException, ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createWeddingDto } from './dto/create_wedding.dto';
import { CustomerService } from 'src/customer/customer.service';
import { LobbyService } from 'src/lobby/lobby.service';
import { LobbyIncludedLobType } from 'src/lobby/lobby.interface';
import { WeddingIDInterface, WeddingInterface, WeddingUpdateInterface, foodOrderWedding, serviceOrder, serviceOrderWedding } from './wedding.interface';
import { FoodService } from 'src/food/food.service';
import { FoodInterFace } from 'src/food/food.interface';
import { ServiceInterFace } from 'src/service_wedding/service.interface';
import { calculateTimeDifference } from 'utils';
import { BillService } from 'src/bill/bill.service';
import { BillInterface } from 'src/bill/bill.interface';
import { Bill, Customer, Lobby, Wedding, Shift } from '@prisma/client';
import { updateWeddingDto } from './dto/update_wedding.dto';

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
  adjustDate = (date) => {
    const newDate = new Date(date);
    // Set hours, minutes, seconds, and milliseconds to 0
    newDate.setHours(0, 0, 0, 0);

    return newDate;
  };

 filterByShiftIds = (shiftList:Shift[], weddingList:Wedding[]) => {
    const shiftIds = shiftList.map(item => item.id);
    return weddingList.filter(item => shiftIds.includes(item.shift_id));
  };

  async searchWeddingByDateForLob(date:string, shift_list:Shift[] = [], lobby_id:string) {
    try{
      const newDate = this.adjustDate(date)

      const weddings = await this.prisma.wedding.findMany({
        where: {
          wedding_date: newDate,
        },
        distinct: ['id'], 
        include: {
          Bill: {
            orderBy: {
              payment_date: 'desc',
            },
          },
          Customer: true,
          Lobby: true,
          Shift: true
        }
      });

      const weddingList = weddings.map(data => {
        if (data.lobby_id === lobby_id) {
          if (data.Bill.length > 0) {
            const hasDeposit = data.Bill.some(bill => bill.deposit_amount > 0);
            const isPaid = data.Bill[0].remain_amount <= 0;
      
            if (!hasDeposit) {
              return { ...data, status: "pending" };
            }
            if (isPaid) {
              return { ...data, status: "paid" };
            }
            return { ...data, status: "deposit" };
          }
          return { ...data, status: "pending" };
        }
        return null;
      }).filter(data => data !== null);

      let result = []
      if(weddingList.length > 0 ) {
        result = shift_list.length > 0 ? this.filterByShiftIds(shift_list, weddingList) : []
      }
      
      return result;
    }catch(error) {
      console.log(error)
      throw error;
    }
  }

  async searchWeddingByDateForReport(date:string) {
    try{
      // const newDate = new Date(date)
      // const timezoneOffset = -7 * 60 * 60 * 1000; // convert hours to milliseconds
      // const adjustedStartDate = new Date(newDate.getTime() + timezoneOffset);
      // console.log(adjustedStartDate)
      const weddings = await this.prisma.wedding.findMany({
        where: {
          wedding_date: new Date(date),
        },
        distinct: ['id'], 
        include: {
          Bill: {
            orderBy: {
              payment_date: 'desc',
            },
          },
          Customer: true,
          Lobby: true
        }
      });

      const weddingList = weddings.map(data => {
        // const Bill = data.Bill.reduce(
        //   (mainBill, currentBill) =>
        //     mainBill.payment_date < currentBill.payment_date
        //       ? currentBill
        //       : mainBill,
        //   data.Bill[0]
        // );

        if(data.Bill.length > 0) {
          if(!data.Bill.some(bill => bill['deposit_amount'] > 0)) 
            return {...data, status: "pending"} 
          if(data.Bill[0]["remain_amount"] <= 0)
            return {...data, status: "paid"}
          return {...data, status: "deposit"} 
        }
        return {...data, status: "pending"} 
      })
      
      return weddingList;
    }catch(error) {
      console.log(error)
      throw error;
    }
  }
  // Get Order services + foods
  async getFoodsCartByWedding(wedding_id:string) {
    try {

      // check wedding exist 
      const check = await this.getWeddingById({id: wedding_id});
      if(!check) throw new NotFoundException(`Wedding not found for id: ${wedding_id}`)

      const foods = await this.prisma.foodOrder.findMany({
        where: {
          wedding_id
        }
      })
      

      return this.cleanObjectOrderResponse(foods)

    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getServicesCartByWedding(wedding_id:string) {
    try {
      // check wedding exist 
      const check = await this.getWeddingById({id: wedding_id});
      if(!check) throw new NotFoundException(`Wedding not found for id: ${wedding_id}`)

      const service = await this.prisma.serviceOrder.findMany({
        where: { wedding_id }
      })

      return this.cleanObjectOrderResponse(service);

    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getFoodsOrderByWedding(wedding_id:string) {
    try {

      // check wedding exist 
      const check = await this.getWeddingById({id: wedding_id});
      if(!check) throw new NotFoundException(`Wedding not found for id: ${wedding_id}`)

      const orderFoods = await this.prisma.foodOrder.findMany({
        where: {
          wedding_id
        }
      })

      let allFoods = await this.foodService.findAllFood()

      allFoods = allFoods.map(food => {
        const qty = orderFoods.find(orderFood => orderFood.food_id === food.id)?.count || 0

        return {...food, quantity: qty}
      })

      return allFoods

    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getServicesOrderByWedding(wedding_id:string) {
    try {
      // check wedding exist 
      const check = await this.getWeddingById({id: wedding_id});
      if(!check) throw new NotFoundException(`Wedding not found for id: ${wedding_id}`)

      const serviceOrdered = await this.prisma.serviceOrder.findMany({
        where: { wedding_id }
      })

      let allServices = await this.serviceWeddingService.findServices()

      allServices = allServices.map(service => {
        const qty = serviceOrdered.find(orderService => orderService.service_id === service.id)?.count || 0

        return {...service, quantity: qty}
      })

      return allServices

    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  cleanObjectOrderResponse(OrderList:(serviceOrderWedding[] | foodOrderWedding[])) {
    return OrderList.map(order => {
      const { id, wedding_id, ...dataOrder } = order;
      
      return dataOrder
    })
  }

  async searchWeddingByPhone(phone:string){
    try {

      const queryObject:{
        where?: any,
        orderBy?: any,
        include: {
          Bill?: any,
          Customer: boolean,
          Lobby: {
            include: {  LobType: boolean, }
          },
          Shift: true
        }
      } = {
        where: {
          Customer: {
            phone:phone
          }
        },
        orderBy: {
          "created_at": 'desc'
        },
        include: {
          Bill: {
            orderBy: {
                "created_at": 'desc'
            }
          },
          Shift: true,
          Customer: true,
          Lobby: {
            include: {
              LobType: true
            }
          }
        }
      };

      if(phone === "") {
        queryObject.where = {}
      }

      const weddings = await this.prisma.wedding.findMany(queryObject)

      const weddingList = weddings.map(data => {
        if(data.Bill.length > 0) {
          if(!data.Bill.some(bill => bill['deposit_amount'] > 0)) 
            return {...data, status: "pending"} 
          if(data.Bill[0]["remain_amount"] <= 0)
            return {...data, status: "paid"}
          return {...data, status: "deposit"} 
        }
        return {...data, status: "pending"} 
      })
      return this.formatDataWedding(weddingList)
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
        orderBy?: any,
        include: {
          Bill?: any,
          Customer: boolean,
          Lobby: {
            include: {  LobType: boolean, }
          },
          Shift: boolean
        }
      } = {
        include: {
          Bill: true,
          Customer: true,
          Lobby: {
            include: {
              LobType: true
            }
          },
          Shift: true
        }
      };

      if(bill) {
        queryObject = { 
          ...queryObject,
          orderBy: {
            "created_at": 'desc'
          },
          include: {
            ...queryObject.include,
            Bill: {
              orderBy: {
                  "payment_date": 'desc'
              }
            }
        }}
      }

      const weddingData = await this.prisma.wedding.findMany(queryObject);
      const weddingList = weddingData.map(data => {
        // const Bill = data.Bill.reduce(
        //   (mainBill, currentBill) =>
        //     mainBill.payment_date < currentBill.payment_date
        //       ? currentBill
        //       : mainBill,
        //   data.Bill[0]
        // );

        if(data.Bill.length > 0) {
          if(!data.Bill.some(bill => bill['deposit_amount'] > 0)) 
            return {...data, status: "pending"} 
          if(data.Bill[0]["remain_amount"] <= 0)
            return {...data, status: "paid"}
          return {...data, status: "deposit"} 
        }
        return {...data, status: "pending"} 
      })
      
      return this.formatDataWedding(weddingList);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  formatDataWedding(weddingList:WeddingInterface[]) {
    const renderData = []
    for(const wedding of weddingList ) {
      const Bill = wedding.Bill.reduce(
        (mainBill, currentBill) =>
          mainBill.payment_date < currentBill.payment_date
            ? currentBill
            : mainBill,
        wedding.Bill[0]
      );
      const newData = {
        ...wedding,
        ...Bill,
        shift: wedding.Shift.name,
        shift_id: wedding.Shift.id,
        customer_name: `${wedding.groom}/${wedding.bride}`,
        phone: wedding.Customer.phone,
        lobby_name: wedding.Lobby.name,
        id: wedding.id,
      };
      renderData.push(newData)
    }
    return renderData
  }

  async getWeddingsInMonth(year:number, month:number) {
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    // // Adjust start and end dates to account for the timezone difference
    // const timezoneOffset = +7 * 60 * 60 * 1000; // convert hours to milliseconds
    // const adjustedStartDate = new Date(startDate.getTime() + timezoneOffset);
    // const adjustedEndDate = new Date(endDate.getTime() + timezoneOffset);
    
    try {
      const weddings = await this.prisma.wedding.findMany({
        where: {
          AND: [
          {wedding_date: {gte: startDate, }},
          {wedding_date: {lte: endDate, }}
          ]
        },
        include: {
          Bill: true, // assuming you want to include related bills
          Shift: true
        }
      });

      return weddings;
    } catch (error) {
      console.error('Error fetching weddings:', error);
      throw error;
    }
  }
  async getWeddingById({id, bill,}:{id:string, bill?: boolean}) {
    try {
      let queryObject:{
        where: { id:string,},
        include?: {
          Bill?: any,
          Customer: boolean,
          Lobby: {
            include: {  LobType: boolean, }
          },
          Shift: boolean
        },
      } = { 
        where: { id, },
        include: {
          Customer: true,
          Lobby: {
            include: {
              LobType: true
            }
          },
          Shift: true,
          Bill: true
        }
      }

      if(bill){
          queryObject = { ...queryObject, include: {
          ...queryObject.include,
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

  async getWeddingByIdWithStatus(weddingId:string) {
    try {
      const wedding:WeddingInterface = await this.getWeddingById({id: weddingId, bill: true})
      let status = ''
      if(wedding.Bill.length > 0) {
        if(!wedding.Bill.some(bill => bill['deposit_amount'] > 0)) 
          status = "pending"
        if(wedding.Bill[0]["remain_amount"] <= 0)
          status= "paid"
        else {
          status= "deposit"
        }
      }
      else {
        status = "pending"
      } 

      return {status, ...wedding}
    } catch (error) {
      console.log(error)
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
        shift_id,
        table_count,
      } = dataCreate;
  
      // Check phone number exist
      if (!phone) throw new BadRequestException('Missing phone number');
  
      // Check exist customer with phone number
      let customer = await this.customerService.findByPhone(phone);
  
      if (!customer) {
        const name = `${groom}/${bride}`;
        customer = await this.customerService.createCustomer(name, phone);
      }
      
      // Validate lobby
      const lobby: LobbyIncludedLobType = await this.lobbyService.getLobbyById(lobby_id, false);
      if (!lobby) throw new NotFoundException('Lobby not found');
  
      // Check valid max table number
      if (table_count > lobby.LobType["max_table_count"]) throw new BadRequestException(`This lobby's max table is ${lobby.LobType["max_table_count"]} - (your order: ${table_count})`);
  
      // Check valid lobby and date for wedding
      const eventOnDate = await this.findEventOnDate(wedding_date);
  
      const isValidDateAndLob = eventOnDate.some(data => data.shift_id === shift_id && data.lobby_id === lobby_id)

      if (isValidDateAndLob) throw new ConflictException('This date & shift had a wedding');
  
      // Create wedding 
      const newWedding = await this.prisma.wedding.create({
        data: {
          groom,
          bride,
          wedding_date: new Date(wedding_date),
          shift_id,
          lobby_id,
          customer_id: customer.id,
          table_count,
          note,
        }
      });
  

      // const result = await this.getWeddingById({id: newWedding.id, bill: true})
  

      return newWedding;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateWedding(weddingID:string, dataUpdate:updateWeddingDto) {
    try {
  
      // check wedding exist
      const oldWeddingData = await this.getWeddingById({id: weddingID}) as Wedding & { Lobby: Lobby } & { Customer: Customer };
      if(!oldWeddingData) throw new NotFoundException(`Wedding not found for id: ${weddingID}`);

      const objectUpdate: WeddingUpdateInterface = {}

      // Check phone number exist
      let customer:CustomerInterface = {}
      let phone = oldWeddingData.Customer.phone;
      if(dataUpdate?.phone && dataUpdate?.phone !== oldWeddingData.Customer.phone) {
        phone = dataUpdate.phone;
      }
      
      // Check exist customer with phone number
      customer = await this.customerService.findByPhone(phone) as CustomerInterface;
  
      if(!customer) { //If customer with phone number is not exist 
        const groom = dataUpdate?.groom || oldWeddingData.groom;
        const bride = dataUpdate?.bride || oldWeddingData.bride;
        
        // create new customer
        const name = `${groom}/${bride}`;
        customer = await this.customerService.createCustomer(name, phone) as CustomerInterface;
        objectUpdate.groom = groom;
        objectUpdate.bride = bride;
      }
      else {

        let groom = oldWeddingData.groom;
        let bride = oldWeddingData.bride;

        if(dataUpdate?.groom) {
          groom = dataUpdate?.groom
          objectUpdate.groom = groom
        }
        if(dataUpdate?.bride) {
          bride = dataUpdate?.bride
          objectUpdate.bride = bride
        }
      }

      objectUpdate.customer_id = customer.id;
  
      // valid lobby
      let lobby_id = oldWeddingData?.lobby_id;
      if(dataUpdate?.lobby_id) {
        lobby_id = dataUpdate?.lobby_id;
        objectUpdate.lobby_id = lobby_id;
      }
      // check exist lobby
      const lobby:LobbyIncludedLobType = await this.lobbyService.getLobbyById(lobby_id, false);
      if(!lobby) throw new NotFoundException('Lobby not found')

      // Check valid max table number and update table count
      let table_count = oldWeddingData.table_count;
      if(dataUpdate?.table_count){
        table_count = dataUpdate?.table_count 
        objectUpdate.table_count = table_count;
        
        if(table_count > lobby.LobType["max_table_count"]) throw new BadRequestException(`This lobby's max table is ${lobby.LobType["max_table_count"]} - (your order: ${table_count})`)
        // check valid lob min price
        const { foodPrice } = await this.preparePriceForPayment(weddingID);
        const minTablePrice = lobby.LobType["min_table_price"];
        const lobName = lobby.name;
        const lobTypeName = lobby.LobType.type_name;
        const tablePrice = foodPrice/table_count;
        if(tablePrice < minTablePrice) {
          throw new BadGatewayException (`Lobby ${lobName} (Type ${lobTypeName}) : min table price ${minTablePrice}(your: ${tablePrice})`)
        }
      }

      let wedding_date = oldWeddingData?.wedding_date;
      if(dataUpdate?.wedding_date) {
        wedding_date = new Date(dataUpdate?.wedding_date);
        objectUpdate.wedding_date = wedding_date;
      }
      const eventOnDate = await this.findEventOnDate(wedding_date);

      // Check valid shift and date for weeding
      let shift_id = oldWeddingData?.shift_id;

      if(dataUpdate?.shift_id) {
        shift_id = dataUpdate?.shift_id;
        objectUpdate.shift_id = shift_id;
      }
      if(dataUpdate?.shift_id || dataUpdate?.wedding_date || dataUpdate?.lobby_id) {

        const isValidDateAndLob = eventOnDate.find(data => data.shift_id === shift_id && data.lobby_id === lobby_id)
        if(isValidDateAndLob && isValidDateAndLob.id !== weddingID) throw new ConflictException('This date & shift had a wedding');
      }

      if(dataUpdate?.note) objectUpdate.note = dataUpdate?.note;

      // Create wedding 
      const updatedWedding = await this.prisma.wedding.update({
        where: { id: weddingID, },
        data: objectUpdate,
      })

      const result = await this.getWeddingById({id: weddingID, bill: true})
  
      return result
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  // async calculateFoodPrice() {
  //   try {
      
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // }

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
        
        for(const food of foods) {
          
          const foodOrder = await this.prisma.foodOrder.findMany({
            where: {
              AND: [
                {"wedding_id": weddingId},
                {"food_id": food.id}
              ]
            }
          })

          const oldInven = foodOrder.length > 0 ? foodOrder[0].count : 0

          const foodData = await this.prisma.food.findUnique({
            where: { id: food.id }
          })

          await this.prisma.food.update({
            where: {
              id: food.id
            },
            data: {
              inventory: foodData.inventory + oldInven
            }
          })

        }
        
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
        foods: {id:string, count:number, food_id?:string}[],
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

        //calc food price for each table
        for (const food of foods) {
          // check exist food
          const foodID = food.id
          food.food_id = food.id
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

        await this.modifyInventory(foods)
        // check valid lob min price
        if(tablePrice < minTablePrice) {
          throw new BadGatewayException (`Lobby ${lobName} (Type ${lobTypeName}) : min table price ${minTablePrice}(your: ${tablePrice})`)
        }

        return {
          msg: errorFoodList,
          totalPrice,
          tablePrice
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

      await resetFoodOrder(weddingId);

      const result = await foodOrderProcess({
        foods,
        tableCount,
        weddingId,
        minTablePrice,
        lobName,
        lobTypeName
      });

      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async editFoodOrderForWedding(weddingId:string, foods:{id:string, count:number}[]) {
    try {
      // check exist weeding 
      const checkWedding = await this.getWeddingById({id:weddingId});
      if(!checkWedding) throw new NotFoundException(`Wedding not found for id: ${weddingId}`)
        
      await this.orderFood(weddingId, foods);

      let finalData:{
        extraFee?: number,
        totalPrice?: number,
        weddingData?: WeddingInterface,
        remainPrice?: number,
        foodPrice?: number,
        servicePrice?: number,
      } = {}
      // calc price
      const { foodPrice, servicePrice, totalPrice } = await this.preparePriceForPayment(weddingId);
      // Get data wedding
      const weddingData = await this.getWeddingById({id: weddingId});
      if(!weddingData) throw new NotFoundException(`No wedding data id: ${weddingId}`);
      const weddingDate = new Date(weddingData.wedding_date);
      const isPenalty = weddingData["is_penalty_mode"]
      const deposit = await this.getDeposit(weddingId)

      // Get penalty 
      const extraFee = await this.getPenalty(totalPrice, isPenalty, weddingDate);
      /*=============
      PREVIOUS DEPOSIT
      ===============*/

      // check exist bill
      const bills = await this.billService.getBillsByWeddingId(weddingId);
  

      // calculate remain price
      const { remainPrice, newTotalPrice } = await this.calculateRemainPriceForEdit({
        bills,
        isPenalty,
        extraFee,
        totalPrice,
        weddingId
      })

       // final data
      finalData = {
        totalPrice,
        remainPrice,
        foodPrice,
        servicePrice,
        extraFee,
        weddingData,
      }

      // create bill
      // await this.billService.createBill({
      //   wedding_id: weddingId,
      //   service_total_price: servicePrice,
      //   food_total_price: foodPrice,
      //   total_price: totalPrice,
      //   deposit_require: deposit,
      //   deposit_amount: 0,
      //   remain_amount: remainPrice,
      //   extra_fee: extraFee,
      // })


      return finalData
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
  async editServiceOrderForWedding(weddingId:string, services:{id:string, count:number}[]) {
    try {
      // check exist weeding 
      const checkWedding = await this.getWeddingById({id:weddingId});
      if(!checkWedding) throw new NotFoundException(`Wedding not found for id: ${weddingId}`)
        
      await this.orderService(weddingId, services);

      let finalData:{
        extraFee?: number,
        totalPrice?: number,
        weddingData?: WeddingInterface,
        remainPrice?: number,
        foodPrice?: number,
        servicePrice?: number,
      } = {}
      // calc price
      const { servicePrice, foodPrice, totalPrice } = await this.preparePriceForPayment(weddingId);
      // Get data wedding
      const weddingData = await this.getWeddingById({id: weddingId});
      if(!weddingData) throw new NotFoundException(`No wedding data id: ${weddingId}`);
      const weddingDate = new Date(weddingData.wedding_date);
      const isPenalty = weddingData["is_penalty_mode"]
      const deposit = await this.getDeposit(weddingId)

      // Get penalty 
      const extraFee = await this.getPenalty(totalPrice, isPenalty, weddingDate);
      /*=============
      PREVIOUS DEPOSIT
      ===============*/

      // check exist bill
      const bills = await this.billService.getBillsByWeddingId(weddingId);
  

      // calculate remain price
      const { remainPrice, newTotalPrice } = await this.calculateRemainPriceForEdit({
        bills,
        isPenalty,
        extraFee,
        totalPrice,
        weddingId
      })

       // final data
      finalData = {
        totalPrice,
        remainPrice,
        servicePrice,
        foodPrice,
        extraFee,
        weddingData,
      }

      // create bill
      // await this.billService.createBill({
      //   wedding_id: weddingId,
      //   service_total_price: servicePrice,
      //   food_total_price: foodPrice,
      //   total_price: totalPrice,
      //   deposit_require: deposit,
      //   deposit_amount: 0,
      //   remain_amount: remainPrice,
      //   extra_fee: extraFee,
      // })


      return finalData
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async modifyInventory(foodList:{id?:string, count:number, food_id?:string}[]) {

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

  async getPenalty(totalPrice:number, isPenalty:boolean, weddingDate:Date, payment_date?:Date) {
    // check penalty 
    let extraFee = 0
    if(isPenalty) {
      const payDate = payment_date ? new Date(payment_date) : new Date()
      // "Sun Mar 03 2024 13:54:30 GMT+0700 (Indochina Time)"
      const timeDifference = calculateTimeDifference(weddingDate, payDate);

      if(timeDifference.days > 0) {
        extraFee = timeDifference.days* (totalPrice / 100)
      }
    }

    return extraFee;
  }

  async getCurrentDepositForWedding(weddingID:string) {
    try {
      const weddingData = await this.prisma.wedding.findUnique({
        where: { id: weddingID, },
        include: { Bill: true, },
      }) as Wedding & { Bill: Bill[] };

      if(!weddingData) throw new NotFoundException(`Wedding not found for id: ${weddingID}`)

      if (weddingData.Bill) {
          let totalDeposit = 0;
        weddingData.Bill.forEach(bill => {
          totalDeposit += bill.deposit_amount;
        });
        return totalDeposit;
      }

      return 0
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  calculateRemainPrice ({
    bills,
    isPenalty,
    isForPayment=true,
    extraFee,
    totalPrice,
    transactionAmount=0,
  }: {
    bills:BillInterface[],
    isPenalty:boolean,
    extraFee:number,
    isForPayment?: boolean,
    totalPrice:number,
    transactionAmount?:number,
  }):{
    remainPrice: number | null,
    newTotalPrice?: number
  } {
    const recentBill = bills[0]
    let remainPrice = 0;
    let newTotalPrice = 0
    if(bills.length > 0) { //deposit before

      if(recentBill['remain_amount'] <= 0) {
        if(isForPayment) return { remainPrice: null };
        else return { remainPrice: recentBill['remain_amount'] };
      }

      newTotalPrice = recentBill['remain_amount']
      // calc remain price
      if(!isPenalty && recentBill["extra_fee"] > 0) { // Turn off penalty
        newTotalPrice -= recentBill["extra_fee"] 
      }
      else if(isPenalty && recentBill["extra_fee"] === 0) { // Turn on penalty
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

  
  async calculateRemainPriceForEdit ({
    bills,
    isPenalty,
    extraFee,
    totalPrice,
    weddingId
  }: {
    bills:BillInterface[],
    isPenalty:boolean,
    extraFee:number,
    totalPrice:number,
    transactionAmount?:number,
    weddingId:string,
  }): Promise<{ remainPrice: number | null, newTotalPrice?: number}> {
    const recentBill = bills[0]
    let remainPrice = 0;
    let newTotalPrice = 0
    if(bills.length > 0) { //deposit before
      const depositUptoNow = await this.getCurrentDepositForWedding(weddingId);
      // calc remain price
      if(!isPenalty && recentBill["extra_fee"] > 0 || !isPenalty) { // Turn off penalty
        remainPrice = totalPrice - depositUptoNow;
      }
      else if(isPenalty && recentBill["extra_fee"] === 0 || isPenalty) { // Turn on penalty
        remainPrice = totalPrice + extraFee - depositUptoNow
      }
    }
    else { //first time payment (no deposit before)
      // calc remain price
      newTotalPrice = totalPrice
      if(isPenalty) {
        newTotalPrice = totalPrice + extraFee 
      } 
      remainPrice = newTotalPrice
    }

    return {
      remainPrice: remainPrice,
      newTotalPrice
    }
  }

  // Deposit
  // async processDataForNewBill(
  //   transactionAmount:number,
  //   weddingId:string
  // ):Promise<{ extraFee?: number; totalPrice?: number; weddingData?: WeddingInterface; deposit_amount?: number; remain?: number; foodPrice?: number; servicePrice?: number; newTotalPrice?: number; }>
  // {
  //   try {
      
      
  //     // final data
  //     finalData = {
  //       totalPrice: totalPrice,
  //       weddingData: dataWeeding,
  //       deposit_amount: transactionAmount,
  //       remain: remainPrice,
  //       foodPrice: foodPrice,
  //       servicePrice: servicePrice,
  //       extraFee
  //     }

  //     return finalData

  //     // if(remainPrice === null) {
  //     //   return { msg: `Your bill have been fully paid` }
  //     // }

  //     // // create bill
  //     // await this.billService.createBill({
  //     //   wedding_id: weddingId,
  //     //   service_total_price: servicePrice,
  //     //   food_total_price: foodPrice,
  //     //   total_price: totalPrice,
  //     //   deposit_require: deposit,
  //     //   deposit_amount: transactionAmount,
  //     //   remain_amount: remainPrice,
  //     //   extra_fee: extraFee,
  //     // })


  //     // return finalData;

  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // }
  // Deposit
  async depositOrder(
    transactionAmount:number,
    weddingId:string,
    payment_date:Date
  ) {
    try {
     
      let finalData:{
        extraFee?: number,
        totalPrice?: number,
        weddingData?: WeddingInterface,
        deposit_amount?: number,
        remainPrice?: number,
        foodPrice?: number,
        servicePrice?: number,
      } = {}
      // calc price
      const { foodPrice, servicePrice, totalPrice } = await this.preparePriceForPayment(weddingId);
      // Get data wedding
      const weddingData = await this.getWeddingById({id: weddingId, bill:true});
      if(!weddingData) throw new NotFoundException(`No wedding data id: ${weddingId}`);
      const weddingDate = new Date(weddingData.wedding_date);
      const isPenalty = weddingData["is_penalty_mode"]
      const deposit = await this.getDeposit(weddingId)

      // Get penalty 
      const extraFee = await this.getPenalty(totalPrice, isPenalty, weddingDate, payment_date);
      /*=============
      PREVIOUS DEPOSIT
      ===============*/

      // check exist bill
      const bills = await this.billService.getBillsByWeddingId(weddingId);

      // calculate remain price
      const { remainPrice, newTotalPrice } = this.calculateRemainPrice({
        bills,
        isPenalty: isPenalty,
        extraFee,
        totalPrice,
        transactionAmount
      })

      if(remainPrice === null) {
        return { msg: `Your bill have been fully paid` }
      }

      // deposit
      const depositRequire = deposit * totalPrice / 100
      if(transactionAmount < depositRequire && transactionAmount < remainPrice) {
        throw new UnprocessableEntityException(`deposit amount for this lobby need to be ${deposit}% <=> ${depositRequire}`);
      }

      // final data
      finalData = {
        totalPrice,
        weddingData,
        deposit_amount:transactionAmount,
        remainPrice,
        foodPrice,
        servicePrice,
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
        payment_date: payment_date
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
    weddingId:string,
    payment_date:Date
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
      const dataWeeding = await this.getWeddingById({id: weddingId, bill:true});
      if(!dataWeeding) throw new NotFoundException(`No wedding data id: ${weddingId}`);

      const weddingDate = new Date(dataWeeding.wedding_date);
      const isPenalty = dataWeeding["is_penalty_mode"]

      // Get penalty 
      const extraFee = await this.getPenalty(totalPrice, isPenalty, weddingDate, payment_date);

      /*=============
      PREVIOUS DEPOSIT
      ===============*/

      // check exist bill
      const bills = await this.billService.getBillsByWeddingId(weddingId);

      // check bill paid
      if(bills.length > 0) {
        if(bills[0].remain_amount < 0)  throw new BadRequestException(`bill have been fully paid`)
      }

      // if bill exist
      const { remainPrice, newTotalPrice } = this.calculateRemainPrice({
        bills,
        isPenalty: isPenalty,
        extraFee,
        totalPrice,
        transactionAmount
      })

      if(remainPrice === null)  throw new BadRequestException(`bill have been fully paid`);
      
      if(remainPrice > 0) {
        throw new BadRequestException(`payment is not enough, you paid: ${transactionAmount} in total: ${newTotalPrice}`)
      }
       // update inventory
      const foodDataWedding = await this.prisma.foodOrder.findMany({
        where: {
          "wedding_id": weddingId
        }
      })
      // await this.modifyInventory(foodDataWedding);
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
        extra_fee: extraFee,
        payment_date: payment_date
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
      
      const { totalPrice:newTotalPrice } = await this.preparePriceForPayment(weddingId);
      totalPrice = newTotalPrice
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
      const { remainPrice } = await this.calculateRemainPrice({
        bills: order.Bill,
        isPenalty: !currentState,
        extraFee,
        totalPrice,
        isForPayment: false
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
  async getExtraFeeForWedding(weddingId:string) {
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
      
      const { totalPrice:newTotal } = await this.preparePriceForPayment(weddingId);
      totalPrice = newTotal

      const weddingDate = new Date(order.wedding_date)
      const extraFee = await this.getPenalty(totalPrice, currentState, weddingDate);
      // calculate remain price

      return extraFee;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getDataForBillPage(weddingId:string) {
    try {

      const weddingData:WeddingInterface = await this.getWeddingById({id: weddingId, bill:true})

      const { foodPrice, servicePrice, totalPrice } = await this.preparePriceForPayment(weddingId);

      const extraFee = await this.getExtraFeeForWedding(weddingId)

      const { remainPrice } = await this.calculateRemainPrice({
        bills: weddingData.Bill,
        isPenalty: weddingData.is_penalty_mode,
        extraFee,
        totalPrice,
        isForPayment: false
      })

      return {
        foodPrice,
        servicePrice,
        totalPrice: extraFee + totalPrice,
        extraFee,
        remainPrice
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  } 

  async deleteWedding(weddingId: string) {
    try {
      await this.prisma.$transaction(async (transaction) => {
        // Delete related records in the correct order
        await transaction.bill.deleteMany({
          where: { wedding_id: weddingId },
        });
        
        await transaction.foodOrder.deleteMany({
          where: { wedding_id: weddingId },
        });
        
        await transaction.serviceOrder.deleteMany({
          where: { wedding_id: weddingId },
        });
        
        // Finally, delete the wedding record
        await transaction.wedding.delete({
          where: { id: weddingId },
        });
      });
  
      console.log('Wedding and related records deleted successfully.');
    } catch (error) {
      console.error('Error deleting wedding and related records:', error);
      throw error; // Re-throw the error to handle it in the calling function if needed
    } finally {
      await this.prisma.$disconnect();
    }
  }
  
}
