import { ApiProperty } from '@nestjs/swagger';

export class ChatDto {
  @ApiProperty({ description: 'Tin nhắn của khách hàng' })
  message!: string;

  @ApiProperty({ required: false, description: 'ID người dùng' })
  userId?: string;

  @ApiProperty({ required: false, description: 'Lịch sử chat' })
  history?: Array<{ role: string; content: string }>;
}