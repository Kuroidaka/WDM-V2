import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';

import { UpdateFoodDto } from './dto/update_food.dto';
import { CreateFoodDto } from './dto/create_food.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FoodInterFace } from './food.interface';

@Injectable()
export class FoodService {
  constructor(
    private prisma: PrismaService,
    private configService:ConfigService
  ) {}

  async findAllFood() {
    try {
      const foods = await this.prisma.food.findMany({
        where: {
          deleted_at: null
        },
        include: {
          foodFiles: {
            orderBy: {
              created_at: 'desc'
            },
            include: {
              image: true
            }
          }
        }
      });

  
      return this.processFoodImageUrl(foods);
    } catch (error) {
      throw error;
    }
  }

  async findFoodByID(id:string):Promise<FoodInterFace> {
    try {
      const food = await this.prisma.food.findFirst({
        where: {
         AND: [
          { id: id,},
          { deleted_at: null,},
        ],
        } as any,
        include: {
          foodFiles: {
            orderBy: {
              created_at: 'desc'
            },
            include: {
              image: true
            }
          }
        }
      });

    return this.processFoodImageUrl([food])[0];
    } catch (error) {
      throw error
    }
  }

  processFoodImageUrl(foods:FoodInterFace[]) {
    const BASEURL = this.configService.get<string>('BASE_URL');
    const PREFIX = this.configService.get<string>('PREFIX');

    const imageURL = `${BASEURL}${PREFIX}/file/`
    const result = foods.map(food => {

      if(food?.foodFiles) {
        const { foodFiles, ...foodData } = food;
        const url = foodFiles.length > 0 ? imageURL + foodFiles[0].image.file_name : null;

        return {...foodData, url}
      }

      return food;
    });

    return result;
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
      // search exist food
      const food = await this.findFoodByID(id);
      if(!food) throw new NotFoundException(`food id: ${id} not found`)
      

      const deletedFood = await this.prisma.food.update({
        data: {
          deleted_at: new Date()
        },
        where: {
          id: id
        }
      })

      return {
        deletedID: deletedFood.id
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async updateInventory(id:string, count:number) {
    try {
      const food = await this.prisma.food.update({
        where: { id },
        data: {
            inventory: count,
        },
      });
    return food
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
