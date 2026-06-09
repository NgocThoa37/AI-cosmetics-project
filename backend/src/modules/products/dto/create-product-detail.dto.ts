import { IsString, IsNumber, IsOptional, IsObject, IsUUID, Min, IsEnum } from 'class-validator';
import { SkinType } from '../enums/skin-type.enum';

export class CreateProductDetailDto {
  @IsUUID()
  productId!: string;

  @IsOptional()
  @IsNumber()
  colorId?: number;

  @IsOptional()
  @IsNumber()
  sizeId?: number;

  @IsOptional()
  @IsEnum(SkinType)
  skinType?: SkinType;

  @IsString()
  sku!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  ingredients?: string;

  @IsOptional()
  @IsObject()
  usage?: any;

  @IsOptional()
  @IsObject()
  benefits?: any;

  @IsOptional()
  @IsString()
  storage?: string;
}