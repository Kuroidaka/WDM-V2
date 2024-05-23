import { IsBoolean, IsInt, IsOptional, IsString, IsNumber, IsDate, IsDateString } from 'class-validator';

export class CreateBillDto {
  
  @IsString()
  wedding_id:string;
  
  @IsNumber()
  service_total_price:number;

  @IsNumber()
  food_total_price:number;
  
  @IsNumber()
  total_price:number;
  
  @IsNumber()
  deposit_require:number;
  
  @IsNumber()
  deposit_amount:number;
  
  @IsNumber()
  remain_amount:number;
  
  @IsNumber()
  extra_fee:number;

  @IsDateString()
  @IsOptional()
  payment_date?:string | Date;
            
}
