import { BaseService } from './base.service';
import { API_ENDPOINTS } from '@/common/constants/api.constants';
import { Cart } from '@/types';

class CartService extends BaseService {
  async getCart(): Promise<Cart> {
    return this.get<Cart>(API_ENDPOINTS.CART);
  }

  async addToCart(productDetailId: string, quantity: number): Promise<Cart> {
    return this.post<Cart>(API_ENDPOINTS.CART_ADD, { productDetailId, quantity });
  }

  async updateCartItem(productDetailId: string, quantity: number): Promise<Cart> {
    return this.patch<Cart>(API_ENDPOINTS.CART_UPDATE, { productDetailId, quantity });
  }

  async removeCartItem(productDetailId: string): Promise<Cart> {
    return this.delete<Cart>(`${API_ENDPOINTS.CART_REMOVE}/${productDetailId}`);
  }

  async clearCart(): Promise<void> {
    return this.delete<void>(API_ENDPOINTS.CART_CLEAR);
  }
}

export const cartService = new CartService();