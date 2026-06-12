import { BaseService } from './base.service';
import { API_ENDPOINTS } from '@/common/constants/api.constants';
import { Review } from '@/types';

class ReviewService extends BaseService {
  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return this.get<Review[]>(API_ENDPOINTS.REVIEWS_BY_PRODUCT(productId));
  }

  async createReview(data: {
    orderItemId: number;
    rating: number;
    title?: string;
    comment?: string;
    imageUrls?: string[];
    }): Promise<Review> {
      return this.post<Review>(API_ENDPOINTS.REVIEWS, data);
  }

  async getMyReviews(): Promise<Review[]> {
  return this.get<Review[]>(`${API_ENDPOINTS.REVIEWS}/my-reviews`);
}

async checkReviewed(orderItemId: number): Promise<boolean> {
  try {
    const res = await this.get<{ reviewed: boolean }>(`${API_ENDPOINTS.REVIEWS}/check/${orderItemId}`);
    return res.reviewed;
  } catch {
    return false;
  }
}

}


export const reviewService = new ReviewService();