import { Module } from '@nestjs/common';
import { LobbyController } from './lobby.controller';
import { LobbyService } from './lobby.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrivilegeModule } from 'src/privilege/privilege.module';

@Module({
  imports:[PrivilegeModule],
  controllers: [LobbyController],
  providers: [LobbyService, PrismaService],
  exports: [LobbyService]
})
export class LobbyModule {}
