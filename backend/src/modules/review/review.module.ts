import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Review } from './entities/review.entity';
import { ReviewReply } from './entities/review-reply.entity';
import { OrderModule } from '../order/order.module';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';  

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, ReviewReply]),
    OrderModule,
    ProductsModule,
    CustomersModule,  
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}