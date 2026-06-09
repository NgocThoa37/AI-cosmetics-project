import { IsEmail, IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsString()
  fullName!: string;

  @IsOptional()
  @IsDateString()
  dob?: Date;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}