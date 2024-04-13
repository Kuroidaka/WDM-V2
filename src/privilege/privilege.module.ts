import { Module } from '@nestjs/common';
import { PrivilegeService } from './privilege.service';
import { PrivilegeController } from './privilege.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PrivilegeController],
  providers: [PrivilegeService, PrismaService],
  exports: [PrivilegeService]
})
export class PrivilegeModule {}
