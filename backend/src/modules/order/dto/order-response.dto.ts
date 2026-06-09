import { Expose, Type } from 'class-transformer';

export class OrderDetailResponseDto {
  @Expose() id!: number;
  @Expose() productDetailId!: string;
  @Expose() productId!: string;
  @Expose() quantity!: number;
  @Expose() unitPrice!: number;
  @Expose() subtotal!: number;
}

export class OrderResponseDto {
  @Expose() id!: number;
  @Expose() orderCode!: string;
  @Expose() shippingAddress!: string;
  @Expose() shippingPhone!: string;
  @Expose() shippingFee!: number;
  @Expose() totalAmount!: number;
  @Expose() paymentMethod!: string;
  @Expose() paymentStatus!: string;
  @Expose() orderStatus!: string;
  @Expose() note!: string;
  @Expose() createdAt!: Date;
  @Expose() @Type(() => OrderDetailResponseDto) details!: OrderDetailResponseDto[];
}