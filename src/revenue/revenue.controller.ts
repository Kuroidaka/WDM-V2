import { RevenueService } from './revenue.service';
import { Body, Controller, Get, Query } from '@nestjs/common';

@Controller('revenue')
export class RevenueController {
  constructor(private revenueService:RevenueService) {}

  @Get('list-revenue')
  async getListBill(
    @Query("includeFee") includeFee="false",
    @Query('year') year?:string, 
    @Query('month') month?:string,
  ) {
  const isIncludeFee = includeFee === "true"
    return this.revenueService.getListRevenue(isIncludeFee, Number(month), Number(year));
  }

  @Get()
  async getMonRevenue(
    @Query('year') year:string, 
    @Query('month') month:string,
  ) {
    return this.revenueService.getMonRevenue(Number(month), Number(year));
  }

  @Get('total')
  async getTotalRevenue(
    @Query('year') year = "-1", 
    @Query('month') month = "-1",
  ) {
    return this.revenueService.getTotalRevenue(Number(month), Number(year));
  }
  @Get('total_revenue_by_month')
  async totalRevenueByMonth(
    @Body('year') year:number,
    @Body('month') month:number
  ) {
    return this.revenueService.totalWeddingRevenueByMonth({ year, month });
  }

}
