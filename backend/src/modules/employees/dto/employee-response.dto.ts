import { Exclude, Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@Exclude()
export class EmployeeResponseDto {
  @Expose() id!: number;
  @Expose() employeeCode!: string;
  @Expose() hireDate!: Date;
  @Expose() userId!: number;
  @Expose() @Type(() => UserResponseDto) user?: UserResponseDto;
  @Expose() createdAt!: Date;
}