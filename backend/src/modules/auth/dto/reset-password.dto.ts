import { IsString, IsEmail, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  otp!: string;

  @IsString()
  @MinLength(6)
  newPassword!: string;

  @IsEmail()
  email!: string;
}