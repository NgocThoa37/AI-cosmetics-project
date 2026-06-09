import { IsUUID, IsInt, Min } from 'class-validator';

export class UpdateCartDto {
  @IsUUID()
  productDetailId!: string;

  @IsInt()
  @Min(0)
  quantity!: number;
}