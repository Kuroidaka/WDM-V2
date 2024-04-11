import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LobbyService {
  constructor(private prisma: PrismaService) {}

  async getAllLobby() {
    try {
      
    } catch (error) {
    }
  }
}
