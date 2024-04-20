import { Wedding_shift } from '@prisma/client';
import { IsDate, IsEnum, IsNumber, IsString } from "class-validator";

export class createWeddingDto {
  
  @IsString()
  lobby_id: string;

  @IsString()
  groom:string;

  @IsString()
  bride:string;

  @IsString()
  phone:string;

  @IsString()
  wedding_date:string;

  @IsString()
  note:string;
  
  @IsEnum(Wedding_shift)
  shift:Wedding_shift;

  @IsNumber()
  table_count:number
}