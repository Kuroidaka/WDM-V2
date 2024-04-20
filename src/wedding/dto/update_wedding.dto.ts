import { Wedding_shift } from '@prisma/client';
import { IsDate, IsEnum, IsNumber, IsString, IsOptional } from "class-validator";

export class updateWeddingDto {
  
  @IsOptional()
  @IsString()
  lobby_id?: string;

  @IsOptional()
  @IsString()
  groom?:string;

  @IsOptional()
  @IsString()
  bride?:string;

  @IsOptional()
  @IsString()
  phone?:string;

  @IsOptional()
  @IsString()
  wedding_date?:string;

  @IsOptional()
  @IsString()
  note?:string;
  
  @IsOptional()
  @IsEnum(Wedding_shift)
  shift?:Wedding_shift;

  @IsOptional()
  @IsNumber()
  table_count?:number
}