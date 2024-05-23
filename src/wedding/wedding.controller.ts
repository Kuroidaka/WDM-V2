import { PageAccess } from 'src/auth/page_access.decorator';
import { createWeddingDto } from './dto/create_wedding.dto';
import { WeddingService } from './wedding.service';
import { Body, Controller, Get, Patch, Post, Query, UseGuards, Param, Delete } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PageGuard } from 'src/auth/page.guard';

import { Shift } from '@prisma/client';
import { updateWeddingDto } from './dto/update_wedding.dto';

@PageAccess('order')
@UseGuards(JwtAuthGuard, PageGuard)
@Controller('wedding')
export class WeddingController {
  constructor(private weddingService:WeddingService) {}

  @Get("find/")
  async searchWeddingByPhone(@Query('phone') phone:string) {
    return this.weddingService.searchWeddingByPhone(phone);
  }

  @Post("find-by-date-lob/")
  async searchWeddingByDateForLob(@Body('date') date:string, @Body('shiftList') shift_list:Shift[], @Body('lobbyId') lobby_id:string ) {
    return this.weddingService.searchWeddingByDateForLob(date, shift_list, lobby_id);
  }
  @Post("find-by-date-report/")
  async searchWeddingByDateForReport(@Body('date') date:string ) {
    return this.weddingService.searchWeddingByDateForReport(date);
  }

  @Get('/:weddingId')
  async getWeddingById(
    @Param('weddingId') weddingId:string,
    @Query('bill') bill="false",
    @Query('status') status="false"
  ) {

    const includeBill = bill === 'true';
    const includeStatus = status === 'true';
    if (includeStatus) return this.weddingService.getWeddingByIdWithStatus(weddingId);
    
    return this.weddingService.getWeddingById({id: weddingId, bill: includeBill});
  }

  @Get()
  async getWedding(@Query('bill') bill=false) {
    return this.weddingService.getWeddings(bill);
  }

  @Post('create/wedding')
  async createWedding(@Body() dataCreate:createWeddingDto) {
    return this.weddingService.createWedding(dataCreate);
  }
  
  @Post('edit/wedding/:weddingID')
  async updateWedding(@Param('weddingID') weddingID:string, @Body() dataUpdate:updateWeddingDto) {
    return this.weddingService.updateWedding(weddingID, dataUpdate);
  }

  @Post('create/wedding/food')
  async orderFood(
    @Body('foods') foods:{id:string, count:number}[],
    @Body('weddingId') weddingId:string
  ) {
    return this.weddingService.orderFood(weddingId, foods);
  }
  @Post('update/wedding/food')
  async editFoodOrderForWedding(
    @Body('foods') foods:{id:string, count:number}[],
    @Body('weddingId') weddingId:string
  ) {
    return this.weddingService.editFoodOrderForWedding(weddingId, foods);
  }
  @Delete('delete/:weddingId')
  async deleteWedding(@Param('weddingId') weddingId:string) {
    return this.weddingService.deleteWedding(weddingId);
  }

  @Post('create/wedding/service')
  async orderService(
    @Body('services') services:{id:string, count:number}[],
    @Body('weddingId') weddingId:string
  ) {
    return this.weddingService.orderService(weddingId, services);
  }
  @Post('update/wedding/service')
  async editServiceOrderForWedding(
    @Body('services') services:{id:string, count:number}[],
    @Body('weddingId') weddingId:string
  ) {
    return this.weddingService.editServiceOrderForWedding(weddingId, services);
  }

  @Post('deposit')
  async depositOrder(
    @Body('transaction_amount') transaction_amount:number,
    @Body('weddingId') weddingId:string,
    @Body('payment_date') payment_date:string
  ) {
    return this.weddingService.depositOrder(transaction_amount, weddingId, new Date(payment_date));
  }

  @Post('full-pay')
  async fullPayOrder(
    @Body('transaction_amount') transaction_amount:number,
    @Body('weddingId') weddingId:string,
    @Body('payment_date') payment_date:string
  ) {
    return this.weddingService.fullPayOrder(transaction_amount, weddingId, new Date(payment_date));
  }

  @Patch('toggle-penalty')
  async togglePenalty(@Query('weddingId') weddingId:string) {
    return this.weddingService.togglePenalty(weddingId);
  }

  @Get('get/food-order')
  async getFoodsOrderByWedding(@Query('weddingId') weddingId:string) {
    return this.weddingService.getFoodsOrderByWedding(weddingId);
  }

  @Get('get/service-order')
  async getServicesOrderByWedding(@Query('weddingId') weddingId:string) {
    return this.weddingService.getServicesOrderByWedding(weddingId);
  }

  @Get('get/food-cart')
  async getFoodsCartByWedding(@Query('weddingId') weddingId:string) {
    return this.weddingService.getFoodsCartByWedding(weddingId);
  }

  @Get('get/service-cart')
  async getServicesCartByWedding(@Query('weddingId') weddingId:string) {
    return this.weddingService.getServicesCartByWedding(weddingId);
  }

  @Get('/total-deposit/:weddingId')
  async getCurrentDepositForWedding(@Param('weddingId') weddingId:string) {
    return this.weddingService.getCurrentDepositForWedding(weddingId);
  }

  @Get('/extra_fee/:weddingId')
  async getExtraFeeForWedding(@Param('weddingId') weddingId:string) {
    return this.weddingService.getExtraFeeForWedding(weddingId);
  }

  @Get('/bill_page/:weddingId')
  async getDataForBillPage(@Param('weddingId') weddingId:string) {
    return this.weddingService.getDataForBillPage(weddingId);
  }

}
