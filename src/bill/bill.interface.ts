export interface BillInterface {
  id: string;
  wedding_id: string;
  payment_date: Date;
  service_total_price: number;
  total_price: number;
  deposit_require: number;
  deposit_amount: number;
  remain_amount: number;
  extra_fee: number;
  created_at: Date;
  updated_at: Date;
}