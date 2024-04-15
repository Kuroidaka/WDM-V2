import { PageAccess } from 'src/auth/page_access.decorator';
import { CreateServiceDto } from './dto/create_service.dto';
import { UpdateServiceDto } from './dto/update_service.dto';
import { ServiceWeddingService } from './service_wedding.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PageGuard } from 'src/auth/page.guard';

@PageAccess('food_service')
@UseGuards(JwtAuthGuard, PageGuard)
@Controller('service')
export class ServiceWeddingController {
  constructor(private serviceWeddingService: ServiceWeddingService) {}

  @Get()// Get All service
  async getAllService() {
    return this.serviceWeddingService.findServices()
  }

  @Get('/:id')// get service by id
  async getServiceById(@Param() param:{id: string}) {
    const { id } = param;
    return this.serviceWeddingService.findServiceByID(id)
  }

  @Post('create') // create service 
  async createService(@Body() createData:CreateServiceDto) {
    return this.serviceWeddingService.createService(createData)
  }

  @Patch('/:serviceID') //update service
  async updateService(@Param() param:{serviceID: string}, @Body() updateData:UpdateServiceDto) {
    const { serviceID } = param;
    return this.serviceWeddingService.updateService(serviceID, updateData)
  }

  @Delete('/:serviceID')//delete service
  async deleteService(@Param() param:{serviceID:string}) {
   const { serviceID } = param;
   
   return this.serviceWeddingService.deleteService(serviceID)
  }

}
