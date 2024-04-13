import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class Permission {
  @IsString()
  id: string;
}

export class CreateWeddingDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Permission)
  permissionList: Permission[];
}
