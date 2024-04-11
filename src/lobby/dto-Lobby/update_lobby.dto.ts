import { IsString, IsOptional } from 'class-validator'

export class UpdateLobDto {
  
  @IsString()
  @IsOptional()
  lob_type_id?:string;

  @IsString()
  @IsOptional()
  name?:string;
}