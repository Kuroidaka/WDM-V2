import { BillInterface } from 'src/bill/bill.interface';
import { WeddingService } from './../wedding/wedding.service';
import { Injectable } from "@nestjs/common";
import { BillService } from 'src/bill/bill.service';
import { PrismaService } from "src/prisma/prisma.service";
import { calcPenalty, convertAndFormatDate } from 'utils';
import { WeddingInterface } from 'src/wedding/wedding.interface';

@Injectable()
export class RevenueService {
  constructor(
    private prisma: PrismaService,
    private weddingService:WeddingService,
    private billService:BillService,

  ) {}



  async getListRevenue(isIncludeFee=false, wedding_month:number, wedding_year:number) { //junk function for the frontend
    try {
      const revenueSplitByDate = []
      // const billData = await this.billService.getBills()
      const weddingData = wedding_month && wedding_year 
        ? await this.weddingService.getWeddingsInMonth(wedding_year, wedding_month)
        : await this.weddingService.getWeddings()
      for(const wedding of weddingData) {
        
        if(wedding.Bill.length > 0){
          const bill = wedding.Bill.reduce((mainBill, currentBill) => 
            (mainBill.payment_date < currentBill.payment_date ? currentBill : mainBill ), wedding.Bill[0]);
          const formatDate = convertAndFormatDate(wedding['wedding_date'])
          const originalDate = formatDate.toISOString().split("T")[0]

          const parts = originalDate.split("-");  // ['2024', '04', '17']
          const date = `${parts[2]}-${parts[1]}-${parts[0]}`;  // '17-04-2024'
          const year = parts[0]
          const month = parts[1]
          const totalPriceByMonth = await this.totalWeddingRevenueByMonth({ year: Number(year), month: Number(month) })
          const index = revenueSplitByDate.findIndex(data => data?.day === date)
          const extra_fee = calcPenalty(wedding.wedding_date, new Date(), bill.total_price)
          const estimateTotalrevenue = isIncludeFee ?  bill.total_price + extra_fee.extraFee:  bill.total_price
          const realTotalRevenue = await this.weddingService.getCurrentDepositForWedding(wedding.id)
          
          
          if(index !== -1) {
            revenueSplitByDate[index].estimate_revenue += estimateTotalrevenue;
            revenueSplitByDate[index].real_revenue += realTotalRevenue;
            // revenueSplitByDate[index].ratio = estimateTotalrevenue/
            const ratio = revenueSplitByDate[index].estimate_revenue / totalPriceByMonth * 100
            revenueSplitByDate[index].ratio = Number(ratio.toFixed(2));
            revenueSplitByDate[index].totalPriceByMonth = totalPriceByMonth
          } else {
            const ratio = estimateTotalrevenue / totalPriceByMonth * 100
            revenueSplitByDate.push({
              day: date,
              estimate_revenue: estimateTotalrevenue,
              real_revenue: realTotalRevenue,
              ratio: Number(ratio.toFixed(2)),
              weddingnumber: 0,
              originalDate: wedding['wedding_date'],
              originalDate1: new Date(wedding['wedding_date']).toISOString(),
            })
          }


        }
      }     

      weddingData.forEach((wedding) => {
        const formatDate = convertAndFormatDate(wedding['wedding_date'])
        const originalDate = formatDate.toISOString().split("T")[0]

        const parts = originalDate.split("-");  // ['2024', '04', '17']
        const date = `${parts[2]}-${parts[1]}-${parts[0]}`;  // '17-04-2024'
        const year = parts[0]
        const month = parts[1]
        const index = revenueSplitByDate.findIndex(data => data?.day === date)
        if(index !== -1) {
          revenueSplitByDate[index].weddingnumber += 1;
        } else {
          revenueSplitByDate.push({
            day: date,
            estimate_revenue: 0,
            weddingnumber: 1
          })
        }
      })

      function formatDate(dateStr) {
        // Split the date string into parts
        const [day, month, year] = dateStr.split('-');
        // Return a new date string in ISO format: "YYYY-MM-DD"
        return `${year}-${month}-${day}`;
    }
    
      revenueSplitByDate.sort((a, b) => formatDate(a.day).localeCompare(formatDate(b.day)));
    
      return revenueSplitByDate
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getTotalRevenue(month?:number, year?:number) {
    try {
      const finalData:{
        weddingNum?:number,
        realRevenue?:number,
        estimateRevenue?:number,
      } = {};
      let weddingData
      if(month !== -1 && year !== -1)
        weddingData = await this.weddingService.getWeddingsInMonth(year, month)
      else 
        weddingData = await this.weddingService.getWeddings()

      // Number wedding
      const weddingNum = weddingData.length;
      finalData.weddingNum = weddingNum;

      // Real revenue
      const realRevenue = weddingData.reduce((total, data) => {
        const totalDeposit = data["Bill"].reduce((total, current) => {
          if(current["remain_amount"] < 0)
            return (total += (current["deposit_amount"] + current["remain_amount"]));
          return (total += current["deposit_amount"]);
        }, 0);

        return (total += totalDeposit);
      }, 0);
      finalData.realRevenue = realRevenue;

      // Estimate revenue
      const estimateRevenue = weddingData.reduce((total, data) => {
        let estimatePrice = 0;
        const weddingDate = data["wedding_date"];
        
        const totalPrice = data["Bill"].length > 0 ? data["Bill"][0]["total_price"] : 0;
        if (data["is_penalty_mode"]) {
          const penalData = calcPenalty(weddingDate, new Date(), totalPrice);
            const extraFee = penalData.extraFee || 0
            estimatePrice = extraFee + totalPrice;
        } else {
          estimatePrice = totalPrice;
        }

        return (total += estimatePrice);
      }, 0);
      finalData.estimateRevenue = estimateRevenue;

      return finalData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async totalWeddingRevenueByMonth({ year, month }: { year: number; month: number; }):Promise<number> {
    try{
      const weddingData = await this.weddingService.getWeddingsInMonth(year, month);

      // Real revenue
      const realRevenue = weddingData.reduce((total, data) => {
        // const totalDeposit = data["Bill"].reduce((total, current) => {
        //   return (total += current["deposit_amount"]);
        let totalPriceForWedding = 0;
        if(data["Bill"].length > 0) {
          const bill = data.Bill.reduce((mainBill, currentBill) => 
            (mainBill.payment_date < currentBill.payment_date ? currentBill : mainBill), data.Bill[0]);
          totalPriceForWedding = bill.total_price
        }
        return (total += totalPriceForWedding)
      }, 0);

      return realRevenue
    }catch (error) {
      console.log(error)
      throw error
    }
  }

  async getMonRevenue(month:number, year:number) {
    try {

      // calc payment amount in dates of specific month
      const bills = await this.billService.getMonthBills(month, year);

      // calculate revenue
      const monthRevenue = this.calculateTotalRevenueByDate(bills);

      return monthRevenue;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getMonthWedding(month:number, year:number){
    try {

      const weddings = await this.weddingService.getMonthWedding(month, year);

      const sortedWedding = this.sortWeddingByDate(weddings);

      return sortedWedding;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  calculateTotalRevenueByDate (bills:BillInterface[]) {
    const revenueSplitByDate = {}

    bills.forEach((bill) => {

      const date = bill['payment_date'].toISOString().split("T")[0]
      if(revenueSplitByDate[date]) {
        revenueSplitByDate[date].total += bill['deposit_amount']
      } else {
        revenueSplitByDate[date] = {
          total: bill['deposit_amount'],
          record: []
        }
      }
      revenueSplitByDate[date].record.push(bill)
    })

    // console.log(revenueSplitByDate)
    return revenueSplitByDate
  }

  sortWeddingByDate (weddings:WeddingInterface[]) {
    const weddingSplitByDate = {}

    weddings.forEach((wedding) => {

      const date = wedding['wedding_date'].toISOString().split("T")[0]
      if(weddingSplitByDate[date]) {
        weddingSplitByDate[date][wedding.shift] = []
        weddingSplitByDate[date][wedding.shift].push(wedding);
      } else {
        weddingSplitByDate[date] = { [wedding.shift]: [wedding]  }
      }
    })

    // console.log(weddingSplitByDate)
    return weddingSplitByDate
  }

  sortRevenueByDate (bills:BillInterface[]) {
    const revenueSplitByDate = []

  


    // console.log(revenueSplitByDate)
    return revenueSplitByDate
  }

  async temp() {
    try {
   
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
