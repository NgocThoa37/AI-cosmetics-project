import { ApiProperty } from '@nestjs/swagger';
import { SkinType } from '../../products/enums/skin-type.enum';

export class SuggestRoutineDto {
  @ApiProperty({ enum: SkinType, description: 'Loại da' })
  skinType!: SkinType;

  @ApiProperty({ required: false, description: 'Mối quan tâm về da' })
  concerns?: string[];

  @ApiProperty({ required: false, enum: ['low', 'medium', 'high'], default: 'medium' })
  budget?: 'low' | 'medium' | 'high';
}