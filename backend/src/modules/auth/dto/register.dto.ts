import { IsString, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MaxLength(50)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/(?=.*[A-Z])(?=.*\d)/, { message: 'Password must contain at least one uppercase and one number' })
  password!: string;

  @IsString()
  fullName!: string;
}