// src/modules/ai/ai.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { Product } from '../products/entities/product.entity';
import { ProductDetail } from '../products/entities/product-detail.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { Category } from '../categories/entities/category.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Review } from '../review/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductDetail,
      ProductImage,
      Category,
      Brand,
      Review,
    ]),
  ],
  controllers: [AiController],
  providers: [
    AiService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD', undefined),
          db: configService.get('REDIS_DB', 0),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [AiService],
})
export class AiModule {}