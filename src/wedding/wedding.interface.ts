import { Bill, Customer, Lobby, Shift } from "@prisma/client";

export interface WeddingInterface {
  id:string;
  groom:string;
  bride:string;
  wedding_date:Date;
  shift_id:string;
  lobby_id:string;
  customer_id:string;
  table_count:number;
  note:string;
  is_penalty_mode?: boolean,
  Bill?: Bill[];
  Shift?: Shift;
  Customer?: Customer;
  Lobby?: Lobby;
}
export interface WeddingIDInterface {
  id:string;
  groom:string;
  bride:string;
  wedding_date:Date;
  shift_id:string;
  lobby_id:string;
  customer_id:string;
  table_count:number;
  note:string;
  is_penalty_mode?: boolean,
  Bill?: Bill[];

}
export interface WeddingUpdateInterface {
  groom?:string;
  bride?:string;
  wedding_date?:Date;
  shift_id?:string;
  lobby_id?:string;
  customer_id?:string;
  table_count?:number;
  note?:string;
}

export interface serviceOrder {
  id:string;
  count:number;
}

export interface foodOrderWedding {
  id: string;
  food_id: string;
  food_name: string;
  food_price: number;
  count: number;
  note: string;
  created_at: Date;
  updated_at: Date;
  wedding_id: string;
}[]

export interface serviceOrderWedding {
  id: string;
  service_id: string;
  service_name: string;
  service_price: number;
  count: number;
  note: string;
  created_at: Date;
  updated_at: Date;
  wedding_id: string;
}[]