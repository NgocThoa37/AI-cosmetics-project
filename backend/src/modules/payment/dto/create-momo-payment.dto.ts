import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMomoPaymentDto {
  @IsNumber()
  @IsNotEmpty()
  orderId!: number;

  @IsString()
  @IsOptional()  
  orderInfo?: string;  
}

// VNPay 
export class CreateVNPayPaymentDto {
  @IsNumber()
  @IsNotEmpty()
  orderId!: number;
}