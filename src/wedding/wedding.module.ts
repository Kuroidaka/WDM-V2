import { Module } from '@nestjs/common';
import { WeddingService } from './wedding.service';
import { WeddingController } from './wedding.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomerModule } from 'src/customer/customer.module';
import { LobbyModule } from 'src/lobby/lobby.module';
import { FoodModule } from 'src/food/food.module';
import { ServiceWeddingModule } from 'src/service_wedding/service_wedding.module';

@Module({
  imports: [CustomerModule, LobbyModule, FoodModule, ServiceWeddingModule],
  controllers: [WeddingController],
  providers: [WeddingService, PrismaService, ],
})
export class WeddingModule {}
