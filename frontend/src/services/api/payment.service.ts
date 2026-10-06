// src/services/api/payment.service.ts
import { BaseService } from './base.service';
import { API_ENDPOINTS } from '@/common/constants/api.constants';

// ==================================================================
// 👇 THÊM MỚI: interface cho response PayOS
// ==================================================================
export interface CreatePayOSResponse {
  success: boolean;
  checkoutUrl: string;
  qrCode?: string;
  payosOrderCode: number;
  orderCode: string;
  message: string;
}

class PaymentService extends BaseService {
  // ================================================================
  // ==================== GIỮ NGUYÊN: MoMo ==========================
  // ================================================================
  async createMomoPayment(
    orderId: number,
    returnUrl: string,
  ): Promise<{ payUrl: string }> {
    return this.post<{ payUrl: string }>('/payment/momo', {
      orderId,
      returnUrl,
    });
  }

  // ================================================================
  // ==================== GIỮ NGUYÊN: VNPay =========================
  // ================================================================
  async createVnpayPayment(
    orderId: number,
    returnUrl: string,
  ): Promise<{ payUrl: string }> {
    const result = await this.post<{ paymentUrl: string }>('/payment/vnpay', {
      orderId,
    });
    return { payUrl: result.paymentUrl };
  }

  // ================================================================
  // ==================== THÊM MỚI: PayOS ===========================
  // ================================================================
  /**
   * Tạo link thanh toán PayOS
   * @param orderId ID đơn hàng
   * @returns { success, checkoutUrl, qrCode, payosOrderCode, orderCode, message }
   */
  async createPayOsPayment(orderId: number): Promise<CreatePayOSResponse> {
    return this.post<CreatePayOSResponse>('/payment/payos', { orderId });
  }
}

export const paymentService = new PaymentService();