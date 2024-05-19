import { IsString } from 'class-validator'

export class CreateShiftDto {
  
  @IsString()
  name:string;
}