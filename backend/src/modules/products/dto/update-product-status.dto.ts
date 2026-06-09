import { IsEnum } from 'class-validator';
import { ProductStatus } from '../entities/product.entity';

export class UpdateProductStatusDto {
  @IsEnum(ProductStatus)
  status!: ProductStatus;
}