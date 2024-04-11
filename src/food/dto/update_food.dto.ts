// src/food/dto/update-food.dto.ts
import { IsBoolean, IsInt, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateFoodDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsInt()
  @IsOptional()
  inventory?: number;
}
