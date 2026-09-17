import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { BrandStatus } from '../entities/brand.entity';

export class CreateBrandDto {
  @IsString()
  @MaxLength(50)
  brandCode!: string;

  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(100)
  origin!: string;

  @IsOptional()
  @IsEnum(BrandStatus)
  status?: BrandStatus;
}