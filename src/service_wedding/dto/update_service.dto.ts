import { IsBoolean, IsOptional, IsString, IsNumber, IsInt } from 'class-validator';

export class UpdateServiceDto {
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
