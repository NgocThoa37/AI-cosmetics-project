import { Exclude, Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@Exclude()
export class CustomerResponseDto {
  @Expose() id!: number;
  @Expose() totalOrder!: number;
  @Expose() totalSpent!: number;
  @Expose() userId!: number;
  @Expose() @Type(() => UserResponseDto) user?: UserResponseDto;
  @Expose() createdAt!: Date;
}