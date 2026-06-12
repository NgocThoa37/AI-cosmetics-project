export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
};

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/auth/reset-password',
  AUTH_CHANGE_PASSWORD: '/auth/change-password',
  AUTH_LOGOUT: '/auth/logout',
  
  // Users
  USERS: '/users',
  USERS_ME: '/customers/me',
  
  // Products
  PRODUCTS: '/products',
  PRODUCTS_DETAILS: '/products/details',
  PRODUCTS_IMAGES: '/products/images',
  PRODUCTS_SIZES: '/products/sizes',
  PRODUCTS_COLORS: '/products/colors',
  PRODUCTS_PACKAGING: '/products/packaging-types',
  
  // Categories
  CATEGORIES: '/categories',
  
  // Cart
  CART: '/cart',
  CART_ADD: '/cart/add',
  CART_UPDATE: '/cart/update',
  CART_REMOVE: '/cart/remove',
  CART_CLEAR: '/cart/clear',
  
  // Orders
  ORDERS: '/orders',
  ORDERS_MY: '/orders/my-orders',
  ORDERS_CANCEL: (id: number) => `/orders/${id}/cancel`,
  ORDERS_STATUS: (id: number) => `/orders/${id}/status`,
  
  // Payment
  PAYMENT_MOMO_CREATE: '/payment/momo/create',
  PAYMENT_VNPAY_CREATE: '/payment/vnpay/create',
  
  // Reviews
  REVIEWS: '/reviews',
  REVIEWS_BY_PRODUCT: (productId: string) => `/reviews/product/${productId}`,
  REVIEWS_APPROVE: (id: number) => `/reviews/${id}/approve`,
  REVIEWS_REPLY: (id: number) => `/reviews/${id}/reply`,
  
  // Admin
  ADMIN_ACCOUNTS: '/admin/accounts',
  ADMIN_ACCOUNTS_STATUS: (id: number) => `/admin/accounts/${id}/status`,
  ADMIN_ACCOUNTS_ROLE: (id: number) => `/admin/accounts/${id}/role`,
  
  // Statistics
  STATISTICS_REVENUE: '/statistics/revenue',
  STATISTICS_BEST_SELLING: '/statistics/best-selling',
  STATISTICS_ORDERS: '/statistics/orders',
  STATISTICS_CUSTOMERS: '/statistics/customers',
  STATISTICS_EXPORT_EXCEL: '/statistics/export/excel',
  STATISTICS_EXPORT_PDF: '/statistics/export/pdf',
};