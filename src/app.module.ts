import { HttpStatus, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FoodModule } from './food/food.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { LobbyModule } from './lobby/lobby.module';
import { providePrismaClientExceptionFilter } from 'nestjs-prisma';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomerModule } from './customer/customer.module';
import { WeddingModule } from './wedding/wedding.module';
import { ServiceWeddingModule } from './service_wedding/service_wedding.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FoodModule,
    PrismaModule,
    LobbyModule,
    AuthModule,
    UsersModule,
    CustomerModule,
    WeddingModule,
    ServiceWeddingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    providePrismaClientExceptionFilter({
      P2000: HttpStatus.BAD_REQUEST,
      P2002: HttpStatus.CONFLICT,
      P2025: HttpStatus.NOT_FOUND,
    }),

  ],
})
export class AppModule {}
