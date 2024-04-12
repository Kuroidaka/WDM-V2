import { Wedding_shift } from "@prisma/client";

export interface WeddingInterface {
  id:string;
  groom:string;
  bride:string;
  wedding_date:Date;
  shift:Wedding_shift;
  lobby_id:string;
  customer_id:string;
  table_count:number;
  note:string;
}

export interface serviceOrder {
  id:string;
  count:number;
}