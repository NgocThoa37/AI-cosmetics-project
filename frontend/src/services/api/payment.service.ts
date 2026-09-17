// src/services/api/payment.service.ts
import { BaseService } from './base.service';
import { API_ENDPOINTS } from '@/common/constants/api.constants';

class PaymentService extends BaseService {
  async createMomoPayment(orderId: number, returnUrl: string): Promise<{ payUrl: string }> {
    // ✅ SỬA: /payment/momo
    return this.post<{ payUrl: string }>('/payment/momo', { orderId, returnUrl });
  }

  async createVnpayPayment(orderId: number, returnUrl: string): Promise<{ payUrl: string }> {
    // ✅ SỬA: Trả về payUrl để đồng nhất với momo
    const result = await this.post<{ paymentUrl: string }>('/payment/vnpay', { orderId });
    return { payUrl: result.paymentUrl };
  }
}

export const paymentService = new PaymentService();