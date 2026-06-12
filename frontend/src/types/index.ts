// Enums
export enum SkinType {
  OILY = 'oily',
  DRY = 'dry',
  COMBINATION = 'combination',
  SENSITIVE = 'sensitive',
  NORMAL = 'normal',
  ALL = 'all',
}

export enum Role {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
  CUSTOMER = 'customer',
}

export enum PaymentMethod {
  COD = 'cod',
  MOMO = 'momo',
  VNPAY = 'vnpay',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

// Product Types
export interface Color {
  id: number;
  name: string;
  code: string;
  hexCode: string;
}

export interface Size {
  id: number;
  name: string;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  isMain: boolean;
  displayOrder: number;
  altText: string;
}

export interface ProductDetail {
  id: string;
  productId: string;
  colorId: number | null;
  sizeId: number | null;
  skinType: SkinType;
  sku: string;
  quantity: number;
  description: string | null;
  ingredients: string | null;
  usage: any;
  benefits: any;
  storage: string | null;
  color?: Color;
  size?: Size;
  images?: ProductImage[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: number;
  price: number;
  totalSold: number;
  averageRating: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  details?: ProductDetail[];
  images?: ProductImage[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  description: string | null;
  displayOrder: number;
  parent?: Category;
  children?: Category[];
}

// Cart Types
export interface Cart {
  id: number;
  customerId: number;
  totalItems: number;
  totalPrice: number;
  details: CartDetail[];
}

export interface CartDetail {
  id: number;
  cartId: number;
  productDetailId: string;
  quantity: number;
  productDetail?: ProductDetail;
  product?: Product;
}

export interface CartItem {
  productDetailId: string;
  quantity: number;
  product?: Product;
  productDetail?: ProductDetail;
}

// Order Types
export interface Order {
  id: number;
  orderCode: string;
  customerId: number;
  shippingAddress: string;
  shippingPhone: string;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  orderStatus: OrderStatus;
  note: string | null;
  cancelledReason: string | null;
  shipperDate: string | null;
  deliveredDate: string | null;
  estimatedDeliveredDate: string | null;
  createdAt: string;
  details?: OrderDetail[];
  customer?: Customer;
}

export interface OrderDetail {
  id: number;
  orderId: number;
  productDetailId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: Product;
  productDetail?: ProductDetail;
}

// User Types
export interface User {
  id: number;
  fullName: string;
  dob: string | null;
  gender: string | null;
  phone: string | null;
  email: string;
  avatar: string | null;
  createdAt: string;
  account?: Account;
  customer?: Customer;
}

export interface Account {
  id: number;
  userId: number;
  username: string;
  role: Role;
  status: string;
  user?: User;
}

export interface Customer {
  id: number;
  userId: number;
  totalOrder: number;
  totalSpent: number;
  user?: User;
}

// Review Types
export interface Review {
  id: number;
  orderItemId: number;
  customerId: number;
  productId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  imageUrls: string[];
  reviewDate: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
  customer?: Customer;
  product?: Product;
  replies?: ReviewReply[];
}

export interface ReviewReply {
  id: number;
  reviewId: number;
  employeeId: number;
  reply: string;
  repliedAt: string;
  isEdited: boolean;
  editAt: string | null;
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: Role;
  };
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface ApiResponse<T = any> {
  data: T;
  statusCode: number;
  message: string;
}

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

export interface DashboardStats {
  totalCustomers: number;
  totalOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  pendingReviews: number;
}