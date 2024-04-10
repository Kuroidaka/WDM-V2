// src/food/dto/update-food.dto.ts
import { IsBoolean, IsInt, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateFoodDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsBoolean()
  status: boolean;

  @IsInt()
  inventory: number;
}
// id         String   @id
// name       String
// price      Int
// status     Boolean  @default(true)
// created_at DateTime @default(now())
// updated_at DateTime @default(now())
// inventory  Int