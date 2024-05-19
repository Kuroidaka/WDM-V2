import { IsNumber, IsString } from "class-validator";

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
  
  @IsString()
  shift_id:string;

  @IsNumber()
  table_count:number
}