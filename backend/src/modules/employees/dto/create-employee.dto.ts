import { IsString, IsDateString, IsInt, Min, MaxLength } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @MaxLength(20)
  employeeCode!: string;

  @IsDateString()
  hireDate!: Date;

  @IsInt()
  @Min(1)
  userId!: number;
}