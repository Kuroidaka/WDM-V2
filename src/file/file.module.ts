import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileController } from './file.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  controllers: [FileController],
  providers: [FileService, PrismaService],
  exports: [FileService],
})
export class FileModule {}
