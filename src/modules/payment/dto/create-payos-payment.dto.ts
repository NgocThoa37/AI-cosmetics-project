import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePayOSPaymentDto {
  @IsInt({ message: 'orderId phải là số nguyên' })
  @Min(1, { message: 'orderId không hợp lệ' })
  orderId!: number;

  @IsString()
  @IsOptional()
  returnUrl?: string;
}