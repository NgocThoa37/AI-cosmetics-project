import { axiosClient } from '@/plugins/axios.config';
import { 
  Account, Employee, Category, Product, ProductDetail, ProductImage,
  Brand, Order, Review, RevenueStat, BestSeller, Color, Size,
  ApiResponse, Customer
} from '@/types/admin.types';

const BASE_URL = '/admin';

class AdminService {
  // ==================== ACCOUNTS ====================
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
    const res = await axiosClient.put<ApiResponse<Account>>(`${BASE_URL}/accounts/${id}`, data);
    return res.data.data;
  }

  async updateAccountStatus(id: string, status: string): Promise<Account> {
    const res = await axiosClient.patch<ApiResponse<Account>>(`${BASE_URL}/accounts/${id}/status`, { status });
    return res.data.data;
  }

  async deleteAccount(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/accounts/${id}`);
  }

  // ==================== EMPLOYEES ====================
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

  async deleteEmployee(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/employees/${id}`);
  }

  // ==================== CUSTOMERS ====================
  async getCustomers(): Promise<Customer[]> {
    const res = await axiosClient.get<ApiResponse<Customer[]>>(`${BASE_URL}/customers`);
    return res.data.data;
  }

  async getCustomerById(id: string): Promise<Customer> {
    const res = await axiosClient.get<ApiResponse<Customer>>(`${BASE_URL}/customers/${id}`);
    return res.data.data;
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const res = await axiosClient.post<ApiResponse<Customer>>(`${BASE_URL}/customers`, data);
    return res.data.data;
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const res = await axiosClient.patch<ApiResponse<Customer>>(`${BASE_URL}/customers/${id}`, data);
    return res.data.data;
  }

  async deleteCustomer(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/customers/${id}`);
  }

  // ==================== CATEGORIES ====================
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

  async deleteCategory(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/categories/${id}`);
  }

  // ==================== BRANDS ====================
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

  async deleteBrand(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/brands/${id}`);
  }

  // ==================== COLORS ====================
  async getColors(page?: number, limit?: number): Promise<{ data: Color[]; total: number; page: number; totalPages: number }> {
    const res = await axiosClient.get<ApiResponse<any>>(`${BASE_URL}/colors`, { params: { page, limit } });
    return res.data.data;
  }

  async getColorById(id: number): Promise<Color> {
  if (!id || isNaN(id) || id <= 0) {
    console.warn('Invalid color ID:', id);
    return null as any;
  }
  const res = await axiosClient.get<ApiResponse<Color>>(`${BASE_URL}/colors/${id}`);
  return res.data.data;
}

  async createColor(data: { name: string; code: string }): Promise<Color> {
    const res = await axiosClient.post<ApiResponse<Color>>(`${BASE_URL}/colors`, data);
    return res.data.data;
  }

  async updateColor(id: number, data: { name?: string; code?: string }): Promise<Color> {
    const res = await axiosClient.patch<ApiResponse<Color>>(`${BASE_URL}/colors/${id}`, data);
    return res.data.data;
  }

  async deleteColor(id: number): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/colors/${id}`);
  }

  async deleteMultipleColors(ids: number[]): Promise<{ success: number[]; failed: { id: number; reason: string }[] }> {
    const res = await axiosClient.post<ApiResponse<any>>(`${BASE_URL}/colors/delete-multiple`, { ids });
    return res.data.data;
  }

  // ==================== SIZES ====================
  async getSizes(page?: number, limit?: number): Promise<{ data: Size[]; total: number; page: number; totalPages: number }> {
    const res = await axiosClient.get<ApiResponse<any>>(`${BASE_URL}/sizes`, { params: { page, limit } });
    return res.data.data;
  }

  async getSizeById(id: number): Promise<Size> {
    if (!id || isNaN(id) || id <= 0) {
      console.warn('Invalid size ID:', id);
      return null as any;
    }
    const res = await axiosClient.get<ApiResponse<Size>>(`${BASE_URL}/sizes/${id}`);
    return res.data.data;
  }

  async createSize(data: { name: string; code?: string; sortOrder?: number }): Promise<Size> {
    const res = await axiosClient.post<ApiResponse<Size>>(`${BASE_URL}/sizes`, data);
    return res.data.data;
  }

  async updateSize(id: number, data: { name?: string; code?: string; sortOrder?: number }): Promise<Size> {
    const res = await axiosClient.patch<ApiResponse<Size>>(`${BASE_URL}/sizes/${id}`, data);
    return res.data.data;
  }

  async deleteSize(id: number): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/sizes/${id}`);
  }

  async deleteMultipleSizes(ids: number[]): Promise<{ success: number[]; failed: { id: number; reason: string }[] }> {
    const res = await axiosClient.post<ApiResponse<any>>(`${BASE_URL}/sizes/delete-multiple`, { ids });
    return res.data.data;
  }

  async reorderSizes(orderIds: number[]): Promise<{ message: string; sizes: Size[] }> {
    const res = await axiosClient.post<ApiResponse<any>>(`${BASE_URL}/sizes/reorder`, { orderIds });
    return res.data.data;
  }

  // ==================== PRODUCTS ====================
  async getProducts(): Promise<Product[]> {
    const res = await axiosClient.get<ApiResponse<Product[]>>(`${BASE_URL}/products`);
    return res.data.data;
  }

  async getProductById(id: string): Promise<Product> {
    const res = await axiosClient.get<ApiResponse<Product>>(`${BASE_URL}/products/${id}`);
    return res.data.data;
  }

  async getProductPrice(productId: string): Promise<{ price: number }> {
    const res = await axiosClient.get(`${BASE_URL}/products/${productId}/price`);
    return res.data;
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await axiosClient.post<ApiResponse<Product>>(`${BASE_URL}/products`, data);
    return res.data.data;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await axiosClient.patch<ApiResponse<Product>>(`${BASE_URL}/products/${id}`, data);
    return res.data.data;
  }

  async updateProductStatus(id: string, status: string): Promise<void> {
    await axiosClient.patch(`${BASE_URL}/products/${id}/status`, { status });
  }

  async deleteProduct(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/products/${id}`);
  }

  // ==================== PRODUCT DETAILS ====================
  async getProductDetails(): Promise<ProductDetail[]> {
    const res = await axiosClient.get<ApiResponse<ProductDetail[]>>(`${BASE_URL}/product-details`);
    return res.data.data;
  }

  async getProductDetailById(id: string): Promise<ProductDetail> {
    const res = await axiosClient.get<ApiResponse<ProductDetail>>(`${BASE_URL}/product-details/${id}`);
    return res.data.data;
  }

  async createProductDetail(data: Partial<ProductDetail>): Promise<ProductDetail> {
    const res = await axiosClient.post<ApiResponse<ProductDetail>>(`${BASE_URL}/product-details`, data);
    return res.data.data;
  }

  async updateProductDetail(id: string, data: Partial<ProductDetail>): Promise<ProductDetail> {
    const res = await axiosClient.patch<ApiResponse<ProductDetail>>(`${BASE_URL}/product-details/${id}`, data);
    return res.data.data;
  }

  async updateProductQuantity(id: string, quantity: number): Promise<void> {
    await axiosClient.patch(`${BASE_URL}/product-details/${id}/quantity`, { quantity });
  }

  async deleteProductDetail(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/product-details/${id}`);
  }

  // ==================== PRODUCT IMAGES ====================
  async getProductImages(): Promise<any[]> {
    try {
      console.log('📤 GET /admin/product-images');
      const res = await axiosClient.get(`/admin/product-images`);  // ✅ Sửa
      console.log('📦 Response:', res.data);
      
      const images = res.data?.data || res.data || [];
      return Array.isArray(images) ? images : [];
    } catch (error) {
      console.error('❌ Failed to fetch product images:', error);
      return [];
    }
  }

  async createProductImage(data: any): Promise<any> {
    console.log('📤 POST /admin/product-images', data);
    const res = await axiosClient.post(`/admin/product-images`, data);  // ✅ Đúng
    return res.data;
  }

  async updateProductImage(id: string, data: any): Promise<any> {
    console.log(`📤 PATCH /admin/product-images/${id}`, data);
    const res = await axiosClient.patch(`/admin/product-images/${id}`, data);  // ✅ Đúng
    return res.data;
  }

  async deleteProductImage(id: string): Promise<any> {
    console.log(`📤 DELETE /admin/product-images/${id}`);
    const res = await axiosClient.delete(`/admin/product-images/${id}`);  // ✅ Thêm nếu chưa có
    return res.data;
  }

  async uploadProductImage(file: File, productId?: string): Promise<any> {
    console.log('📤 Uploading file:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    if (productId) {
      formData.append('productId', productId);
    }
    
    try {
      // ✅ FIX: BỎ 's' - /upload/product (không có 's')
      const res = await axiosClient.post(`/upload/product`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('✅ Upload response:', res.data);
      
      // Xử lý response
      if (res.data?.imageUrl) {
        return res.data;
      }
      if (res.data?.data?.imageUrl) {
        return res.data.data;
      }
      return res.data;
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  }

  async deleteFile(fileUrl: string): Promise<any> {
  try {
    console.log('🗑️ [FRONTEND] Delete file:', fileUrl);
    
    // Gọi API xóa file
    const res = await axiosClient.delete(`/upload/file`, {
      data: { fileUrl: fileUrl }
    });
    
    console.log('✅ [FRONTEND] Delete file response:', res.data);
    return res.data?.data || res.data;
  } catch (error) {
    console.error('❌ [FRONTEND] Delete file Error:', error);
    throw error;
  }
}
  // ==================== ORDERS ====================
  async getOrders(): Promise<Order[]> {
    const res = await axiosClient.get<ApiResponse<Order[]>>(`${BASE_URL}/orders`);
    return res.data.data;
  }

  async getOrderById(id: string): Promise<Order> {
    const res = await axiosClient.get<ApiResponse<Order>>(`${BASE_URL}/orders/${id}`);
    return res.data.data;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const res = await axiosClient.patch<ApiResponse<Order>>(`${BASE_URL}/orders/${id}/status`, { status });
    return res.data.data;
  }

  async deleteOrder(id: string): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/orders/${id}`);
  }

  async deleteMultipleOrders(ids: number[]): Promise<{ success: number[]; failed: { id: number; reason: string }[] }> {
    const res = await axiosClient.post<ApiResponse<any>>(`${BASE_URL}/orders/delete-multiple`, { ids });
    return res.data.data;
  }

  // ==================== REVIEWS ====================
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

  // ==================== STATISTICS & REPORTS ====================
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
    try {
      const response = await axiosClient.get(`${BASE_URL}/statistics/export/excel`, {
        params: { startDate, endDate },
        responseType: 'blob',
      });
      
      console.log('📦 Excel response:', response);
      console.log('📦 Excel data type:', response.data instanceof Blob);
      console.log('📦 Excel size:', response.data.size);
      
      return response.data;
    } catch (error) {
      console.error('❌ Export Excel error:', error);
      throw error;
    }
  }

  async exportRevenuePDF(startDate: string, endDate: string): Promise<Blob> {
    try {
      const response = await axiosClient.get(`${BASE_URL}/statistics/export/pdf`, {
        params: { startDate, endDate },
        responseType: 'blob',
      });
      
      console.log('📦 PDF response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ Export PDF error:', error);
      throw error;
    }
  }

  // ==================== DASHBOARD ====================
  async getDashboardStats(): Promise<{
    totalCustomers: number;
    totalOrders: number;
    deliveredOrders: number;
    totalRevenue: number;
    pendingReviews: number;
  }> {
    const [customers, orders, reviews] = await Promise.all([
      this.getCustomers(),
      this.getOrders(),
      this.getReviews()
    ]);
    
    return {
      totalCustomers: customers.length,
      totalOrders: orders.length,
      deliveredOrders: orders.filter(o => o.orderStatus === 'delivered').length,
      totalRevenue: orders.filter(o => o.orderStatus === 'delivered').reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      pendingReviews: reviews.filter(r => !r.reply).length
    };
  }

  async findAccountByUsername(username: string): Promise<Account> {
    const res = await axiosClient.get<ApiResponse<Account>>(`${BASE_URL}/accounts/search`, { params: { username } });
    return res.data.data;
  }

  async updateAccountRole(id: string, role: string): Promise<Account> {
    const res = await axiosClient.patch<ApiResponse<Account>>(`${BASE_URL}/accounts/${id}/role`, { role });
    return res.data.data;
  }

  async toggleAccountLock(id: string): Promise<{ message: string; status: string }> {
    const res = await axiosClient.patch<ApiResponse<any>>(`${BASE_URL}/accounts/${id}/toggle-lock`);
    return res.data.data;
  }

  async getAllColors(): Promise<Color[]> {
    const res = await axiosClient.get<ApiResponse<Color[]>>(`${BASE_URL}/colors/all`);
    return res.data.data;
  }

  
  async getAllSizes(): Promise<Size[]> {
    const res = await axiosClient.get<ApiResponse<Size[]>>(`${BASE_URL}/sizes/all`);
    return res.data.data;
  }

  async forceDeleteOrder(id: string): Promise<{ message: string; deletedOrderId: number }> {
    const res = await axiosClient.delete<ApiResponse<any>>(`${BASE_URL}/orders/${id}/force`);
    return res.data.data;
  }
}

export const adminService = new AdminService();