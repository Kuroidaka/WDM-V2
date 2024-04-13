import { Module } from '@nestjs/common';
import { ServiceWeddingService } from './service_wedding.service';
import { ServiceWeddingController } from './service_wedding.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrivilegeModule } from 'src/privilege/privilege.module';

@Module({
  imports: [PrivilegeModule],
  providers: [ServiceWeddingService, PrismaService],
  controllers: [ServiceWeddingController],
  exports: [ServiceWeddingService]
})
export class ServiceWeddingModule {}
