import { Module } from '@nestjs/common';
import { FoodService } from './food.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FoodController } from './food.controller';

@Module({
  imports: [],
  controllers: [FoodController],
  providers: [FoodService, PrismaService],
  exports: [FoodService]
})
export class FoodModule {}
