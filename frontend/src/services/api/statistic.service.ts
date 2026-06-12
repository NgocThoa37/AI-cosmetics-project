import { BaseService } from './base.service';
import { API_ENDPOINTS } from '@/common/constants/api.constants';

class StatisticService extends BaseService {
  async getRevenue(startDate?: string, endDate?: string, groupBy?: 'day' | 'week' | 'month' | 'year') {
    return this.get(API_ENDPOINTS.STATISTICS_REVENUE, { startDate, endDate, groupBy });
  }

  async getBestSelling(limit?: number) {
    return this.get(API_ENDPOINTS.STATISTICS_BEST_SELLING, { limit });
  }

  async getOrderStats() {
    return this.get(API_ENDPOINTS.STATISTICS_ORDERS);
  }

  async getCustomerStats() {
    return this.get(API_ENDPOINTS.STATISTICS_CUSTOMERS);
  }

  async exportExcel(startDate: string, endDate: string) {
    return this.get(API_ENDPOINTS.STATISTICS_EXPORT_EXCEL, {
    params: { startDate, endDate },
    responseType: 'blob'
    });
  }

  async exportPDF(startDate: string, endDate: string) {
    return this.get(API_ENDPOINTS.STATISTICS_EXPORT_PDF, {
    params: { startDate, endDate },
    responseType: 'blob'
    });
  }
}

export const statisticService = new StatisticService();