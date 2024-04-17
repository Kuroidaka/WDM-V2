import { ConfigService } from '@nestjs/config';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDto } from './dto/create_service.dto';
import { UpdateServiceDto } from './dto/update_service.dto';
import { ServiceInterFace } from './service.interface';

@Injectable()
export class ServiceWeddingService {
  constructor(
    private prisma: PrismaService,
    private configService:ConfigService
  ) {}

  async findServices():Promise<ServiceInterFace[] | undefined> {
    try {
      const services = await this.prisma.service.findMany({
        where: {
          deleted_at: null
        },
        include: {
          serviceFiles: {
            orderBy: {
              created_at: 'desc'
            },
            include: {
              image: true
            }
          }
        }
      });
      return this.processServiceImageUrl(services);
    } catch (error) {
      throw error;
    }
  }

  async findServiceByID(id:string):Promise<ServiceInterFace | undefined> {
    try {
      const service = await this.prisma.service.findUnique({
        where: { id },
        include: {
          serviceFiles: {
            orderBy: {
              created_at: 'desc'
            },
            include: {
              image: true
            }
          }
        }
      })
      return this.processServiceImageUrl([service])[0];
    } catch (error) {
      throw error
    }
  }

  processServiceImageUrl(services:ServiceInterFace[]) {
    const BASEURL = this.configService.get<string>('BASE_URL');
    const PREFIX = this.configService.get<string>('PREFIX');

    const imageURL = `${BASEURL}${PREFIX}/file/`
    const result = services.map(service => {
      if(service?.serviceFiles){
        const { serviceFiles, ...serviceData } = service;
        const url = serviceFiles.length > 0 ? imageURL + serviceFiles[0].image.file_name : null;
  
        return { ...serviceData, url };
      }

      return service
    });

    return result;
  }
  
  async updateService(id:string, updateData:UpdateServiceDto ) {
    try {
      // check exist service
      const isExistService = await this.prisma.service.findUnique({
        where: { id: id }
      })
      
      if(!isExistService) {
        throw new NotFoundException('Service not found')
      }

      const service = await this.prisma.service.update({
        where: {
          id: id
        },
        data: updateData
      })
      
      return service
    } catch (error) {
      throw error
    }
  }

  async createService(createData:CreateServiceDto) {
    try {
      const { name, price, status, inventory } = createData
      const service = await this.prisma.service.create({
        data: {
          name,
          price,
          status,
          inventory
        } as any,
      })

      return service
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteService(id:string) {
    try {
      // search exist service
      const service = await this.findServiceByID(id);
      if(!service) throw new NotFoundException(`service id: ${id} not found`)

      const deletedService = await this.prisma.service.update({
        data: {
          deleted_at: new Date()
        },
        where: {
          id: id
        }
      })

      return {
        deletedID: deletedService.id
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async updateInventory(id:string, count:number) {
    try {
      const service = await this.prisma.service.update({
        where: { id },
        data: { inventory: count,},
      });
    return service
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

}

