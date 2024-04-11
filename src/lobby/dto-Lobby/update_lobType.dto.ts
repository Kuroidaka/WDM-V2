import { IsNumber, IsString, IsOptional } from "class-validator";

export class UpdateLobTypeDto {
  @IsNumber()
  @IsOptional()
  max_table_count?: number;

  @IsOptional()
  @IsNumber()
  min_table_price?: number;

  @IsOptional()
  @IsNumber()
  deposit_percent?: number;

  @IsOptional()
  @IsString()
  type_name?: string;

}

// id              String   @id @default(uuid())
// max_table_count Int
// min_table_price Int
// deposit_percent Int      @default(30)
// created_at      DateTime @default(now())
// updated_at      DateTime @default(now())
// type_name       String
// Lobby           Lobby[]