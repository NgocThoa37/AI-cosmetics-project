import { IsString, IsEnum, IsOptional, IsNumber, Min, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/order.entity';

// ✅ THÊM DTO cho OrderItem
export class OrderItemDto {
  @IsNotEmpty()
  @IsString()
  productDetailId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsString()
  shippingAddress!: string;

  @IsString()
  shippingPhone!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingFee?: number;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  // ✅ THÊM FIELD NÀY
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsOptional()
  @IsString()
  note?: string;
}