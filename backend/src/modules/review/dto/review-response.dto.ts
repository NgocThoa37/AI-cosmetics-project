import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../users/dto/user-response.dto';

class ReviewReplyResponseDto {
  @Expose() id!: number;
  @Expose() reply!: string;
  @Expose() repliedAt!: Date;
  @Expose() isEdited!: boolean;
  @Expose() editAt?: Date;
  @Expose() employeeId!: number;
}

export class ReviewResponseDto {
  @Expose() id!: number;
  @Expose() orderItemId!: number;
  @Expose() rating!: number;
  @Expose() title?: string;
  @Expose() comment?: string;
  @Expose() imageUrls?: string[];
  @Expose() reviewDate!: Date;
  @Expose() isVerifiedPurchase!: boolean;
  @Expose() isApproved!: boolean;
  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;
  
  @Expose()
  @Type(() => UserResponseDto)
  customer?: UserResponseDto;
  
  @Expose()
  @Type(() => ReviewReplyResponseDto)
  replies?: ReviewReplyResponseDto[];
}