import { Module } from '@nestjs/common';
import { RevenueService } from './revenue.service';
import { RevenueController } from './revenue.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrivilegeModule } from 'src/privilege/privilege.module';
import { WeddingModule } from 'src/wedding/wedding.module';
import { BillModule } from 'src/bill/bill.module';

@Module({
  imports: [PrivilegeModule, WeddingModule, BillModule],
  controllers: [RevenueController],
  providers: [RevenueService, PrismaService],
})
export class RevenueModule {}
