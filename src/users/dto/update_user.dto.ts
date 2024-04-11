import { IsString } from 'class-validator'

export class UpdateUserDto {
  
  @IsString()
  username:string;

  @IsString()
  display_name:string;
}