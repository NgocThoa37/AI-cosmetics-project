import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Order } from '../order/entities/order.entity';
// 👇 THÊM MỚI: import provider PayOS
import { PayOSProvider } from './payos.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PayOSProvider, // 👈 THÊM MỚI
  ],
  // 👇 THÊM MỚI: export để module khác (nếu cần) có thể inject PaymentService
  exports: [PaymentService],
})
export class PaymentModule {}