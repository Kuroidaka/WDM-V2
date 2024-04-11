import { IsNumber, IsString } from "class-validator";

export class CreateLobTypeDto {
  @IsNumber()
  max_table_count: number;

  @IsNumber()
  min_table_price: number;

  @IsNumber()
  deposit_percent: number;

  @IsString()
  type_name: string;

}

// id              String   @id @default(uuid())
// max_table_count Int
// min_table_price Int
// deposit_percent Int      @default(30)
// created_at      DateTime @default(now())
// updated_at      DateTime @default(now())
// type_name       String
// Lobby           Lobby[]