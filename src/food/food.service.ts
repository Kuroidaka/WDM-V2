import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { UpdateFoodDto } from './dto-food/update_food.dto';
import { CreateFoodDto } from './dto-food/create_food.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FoodService {
  constructor(private prisma: PrismaService) {}

  async findAllFood() {
    try {
      const foods = await this.prisma.food.findMany({});
      return foods;
    } catch (error) {
      throw error;
    }
  }

  async findFoodByID(id:string) {
    try {
      const foods = await this.prisma.food.findUnique({
        where: {
          id: id
        }
      });
      return foods;
    } catch (error) {
      throw error
    }
  }
  
  async updateFood(id:string, updateData:UpdateFoodDto ) {
    try {
      // check exist food
      const isExistFood = await this.prisma.food.findUnique({
        where: { id: id }
      })
      
      if(!isExistFood) {
        throw new HttpException('Food not found', HttpStatus.NOT_FOUND);
      }

      const food = await this.prisma.food.update({
        where: {
          id: id
        },
        data: updateData
      })
      
      return food
    } catch (error) {
      throw error
    }
  }

  async createFood(createData:CreateFoodDto) {
    try {
      const { name, price, inventory, status } = createData
      const food = await this.prisma.food.create({
        data: {
          name,
          price,
          inventory,
          status, 
        } as any,
      })

      return food
    } catch (error) {
      throw error
    }
  }

  async deleteFood(id:string) {
    try {
      const deletedFood = await this.prisma.food.delete({
        where: {
          id: id
        }
      })

      return deletedFood
    } catch (error) {
      throw error;
    }
  }
}
