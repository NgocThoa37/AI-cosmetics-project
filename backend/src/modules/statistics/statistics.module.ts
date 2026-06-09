import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { Order } from '../order/entities/order.entity';
import { OrderDetail } from '../order/entities/order-detail.entity';
import { Product } from '../products/entities/product.entity';
import { Customer } from '../customers/entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderDetail, Product, Customer])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}