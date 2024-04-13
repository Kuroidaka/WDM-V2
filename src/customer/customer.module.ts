import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrivilegeModule } from 'src/privilege/privilege.module';

@Module({
  imports: [PrivilegeModule],
  controllers: [CustomerController],
  providers: [CustomerService, PrismaService],
  exports: [CustomerService]
})
export class CustomerModule {}
