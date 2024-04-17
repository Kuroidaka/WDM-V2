import { BillInterface } from 'src/bill/bill.interface';
import { WeddingService } from './../wedding/wedding.service';
import { Injectable } from "@nestjs/common";
import { BillService } from 'src/bill/bill.service';
import { PrismaService } from "src/prisma/prisma.service";
import { calcPenalty } from 'utils';
import { WeddingInterface } from 'src/wedding/wedding.interface';

@Injectable()
export class RevenueService {
  constructor(
    private prisma: PrismaService,
    private weddingService:WeddingService,
    private billService:BillService,

  ) {}

  async getListRevenue() {
    try {
            
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getTotalRevenue() {
    try {
      const finalData:{
        weddingNum?:number,
        realRevenue?:number,
        estimateRevenue?:number,
      } = {};
      const weddingData = await this.weddingService.getWeddings()

      // Number wedding
      const weddingNum = await this.weddingService.weddingNum();
      finalData.weddingNum = weddingNum;

      // Real revenue
      const realRevenue = weddingData.reduce((total, data) => {
        const totalDeposit = data["Bill"].reduce((total, current) => {
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
          if (penalData.isPenal) {
            estimatePrice = penalData.extraFee + totalPrice;
          }
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

  async temp() {
    try {
   
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
