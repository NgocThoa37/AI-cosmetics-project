import { IsString, IsNumber, Min, IsOptional, IsUUID } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsNumber()
  categoryId!: number;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsNumber()
  brandId?: number;
}