import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CategoryResponseDto {
  @Expose() id!: number;
  @Expose() name!: string;
  @Expose() slug!: string;
  @Expose() parentId!: number;
  @Expose() description!: string;
  @Expose() displayOrder!: number;
  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;
}