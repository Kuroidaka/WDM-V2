import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { PageAccess } from 'src/auth/page_access.decorator';
import { PageGuard } from 'src/auth/page.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@PageAccess('order')
@UseGuards(JwtAuthGuard, PageGuard)
@Controller('customer')
export class CustomerController {
  constructor(private customerService:CustomerService) {}

  @Post('create')
  async createUser(@Body() body:{name:string, phone:string}) {
    const { name, phone } = body;
    return this.customerService.createCustomer(name, phone);
  } 

  @Get()
  async getUsers() {
    return this.customerService.getCustomers();
  }

  @Get('find')
  async findUserByName(@Query('name') name:string) {
    return this.customerService.findCustomerByRelateName(name);
  }
}
