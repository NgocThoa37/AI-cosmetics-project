import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

class CreateCustomerDto {
  @IsNumber()
  userId!: number;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalOrder?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalSpent?: number;
}