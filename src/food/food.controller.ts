import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { FoodService } from './food.service';
// import { PrismaClientExceptionFilter } from 'src/common/filters/prisma-exception.filter';
import { UpdateFoodDto } from './dto-food/update_food.dto';
import { CreateFoodDto } from './dto-food/create_food.dto';

@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Get()// Get All Food
  async getAllFood() {
    return this.foodService.findAllFood()
  }

  @Get('/:id')// get food by id
  async getFoodById(@Param() param:{id: string}) {
    const { id } = param;
    return this.foodService.findFoodByID(id)
  }

  @Post('create') // create food 
  async createFood(@Body() createData:CreateFoodDto) {
    return this.foodService.createFood(createData)
  }

  @Patch('/:foodID') //update food
  async updateFood(@Param() param:{foodID: string}, @Body() updateData:UpdateFoodDto) {
    const { foodID } = param;
    return this.foodService.updateFood(foodID, updateData)
  }

  @Delete('/:foodID')//delete food
  async deleteFood(@Param() param:{foodID:string}) {
   const { foodID } = param;
   
   return this.foodService.deleteFood(foodID)
  }

}
