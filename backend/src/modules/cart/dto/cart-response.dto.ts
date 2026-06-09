import { Expose, Type } from 'class-transformer';

export class CartDetailResponseDto {
  @Expose() id!: number;
  @Expose() productDetailId!: string;
  @Expose() quantity!: number;
  @Expose() productDetail?: any;
}

export class CartResponseDto {
  @Expose() id!: number;
  @Expose() totalItems!: number;
  @Expose() totalPrice!: number;
  @Expose() @Type(() => CartDetailResponseDto) details!: CartDetailResponseDto[];
}