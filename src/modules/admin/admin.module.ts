import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { Account } from '../auth/entities/account.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';
import { ProductDetail } from '../products/entities/product-detail.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { Category } from '../categories/entities/category.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Order } from '../order/entities/order.entity';
import { OrderDetail } from '../order/entities/order-detail.entity';
import { Review } from '../review/entities/review.entity';
import { ReviewReply } from '../review/entities/review-reply.entity';
import { Color } from '../products/entities/color.entity';
import { Size } from '../products/entities/size.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Account,
      Employee,
      Customer,
      Product,
      ProductDetail,
      ProductImage,
      Category,
      Brand,
      Order,
      OrderDetail, 
      Review,
      ReviewReply,
      Color,
      Size,
    ]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'your_jwt_secret_key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService], 
})
export class AdminModule {}