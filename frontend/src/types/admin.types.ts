// Account Management
export enum AccountStatus {
  ACTIVE = 'Hoạt động',
  LOCKED = 'Khóa'
}

export interface Account {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  joinedDate: string;
  status: AccountStatus;
}

// Employee Management
export enum EmployeeStatus {
  WORKING = 'Đang làm việc',
  ON_LEAVE = 'Nghỉ phép',
  RESIGNED = 'Đã nghỉ việc'
}

export enum EmployeeRole {
  MANAGER = 'Quản lý',
  SALES = 'Nhân viên bán hàng',
  SUPPORT = 'Chăm sóc khách hàng'
}

export interface Employee {
  id: string;
  empCode: string;
  fullName: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  status: EmployeeStatus;
}

// Category Management
export enum CategoryStatus {
  VISIBLE = 'Hiển thị',
  HIDDEN = 'Ẩn'
}

export interface Category {
  id: string;
  catCode: string;
  name: string;
  description: string;
  status: CategoryStatus;
  parentId?: string;
  children?: Category[];
}

// Product Management
export enum ProductStatus {
  IN_STOCK = 'Còn hàng',
  OUT_OF_STOCK = 'Hết hàng',
  DISCONTINUED = 'Ngừng bán'
}

export interface Product {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  price: number;
  createdDate: string;
  updatedDate: string;
  quantity: number;
  brandId: string;
  brandName?: string;
  description: string;
  image?: string;
  status: ProductStatus;
  totalSold?: number;
  averageRating?: number;
}

// Product Detail
export interface ProductDetail {
  id: string;
  productId: string;
  productName?: string;
  sku: string;
  quantity: number;
  skinType: string;
  color: string;
  size: string;
  description: string;
  ingredients: string;
  usage: string;
  benefits: string;
  storage: string;
}

// Product Image
export interface ProductImage {
  id: string;
  productId: string;
  productName?: string;
  imageUrl: string;
  isMain: boolean;
  displayOrder: number;
  altText: string;
}

// Brand Management
export enum BrandStatus {
  COOPERATING = 'Hợp tác',
  SUSPENDED = 'Ngừng hợp tác'
}

export interface Brand {
  id: string;
  brandCode: string;
  name: string;
  origin: string;
  status: BrandStatus;
}

// Variant Management
export interface ProductVariant {
  id: string;
  variantCode: string;
  name: string;
  value: string;
}

// Order Management
export enum OrderStatus {
  PENDING = 'Chờ xác nhận',
  CONFIRMED = 'Đã xác nhận',
  SHIPPING = 'Đang giao',
  DELIVERED = 'Đã giao',
  CANCELLED = 'Đã hủy'
}

export interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  address: string;
  totalPrice: number;
  createdDate: string;
  status: OrderStatus;
  items: OrderItem[];
}

// Review Management
export enum ReviewStatus {
  PENDING_REPLY = 'Chưa phản hồi',
  REPLIED = 'Đã phản hồi'
}

export interface Review {
  id: string;
  customerName: string;
  productName: string;
  rating: number;
  content: string;
  createdDate: string;
  status: ReviewStatus;
  replyText?: string;
  repliedBy?: string;
  repliedDate?: string;
}

// Statistics
export interface RevenueStat {
  period: string;
  revenue: number;
  orders: number;
}

export interface BestSeller {
  rank: number;
  name: string;
  sales: number;
  revenue: string;
}

// Admin Tab Types
export type AdminTab = 
  | 'dashboard'
  | 'accounts'
  | 'employees'
  | 'categories'
  | 'products'
  | 'products_details'
  | 'products_images'
  | 'brands'
  | 'variants_colors'
  | 'variants_sizes'
  | 'orders'
  | 'reviews'
  | 'stats_best_sellers'
  | 'stats_revenue';

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}