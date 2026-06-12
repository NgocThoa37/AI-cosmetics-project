import { axiosClient } from '@/plugins/axios.config';
import { 
  Account, Employee, Category, Product, ProductDetail, ProductImage,
  Brand, ProductVariant, Order, Review, RevenueStat, BestSeller,
  ApiResponse
} from '@/types/admin.types';

const BASE_URL = '/admin';

class AdminService {
  // ==================== Accounts ====================
  async getAccounts(): Promise<Account[]> {
    const res = await axiosClient.get<ApiResponse<Account[]>>(`${BASE_URL}/accounts`);
    return res.data.data;
  }

  async getAccountById(id: string): Promise<Account> {
    const res = await axiosClient.get<ApiResponse<Account>>(`${BASE_URL}/accounts/${id}`);
    return res.data.data;
  }

  async createAccount(data: Partial<Account>): Promise<Account> {
    const res = await axiosClient.post<ApiResponse<Account>>(`${BASE_URL}/accounts`, data);
    return res.data.data;
  }

  async updateAccount(id: string, data: Partial<Account>): Promise<Account> {
    const res = await axiosClient.patch<ApiResponse<Account>>(`${BASE_URL}/accounts/${id}`, data);
    return res.data.data;
  }

  async updateAccountStatus(id: string, status: string): Promise<Account> {
    const res = await axiosClient.patch<ApiResponse<Account>>(`${BASE_URL}/accounts/${id}/status`, { status });
    return res.data.data;
  }

