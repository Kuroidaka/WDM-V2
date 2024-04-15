import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multer from 'multer';
import { createReadStream, writeFileSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { Response } from 'express';

@Injectable()
export class FileService {
  constructor(
    private prisma:PrismaService,
  ) {}

  private readonly uploadFilePath = 'assets/uploads'


  async storageFoodImage(filename:string, food_id:string) {
    try {
      const file = await this.prisma.image.create({
        data: { file_name: filename} as any,
      })

      await this.prisma.foodFileLink.create({
        data: {
          file_id: file.id,
          food_id
        } as any
      })

    } catch (error) {
      console.log(error);
      throw error;
    }

  }

  async storageServiceImage(filename:string, service_id:string) {
    try {
      const file = await this.prisma.image.create({
        data: { file_name: filename} as any,
      })

      await this.prisma.serviceFileLink.create({
        data: {
          file_id: file.id,
          service_id
        } as any
      })

    } catch (error) {
      console.log(error);
      throw error;
    }

  }

  async streamFile(fileName:string, res:Response) {
    const path = join(process.cwd(), this.uploadFilePath, fileName);
    const imageStream = createReadStream(path);

    imageStream.on('error', (error) => {
      console.error('Error streaming the image file:', error);
      throw new NotFoundException('Image not found')
    });

    res.setHeader('Content-Type', 'image/jpeg'); 
    imageStream.pipe(res);
  }

  async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Directory does not exist, so create it
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`Directory created: ${dirPath}`);
      } else {
        // Re-throw the error if it is not because the directory doesn't exist
        throw error;
      }
    }
  }

}
