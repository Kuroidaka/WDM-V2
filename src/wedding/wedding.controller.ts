import { PageAccess } from 'src/auth/page_access.decorator';
import { createWeddingDto } from './dto/create_wedding.dto';
import { WeddingService } from './wedding.service';
import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PageGuard } from 'src/auth/page.guard';

@PageAccess('order')
@UseGuards(JwtAuthGuard, PageGuard)
@Controller('wedding')
export class WeddingController {
  constructor(private weddingService:WeddingService) {}

  @Get()
  async getWeddingById(
    @Query('weddingId') weddingId:string,
    @Query('bill') bill=false
  ) {
    return this.weddingService.getWeddingById({id: weddingId, bill});
  }

  @Get('list')
  async getWedding() {
    return this.weddingService.getWeddings();
  }

  @Post('create/wedding')
  async createWedding(@Body() dataCreate:createWeddingDto) {
    return this.weddingService.createWedding(dataCreate);
  }

  @Post('create/wedding/food')
  async orderFood(
    @Body('foods') foods:{id:string, count:number}[],
    @Body('weddingId') weddingId:string
  ) {
    return this.weddingService.orderFood(weddingId, foods);
  }

  @Post('create/wedding/service')
  async orderService(
    @Body('services') services:{id:string, count:number}[],
    @Body('weddingId') weddingId:string
  ) {
    return this.weddingService.orderService(weddingId, services);
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

}
