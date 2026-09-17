import { BaseService } from './base.service';
import { API_ENDPOINTS } from '@/common/constants/api.constants';
import { Product, ProductDetail, Category, Color, Size, Brand } from '@/types'; // ✅ Thêm Brand

interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

class ProductService extends BaseService {
  // Products
  async getProducts(params?: {
    category?: string;
    brand?: string;
    search?: string;
    skinType?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<PaginatedResponse<Product> | Product[]> {
    return this.get<PaginatedResponse<Product> | Product[]>(API_ENDPOINTS.PRODUCTS, params);
  }

  async getBestSellers(limit: number = 8): Promise<Product[]> {
    return this.get<Product[]>(`${API_ENDPOINTS.PRODUCTS}/best-sellers`, { limit });
  }

  async getProductById(id: string): Promise<Product> {
    return this.get<Product>(`${API_ENDPOINTS.PRODUCTS}/${id}`);
  }

  async getProductBySlug(slug: string): Promise<Product> {
    return this.get<Product>(`${API_ENDPOINTS.PRODUCTS}/slug/${slug}`);
  }

  async searchProducts(keyword: string): Promise<Product[]> {
    return this.get<Product[]>(`${API_ENDPOINTS.PRODUCTS}/search`, { keyword });
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.get<Category[]>(API_ENDPOINTS.CATEGORIES);
  }

  async getCategoryById(id: number): Promise<Category> {
    return this.get<Category>(`${API_ENDPOINTS.CATEGORIES}/${id}`);
  }

  async searchCategories(keyword: string): Promise<Category[]> {
    return this.get<Category[]>(`${API_ENDPOINTS.CATEGORIES}/search`, { keyword });
  }

  // ✅ THÊM: Brands
  async getBrands(): Promise<Brand[]> {
    return this.get<Brand[]>(API_ENDPOINTS.BRANDS);
  }

  async getBrandById(id: number): Promise<Brand> {
    return this.get<Brand>(`${API_ENDPOINTS.BRANDS}/${id}`);
  }

  // Sizes
  async getSizes(): Promise<Size[]> {
    return this.get<Size[]>(API_ENDPOINTS.PRODUCTS_SIZES);
  }

  // Colors
  async getColors(): Promise<Color[]> {
    return this.get<Color[]>(API_ENDPOINTS.PRODUCTS_COLORS);
  }

  // Product Details
  async getProductDetails(): Promise<ProductDetail[]> {
    return this.get<ProductDetail[]>(API_ENDPOINTS.PRODUCTS_DETAILS);
  }

  async getProductDetailById(id: string): Promise<ProductDetail> {
    return this.get<ProductDetail>(`${API_ENDPOINTS.PRODUCTS_DETAILS}/${id}`);
  }
}

export const productService = new ProductService();