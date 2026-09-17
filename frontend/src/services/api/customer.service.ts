import { BaseService } from './base.service';
import { Customer } from '@/types';

class CustomerService extends BaseService {
  async getProfile(): Promise<Customer> {
    return this.get<Customer>('/customers/me');
  }

  async updateProfile(data: Partial<Customer>): Promise<Customer> {
    return this.patch<Customer>('/customers/me', data);
  }
}

export const customerService = new CustomerService();