// ==================== ENUMS ====================
export enum Role {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
  CUSTOMER = 'customer'
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned'
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock'
}

export enum BrandStatus {
  COOPERATING = 'cooperating',
  SUSPENDED = 'suspended',
}

export enum CategoryStatus {
  VISIBLE = 'Hiển thị',
  HIDDEN = 'Ẩn'
}

// ==================== USER & ACCOUNT ====================
export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt?: Date;
}

export interface Account {
  id: number;
  username: string;
  role: Role | string;
  status: string;
  userId: number;
  user?: User;
  createdAt: Date;
}

// ==================== CUSTOMER ====================
export interface Customer {
  id: number;
  userId: number;
  user?: User;
  createdAt: Date;
}

// ==================== EMPLOYEE ====================
export interface Employee {
  id: number;
  employeeCode: string;
  hireDate: string | Date;
  userId: number;
  user?: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  status?: string;
}

// ==================== CATEGORY ====================
export interface Category {
  id: number;
  catCode: string;
  name: string;
  description?: string;
  status: string;
  parentId?: number;
  children?: Category[];
}

// ==================== Employee ====================
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

// ==================== BRAND ====================
export interface Brand {
  id: number;  
  brandCode: string;
  name: string;
  origin: string;
  status: string; 
}

// ==================== COLOR & SIZE ====================
export interface Color {
  id: number;
  name: string;
  code: string;
}

export interface Size {
  id: number;
  name: string;
}

// ==================== PRODUCT ====================
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  status: string;
  totalSold?: number;
  averageRating?: number;
  categoryId: number;
  category?: Category;
  brandId: number;
  brand?: Brand;
  details?: ProductDetail[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ==================== PRODUCT DETAIL ====================
export interface ProductDetail {
  id: string;
  productId: string;
  product?: Product;
  sku?: string;
  quantity: number;
  colorId?: number;
  color?: Color;
  sizeId?: number;
  size?: Size;
  price?: number;
  createdAt?: Date;
}

// ==================== PRODUCT IMAGE ====================
export interface ProductImage {
  id: number;
  productId: string;
  productDetailId?: string;
  product?: Product;
  imageUrl: string;
  isMain: boolean;
  displayOrder?: number;
  altText?: string;
  createdAt?: Date;
}

// ==================== ORDER ====================
export interface OrderItem {
  id?: number;
  productName?: string;        // ✅ THÊM
  productId?: string;          // ✅ THÊM
  productDetailId?: string;    // ✅ THÊM
  quantity: number;
  price: number;
  unitPrice?: number;          // ✅ THÊM
  subtotal?: number;           // ✅ THÊM
  product?: {                  // ✅ THÊM
    id: string;
    name: string;
  };
  productDetail?: {            // ✅ THÊM
    id: string;
    price: number;
    product?: {
      id: string;
      name: string;
    };
  };
}

export interface Order {
  id: number;
  orderCode?: string;
  customerId?: number;
  customer?: Customer;
  totalAmount: number;
  orderStatus: string;
  createdAt: Date;
  details?: OrderItem[];
}

// ==================== REVIEW ====================
export interface ReviewReply {
  id: number;
  reply: string;
  repliedAt: Date;
  employeeId: number;
  employee?: Employee;
}

export interface Review {
  id: number;
  rating: number;
  content: string;
  createdAt: Date;
  customerId?: number;
  customer?: Customer;
  productId?: string;
  product?: Product;
  reply?: ReviewReply;
}

// ==================== STATISTICS ====================
export interface RevenueStat {
  period: string;
  revenue: number;
  orders?: number;
}

export interface BestSeller {
  id: string;
  name: string;
  totalSold: number;
  price: number;
  revenue?: number;
}

// ==================== API RESPONSE ====================
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

// ==================== ADMIN TAB ====================
export type AdminTab = 
  | 'dashboard'
  | 'accounts'
  | 'employees'
  | 'customers'
  | 'categories'
  | 'brands'
  | 'colors'
  | 'sizes'
  | 'products'
  | 'product_details'
  | 'product_images'
  | 'orders'
  | 'reviews'
  | 'statistics'
  | 'stats_best_sellers'
  | 'stats_revenue';