import { ServiceLinkImage } from "src/file/file.interface";

export interface ServiceInterFace {
  id: string;
  name: string;
  price: number;
  status: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  inventory: number;
  serviceFiles?: ServiceLinkImage[];
  url?: string
}