// src/services/api/customerAuth.service.ts
import { BaseService } from './base.service';

class CustomerAuthService extends BaseService {
  // Forgot password - gửi OTP
  async forgotPassword(email: string): Promise<void> {
    return this.post('/auth/forgot-password', { email });
  }

  // Reset password - xác nhận OTP
  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    return this.post('/auth/reset-password', { email, otp, newPassword });
  }
}

export const customerAuthService = new CustomerAuthService();