import { createWeddingDto } from './dto/create_wedding.dto';
import { WeddingService } from './wedding.service';
import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('wedding')
export class WeddingController {
  constructor(private weddingService:WeddingService) {}

  @Get()
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

}
