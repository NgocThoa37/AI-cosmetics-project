import { IsString, IsNumber, Min, Max, IsOptional, IsUUID, IsBoolean } from 'class-validator';

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
}