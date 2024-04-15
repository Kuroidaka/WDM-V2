import { Controller, Get, Param, Post, UploadedFile, UseInterceptors, Res, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { Response } from 'express';
import { diskStorage } from 'multer';



@Controller('file')
export class FileController {
  constructor(private fileService:FileService) {}

  @Post('upload/food-image')
  @UseInterceptors(FileInterceptor('file',{
    storage: diskStorage({
      destination: 'assets/uploads', 
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const extension = file.originalname.split('.').pop();
        cb(null, `food-${uniqueSuffix}.${extension}`);
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB limit
    },
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  storageFoodImage(@UploadedFile() file: Express.Multer.File, @Body('food_id') food_id:string) {
    // return this.fileService.storageFile(file);
    return this.fileService.storageFoodImage(file.filename, food_id);
  }

  @Post('upload/service-image')
  @UseInterceptors(FileInterceptor('file',{
    storage: diskStorage({
      destination: 'assets/uploads', 
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const extension = file.originalname.split('.').pop();
        cb(null, `service-${uniqueSuffix}.${extension}`);
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB limit
    },
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  storageServiceImage(@UploadedFile() file: Express.Multer.File, @Body('service_id') service_id:string) {
    // return this.fileService.storageFile(file);
    return this.fileService.storageServiceImage(file.filename, service_id);
  }

  @Get(':fileName')
  getImage(@Param('fileName') fileName: string, @Res() res: Response) {
   return this.fileService.streamFile(fileName, res);
  }
}
