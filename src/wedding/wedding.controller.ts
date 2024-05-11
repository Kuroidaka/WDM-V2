import { PageAccess } from 'src/auth/page_access.decorator';
import { createWeddingDto } from './dto/create_wedding.dto';
import { WeddingService } from './wedding.service';
import { Body, Controller, Get, Patch, Post, Query, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PageGuard } from 'src/auth/page.guard';
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

  @Get("find-by-date/")
  async searchWeddingByDate(@Query('date') date:string) {
    return this.weddingService.searchWeddingByDate(date);
  }

  @Get('/:weddingId')
  async getWeddingById(
    @Param('weddingId') weddingId:string,
    @Query('bill') bill=false
  ) {
    return this.weddingService.getWeddingById({id: weddingId, bill});
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
    @Body('weddingId') weddingId:string
  ) {
    return this.weddingService.depositOrder(transaction_amount, weddingId);
  }

  @Post('full-pay')
  async fullPayOrder(
    @Body('transaction_amount') transaction_amount:number,
    @Body('weddingId') weddingId:string
  ) {
    return this.weddingService.fullPayOrder(transaction_amount, weddingId);
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

  @Get('/total-deposit/:weddingId')
  async getCurrentDepositForWedding(@Param('weddingId') weddingId:string) {
    return this.weddingService.getCurrentDepositForWedding(weddingId);
  }


}
