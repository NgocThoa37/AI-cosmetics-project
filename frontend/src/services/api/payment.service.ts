import { BaseService } from './base.service';
import { API_ENDPOINTS } from '@/common/constants/api.constants';

class PaymentService extends BaseService {
  async createMomoPayment(orderId: number, returnUrl: string): Promise<{ payUrl: string }> {
    return this.post<{ payUrl: string }>(API_ENDPOINTS.PAYMENT_MOMO_CREATE, { orderId, returnUrl });
  }

  async createVnpayPayment(orderId: number, returnUrl: string): Promise<{ payUrl: string }> {
    return this.post<{ payUrl: string }>(API_ENDPOINTS.PAYMENT_VNPAY_CREATE, { orderId, returnUrl });
  }
}

export const paymentService = new PaymentService();