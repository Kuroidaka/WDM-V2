import { Body, Controller, Delete, Get, Param, Patch, Post, UseFilters } from '@nestjs/common';
import { FoodService } from './food.service';
import { PrismaClientExceptionFilter } from 'src/common/filters/prisma-exception.filter';
import { UpdateFoodDto } from './dto-food/update_food.dto';
import { CreateFoodDto } from './dto-food/create_food.dto';

@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Get('get')// Get All Food
  @UseFilters(PrismaClientExceptionFilter)
  async getAllFood() {
    return this.foodService.findAllFood()
  }

  @Get('get/:foodID')// get food by id
  @UseFilters(PrismaClientExceptionFilter)
  async getFoodById(@Param() param:{foodID: string}) {
    const { foodID } = param;
    return this.foodService.findFoodByID(foodID)
  }

  @Post('create') // create food 
  @UseFilters(PrismaClientExceptionFilter)
  async createFood(@Body() createData:CreateFoodDto) {
    return this.foodService.createFood(createData)
  }

  @Patch('update/:foodID') //update food
  @UseFilters(PrismaClientExceptionFilter)
  async updateFood(@Param() param:{foodID: string}, @Body() updateData:UpdateFoodDto) {
    const { foodID } = param;
    return this.foodService.updateFood(foodID, updateData)
  }

  @Delete('delete/:foodID')//delete food
  @UseFilters(PrismaClientExceptionFilter)
  async deleteFood(@Body() body:{foodID:string}) {
   const { foodID } = body;
   
   return this.foodService.deleteFood(foodID)
  }

}
