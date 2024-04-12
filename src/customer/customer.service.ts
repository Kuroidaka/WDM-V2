import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private prisma:PrismaService) {}

  async createCustomer (name:string, phone:string) {
    try {
      const customer = await this.prisma.customer.create({
        data: {
          name,
          phone
        } as any
      })

      return customer
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  
  async getCustomers() {
    try {
      const customers = await this.prisma.customer.findMany({});

      return customers
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findCustomerByRelateName(name:string) {
    try {
      const users = await this.prisma.customer.findMany({
        where: {
          name: { contains: name }
        }
      })

      return users
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByPhone(phone:string) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { phone }
      })

      return customer
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
