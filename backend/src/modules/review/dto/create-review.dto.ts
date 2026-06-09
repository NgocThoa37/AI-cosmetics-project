import { IsInt, Min, Max, IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  orderItemId!: number;

  @IsUUID()
  productId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  imageUrls?: string[];
}