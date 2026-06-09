import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose() id!: number;
  @Expose() fullName!: string;
  @Expose() dob!: Date;
  @Expose() gender!: string;
  @Expose() phone!: string;
  @Expose() email!: string;
  @Expose() avatar!: string;
  @Expose() createdAt!: Date;
}