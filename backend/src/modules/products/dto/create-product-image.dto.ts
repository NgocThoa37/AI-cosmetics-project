import { IsString, IsUUID, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class CreateProductImageDto {
  @IsUUID()
  productId!: string;

  @IsOptional()
  @IsUUID()
  productDetailId?: string;

  @IsString()
  imageUrl!: string;

  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsString()
  altText?: string;
}