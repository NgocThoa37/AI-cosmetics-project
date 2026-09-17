import { ApiProperty } from '@nestjs/swagger';

export class SimilarProductsDto {
  @ApiProperty({ description: 'ID sản phẩm' })
  productId!: string;

  @ApiProperty({ required: false, default: 5 })
  limit?: number;
}