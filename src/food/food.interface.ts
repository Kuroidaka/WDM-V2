import { FoodLinkImage } from "src/file/file.interface";

export interface FoodInterFace {
  id: string;
  name: string;
  price: number;
  status: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  inventory: number;
  foodFiles?: FoodLinkImage[];
  url?: string
}