  async deleteAccount(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/accounts/${id}`);
  }

  // ==================== Employees ====================
  async getEmployees(): Promise<Employee[]> {
    const res = await axiosClient.get<ApiResponse<Employee[]>>(`${BASE_URL}/employees`);
    return res.data.data;
  }

  async getEmployeeById(id: string): Promise<Employee> {
    const res = await axiosClient.get<ApiResponse<Employee>>(`${BASE_URL}/employees/${id}`);
    return res.data.data;
  }

  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    const res = await axiosClient.post<ApiResponse<Employee>>(`${BASE_URL}/employees`, data);
    return res.data.data;
  }

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    const res = await axiosClient.patch<ApiResponse<Employee>>(`${BASE_URL}/employees/${id}`, data);
    return res.data.data;
  }

  async updateEmployeeStatus(id: string, status: string): Promise<Employee> {
    const res = await axiosClient.patch<ApiResponse<Employee>>(`${BASE_URL}/employees/${id}/status`, { status });
    return res.data.data;
  }

  async deleteEmployee(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/employees/${id}`);
  }

  // ==================== Categories ====================
  async getCategories(): Promise<Category[]> {
    const res = await axiosClient.get<ApiResponse<Category[]>>(`${BASE_URL}/categories`);
    return res.data.data;
  }

  async getCategoryById(id: string): Promise<Category> {
    const res = await axiosClient.get<ApiResponse<Category>>(`${BASE_URL}/categories/${id}`);
    return res.data.data;
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    const res = await axiosClient.post<ApiResponse<Category>>(`${BASE_URL}/categories`, data);
    return res.data.data;
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const res = await axiosClient.patch<ApiResponse<Category>>(`${BASE_URL}/categories/${id}`, data);
    return res.data.data;
  }

  async updateCategoryStatus(id: string, status: string): Promise<Category> {
    const res = await axiosClient.patch<ApiResponse<Category>>(`${BASE_URL}/categories/${id}/status`, { status });
    return res.data.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/categories/${id}`);
  }

  // ==================== Products ====================
  async getProducts(): Promise<Product[]> {
    const res = await axiosClient.get<ApiResponse<Product[]>>(`${BASE_URL}/products`);
    return res.data.data;
  }

  async getProductById(id: string): Promise<Product> {
    const res = await axiosClient.get<ApiResponse<Product>>(`${BASE_URL}/products/${id}`);
    return res.data.data;
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await axiosClient.post<ApiResponse<Product>>(`${BASE_URL}/products`, data);
    return res.data.data;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await axiosClient.patch<ApiResponse<Product>>(`${BASE_URL}/products/${id}`, data);
    return res.data.data;
  }

  async updateProductQuantity(id: string, quantity: number): Promise<void> {
    await axiosClient.patch(`${BASE_URL}/products/${id}/quantity`, { quantity });
  }

  async updateProductStatus(id: string, status: string): Promise<void> {
    await axiosClient.patch(`${BASE_URL}/products/${id}/status`, { status });
  }

  async deleteProduct(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/products/${id}`);
  }

  // ==================== Product Details ====================
  async getProductDetails(): Promise<ProductDetail[]> {
    const res = await axiosClient.get<ApiResponse<ProductDetail[]>>(`${BASE_URL}/products/details`);
    return res.data.data;
  }

  async getProductDetailById(id: string): Promise<ProductDetail> {
    const res = await axiosClient.get<ApiResponse<ProductDetail>>(`${BASE_URL}/products/details/${id}`);
    return res.data.data;
  }

  async createProductDetail(data: Partial<ProductDetail>): Promise<ProductDetail> {
    const res = await axiosClient.post<ApiResponse<ProductDetail>>(`${BASE_URL}/products/details`, data);
    return res.data.data;
  }

  async updateProductDetail(id: string, data: Partial<ProductDetail>): Promise<ProductDetail> {
    const res = await axiosClient.patch<ApiResponse<ProductDetail>>(`${BASE_URL}/products/details/${id}`, data);
    return res.data.data;
  }

  async deleteProductDetail(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/products/details/${id}`);
  }

  // ==================== Product Images ====================
  async getProductImages(): Promise<ProductImage[]> {
    const res = await axiosClient.get<ApiResponse<ProductImage[]>>(`${BASE_URL}/products/images`);
    return res.data.data;
  }

  async getProductImageById(id: string): Promise<ProductImage> {
    const res = await axiosClient.get<ApiResponse<ProductImage>>(`${BASE_URL}/products/images/${id}`);
    return res.data.data;
  }

  async createProductImage(data: Partial<ProductImage>): Promise<ProductImage> {
    const res = await axiosClient.post<ApiResponse<ProductImage>>(`${BASE_URL}/products/images`, data);
    return res.data.data;
  }

  async updateProductImage(id: string, data: Partial<ProductImage>): Promise<ProductImage> {
    const res = await axiosClient.patch<ApiResponse<ProductImage>>(`${BASE_URL}/products/images/${id}`, data);
    return res.data.data;
  }

  async deleteProductImage(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/products/images/${id}`);
  }

  // ==================== Brands ====================
  async getBrands(): Promise<Brand[]> {
    const res = await axiosClient.get<ApiResponse<Brand[]>>(`${BASE_URL}/brands`);
    return res.data.data;
  }

  async getBrandById(id: string): Promise<Brand> {
    const res = await axiosClient.get<ApiResponse<Brand>>(`${BASE_URL}/brands/${id}`);
    return res.data.data;
  }

  async createBrand(data: Partial<Brand>): Promise<Brand> {
    const res = await axiosClient.post<ApiResponse<Brand>>(`${BASE_URL}/brands`, data);
    return res.data.data;
  }

  async updateBrand(id: string, data: Partial<Brand>): Promise<Brand> {
    const res = await axiosClient.patch<ApiResponse<Brand>>(`${BASE_URL}/brands/${id}`, data);
    return res.data.data;
  }

  async updateBrandStatus(id: string, status: string): Promise<Brand> {
    const res = await axiosClient.patch<ApiResponse<Brand>>(`${BASE_URL}/brands/${id}/status`, { status });
    return res.data.data;
  }

  async deleteBrand(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/brands/${id}`);
  }

  // ==================== Variants ====================
  async getVariants(): Promise<ProductVariant[]> {
    const res = await axiosClient.get<ApiResponse<ProductVariant[]>>(`${BASE_URL}/variants`);
    return res.data.data;
  }

  async getVariantsByType(type: string): Promise<ProductVariant[]> {
    const res = await axiosClient.get<ApiResponse<ProductVariant[]>>(`${BASE_URL}/variants`, { params: { type } });
    return res.data.data;
  }

  async getVariantById(id: string): Promise<ProductVariant> {
    const res = await axiosClient.get<ApiResponse<ProductVariant>>(`${BASE_URL}/variants/${id}`);
    return res.data.data;
  }

  async createVariant(data: Partial<ProductVariant>): Promise<ProductVariant> {
    const res = await axiosClient.post<ApiResponse<ProductVariant>>(`${BASE_URL}/variants`, data);
    return res.data.data;
  }

  async updateVariant(id: string, data: Partial<ProductVariant>): Promise<ProductVariant> {
    const res = await axiosClient.patch<ApiResponse<ProductVariant>>(`${BASE_URL}/variants/${id}`, data);
    return res.data.data;
  }

  async deleteVariant(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/variants/${id}`);
  }

  // Helper methods for specific variant types
  async getColors(): Promise<ProductVariant[]> {
    return this.getVariantsByType('Màu sắc');
  }

  async getSizes(): Promise<ProductVariant[]> {
    return this.getVariantsByType('Kích thước');
  }

  async getSkinTypes(): Promise<ProductVariant[]> {
    return this.getVariantsByType('Loại da');
  }

  // ==================== Orders ====================
  async getOrders(): Promise<Order[]> {
    const res = await axiosClient.get<ApiResponse<Order[]>>(`${BASE_URL}/orders`);
    return res.data.data;
  }

  async getOrderById(id: string): Promise<Order> {
    const res = await axiosClient.get<ApiResponse<Order>>(`${BASE_URL}/orders/${id}`);
    return res.data.data;
  }

  async createOrder(data: Partial<Order>): Promise<Order> {
    const res = await axiosClient.post<ApiResponse<Order>>(`${BASE_URL}/orders`, data);
    return res.data.data;
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    const res = await axiosClient.patch<ApiResponse<Order>>(`${BASE_URL}/orders/${id}`, data);
    return res.data.data;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const res = await axiosClient.patch<ApiResponse<Order>>(`${BASE_URL}/orders/${id}/status`, { status });
    return res.data.data;
  }

  async deleteOrder(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/orders/${id}`);
  }

  // ==================== Reviews ====================
  async getReviews(): Promise<Review[]> {
    const res = await axiosClient.get<ApiResponse<Review[]>>(`${BASE_URL}/reviews`);
    return res.data.data;
  }

  async getReviewById(id: string): Promise<Review> {
    const res = await axiosClient.get<ApiResponse<Review>>(`${BASE_URL}/reviews/${id}`);
    return res.data.data;
  }

  async replyToReview(id: string, replyText: string): Promise<Review> {
    const res = await axiosClient.post<ApiResponse<Review>>(`${BASE_URL}/reviews/${id}/reply`, { replyText });
    return res.data.data;
  }

  async deleteReview(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/reviews/${id}`);
  }

  // ==================== Statistics ====================
  async getBestSellers(limit: number = 10): Promise<BestSeller[]> {
    const res = await axiosClient.get<ApiResponse<BestSeller[]>>(`${BASE_URL}/statistics/best-sellers`, { params: { limit } });
    return res.data.data;
  }

  async getRevenueStats(startDate?: string, endDate?: string, groupBy: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<RevenueStat[]> {
    const res = await axiosClient.get<ApiResponse<RevenueStat[]>>(`${BASE_URL}/statistics/revenue`, { params: { startDate, endDate, groupBy } });
    return res.data.data;
  }

  async getOrderStats(): Promise<{ totalOrders: number; pendingOrders: number; deliveredOrders: number; cancelledOrders: number }> {
    const res = await axiosClient.get<ApiResponse<any>>(`${BASE_URL}/statistics/orders`);
    return res.data.data;
  }

  async getCustomerStats(): Promise<{ totalCustomers: number; newCustomersLast30Days: number }> {
    const res = await axiosClient.get<ApiResponse<any>>(`${BASE_URL}/statistics/customers`);
    return res.data.data;
  }

  async exportRevenueExcel(startDate: string, endDate: string): Promise<Blob> {
    const res = await axiosClient.get(`${BASE_URL}/statistics/export/excel`, {
      params: { startDate, endDate },
      responseType: 'blob'
    });
    return res.data;
  }

  async exportRevenuePDF(startDate: string, endDate: string): Promise<Blob> {
    const res = await axiosClient.get(`${BASE_URL}/statistics/export/pdf`, {
      params: { startDate, endDate },
      responseType: 'blob'
    });
    return res.data;
  }

  // ==================== Dashboard ====================
  async getDashboardStats(): Promise<{
    totalCustomers: number;
    totalOrders: number;
    deliveredOrders: number;
    totalRevenue: number;
    pendingReviews: number;
  }> {
    const [customers, orders, reviews] = await Promise.all([
      this.getAccounts(),
      this.getOrders(),
      this.getReviews()
    ]);
    
    return {
      totalCustomers: customers.length,
      totalOrders: orders.length,
      deliveredOrders: orders.filter(o => o.status === 'Đã giao').length,
      totalRevenue: orders.filter(o => o.status === 'Đã giao').reduce((sum, o) => sum + o.totalPrice, 0),
      pendingReviews: reviews.filter(r => r.status === 'Chưa phản hồi').length
    };
  }
}

export const adminService = new AdminService();