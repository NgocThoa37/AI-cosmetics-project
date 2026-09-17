import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeReviewsDto {
  @ApiProperty({ description: 'ID sản phẩm' })
  productId!: string;
}