import { ApiProperty } from '@nestjs/swagger';

export class EmbeddingDto {
  @ApiProperty({ description: 'Văn bản cần tạo embedding' })
  text!: string;
}