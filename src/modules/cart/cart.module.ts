import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart } from './entities/cart.entity';
import { CartDetail } from './entities/cart-detail.entity';
import { CustomersModule } from '../customers/customers.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module'; // ✅ THÊM DÒNG NÀY

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartDetail]), 
    CustomersModule, 
    ProductsModule,
    UsersModule, // ✅ THÊM DÒNG NÀY
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}