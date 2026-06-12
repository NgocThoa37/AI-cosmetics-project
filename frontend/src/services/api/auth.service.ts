import { BaseService } from './base.service';
import { API_ENDPOINTS } from '@/common/constants/api.constants';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types';

class AuthService extends BaseService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.post<LoginResponse>(API_ENDPOINTS.AUTH_LOGIN, data);
  }

  async register(data: RegisterRequest): Promise<{ message: string }> {
    return this.post<{ message: string }>(API_ENDPOINTS.AUTH_REGISTER, data);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return this.post<{ accessToken: string }>(API_ENDPOINTS.AUTH_REFRESH, { refreshToken });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.post<{ message: string }>(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, { email });
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    return this.post<{ message: string }>(API_ENDPOINTS.AUTH_RESET_PASSWORD, { email, otp, newPassword });
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.post<{ message: string }>(API_ENDPOINTS.AUTH_CHANGE_PASSWORD, { oldPassword, newPassword });
  }

  async logout(): Promise<{ message: string }> {
    return this.post<{ message: string }>(API_ENDPOINTS.AUTH_LOGOUT);
  }
}

export const authService = new AuthService();