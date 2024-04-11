import { IsString } from 'class-validator'

export class CreateUserDto {
  
  @IsString()
  username:string;

  @IsString()
  password:string;

  @IsString()
  display_name:string;
}