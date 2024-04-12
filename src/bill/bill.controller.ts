import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BillService } from './bill.service';
import { CreateBillDto } from './dto/create_bill.dto';

@Controller('bills')
export class BillController {
  constructor(private billService:BillService) {}

  @Get()// Get all bill
  async getAllFood() {
    return this.billService.getBills()
  }

  @Post('create')// Get all bill
  async createBill(@Body() body:CreateBillDto) {
    return this.billService.createBill(body)
  }
}

