import { BaseService } from './base.service';
import { API_ENDPOINTS } from '@/common/constants/api.constants';
import { Order } from '@/types';

class OrderService extends BaseService {
  async createOrder(data: {
    shippingAddress: string;
    shippingPhone: string;
    note?: string;
    paymentMethod: string;
    items: { productDetailId: string; quantity: number }[];
  }): Promise<Order> {
    return this.post<Order>(API_ENDPOINTS.ORDERS, data);
  }

  async getMyOrders(): Promise<Order[]> {
    return this.get<Order[]>(API_ENDPOINTS.ORDERS_MY);
  }

  async getOrderById(id: number): Promise<Order> {
    return this.get<Order>(`${API_ENDPOINTS.ORDERS}/${id}`);
  }

  async cancelOrder(id: number, reason?: string): Promise<Order> {
    return this.patch<Order>(API_ENDPOINTS.ORDERS_CANCEL(id), { reason });
  }
}

export const orderService = new OrderService();