import { RevenueService } from './revenue.service';
import { Body, Controller, Get, Query } from '@nestjs/common';

@Controller('revenue')
export class RevenueController {
  constructor(private revenueService:RevenueService) {}

  @Get()
  async getMonRevenue(
    @Query('year') year:string, 
    @Query('month') month:string,
  ) {
    return this.revenueService.getMonRevenue(Number(month), Number(year));
  }

  @Get()
  async getTotalRevenue() {
    return this.revenueService.getTotalRevenue();
  }

  @Get('wedding-number')
  async countMonthWedding(
    @Query('year') year:string, 
    @Query('month') month:string,
  ) {
    return this.revenueService.getMonthWedding(Number(month), Number(year));
  }

}
