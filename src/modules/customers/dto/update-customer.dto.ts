import { IsOptional, IsString, IsEmail, IsNumber, Min, IsDateString } from 'class-validator';

export class UpdateCustomerDto {
  // ===== USER FIELDS =====
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  // ===== CUSTOMER FIELDS =====
  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  // ===== STATS (không dùng update, nhưng giữ lại) =====
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalOrder?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalSpent?: number;
}