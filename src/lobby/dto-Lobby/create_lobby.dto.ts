import { IsString } from 'class-validator'

export class CreateLobDto {
  
  @IsString()
  lob_type_id:string;

  @IsString()
  name:string;
}