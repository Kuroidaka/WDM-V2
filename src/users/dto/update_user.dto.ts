import { IsOptional, IsString } from 'class-validator'

export class UpdateUserDto {

  @IsString()
  @IsOptional()
  display_name?:string;

  @IsString()
  @IsOptional()
  role_id?:string;

  @IsString()
  @IsOptional()
  password?:string;
}