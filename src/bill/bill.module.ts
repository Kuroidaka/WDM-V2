import { Module } from '@nestjs/common';
import { BillService } from './bill.service';
import { BillController } from './bill.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [BillController],
  providers: [BillService, PrismaService],
  exports: [BillService],
})
export class BillModule {}
