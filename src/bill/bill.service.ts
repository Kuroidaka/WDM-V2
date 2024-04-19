import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBillDto } from './dto/create_bill.dto';

@Injectable()
export class BillService {
  constructor(private prisma:PrismaService) {}

  async getBills() {
    try {
      const bills = await this.prisma.bill.findMany({
        orderBy: {
          created_at: 'asc'
        }
      })
      return bills
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getMonthBills(month:number, year:number){
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); 

      const bills = await this.prisma.bill.findMany({
        where: {
          "payment_date": {
            gte: startDate,
            lte: endDate
          }
        }
      })
      return bills
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getBillsByWeddingId(weddingId:string) {
    try {
      const bills = await this.prisma.bill.findMany({
        where: {
            "wedding_id": weddingId
        },
        orderBy: {
            "created_at": 'desc'
        }
    })
      return bills
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createBill(dataCreate:CreateBillDto) {
    try {
      const {
        wedding_id,
        service_total_price,
        food_total_price,
        total_price,
        deposit_require,
        deposit_amount,
        remain_amount,
        extra_fee,
      } = dataCreate;
      const bill = await this.prisma.bill.create({
        data: {
            wedding_id,
            payment_date: new Date(),
            service_total_price,
            food_total_price,
            total_price,
            deposit_require,
            deposit_amount,
            remain_amount,
            extra_fee,
            
        }
    })
    return bill

    } catch (error) {
      console.log(error);
      throw error;
    }
  }

}
