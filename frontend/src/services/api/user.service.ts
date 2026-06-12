import { BaseService } from './base.service';
import { API_ENDPOINTS } from '@/common/constants/api.constants';
import { User, Customer } from '@/types';

class UserService extends BaseService {
  async getMyProfile(): Promise<Customer> {
    return this.get<Customer>(API_ENDPOINTS.USERS_ME);
  }

  async updateMyProfile(data: Partial<User>): Promise<Customer> {
    return this.patch<Customer>(API_ENDPOINTS.USERS_ME, data);
  }

  async deleteMyAccount(): Promise<{ message: string }> {
    return this.delete<{ message: string }>(API_ENDPOINTS.USERS_ME);
  }
}

export const userService = new UserService();