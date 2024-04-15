import { IsBoolean, IsOptional, IsString, IsNumber, IsInt } from 'class-validator';

export class CreateServiceDto {
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
