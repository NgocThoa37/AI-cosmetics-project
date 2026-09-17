import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { API_CONFIG } from '@/common/constants/api.constants';
import { getAccessToken, setAccessToken, getRefreshToken, removeAccessToken, removeRefreshToken, removeUser } from '@/helpers/storage.helper';

class AxiosConfig {
  private axiosInstance: AxiosInstance;  
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.axiosInstance = axios.create({  
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.setupInterceptors();
  }

  private getToken(config: InternalAxiosRequestConfig): string | null {
    console.log('🔍 [getToken] URL:', config.url);
    
    const customerToken = localStorage.getItem('customer_token');
    const adminToken = localStorage.getItem('admin_token');
    const fallbackToken = getAccessToken();
    
    console.log('🔍 [getToken] customer_token:', customerToken ? `${customerToken.substring(0, 30)}...` : 'KHÔNG');
    console.log('🔍 [getToken] admin_token:', adminToken ? 'CÓ' : 'KHÔNG');
    console.log('🔍 [getToken] fallbackToken:', fallbackToken ? 'CÓ' : 'KHÔNG');
    
    const isCustomerApi = config.url?.includes('/cart') || 
                          config.url?.includes('/orders') || 
                          config.url?.includes('/checkout') ||
                          config.url?.includes('/products') ||
                          config.url?.includes('/categories') ||
                          config.url?.includes('/brands') ||
                          config.url?.includes('/auth') ||
                          config.url?.includes('/customers') ||
                          config.url?.includes('/profile') ||
                          config.url?.includes('/me') ||
                          config.url?.includes('/reviews') || 
                          config.url?.includes('/review') ||
                          config.url?.includes('/ai');    
    
    if (isCustomerApi) {
      if (customerToken) {
        console.log('✅ [getToken] Using customer_token');
        return customerToken;
      }
      if (fallbackToken) {
        console.log('✅ [getToken] Using fallback token for customer API');
        return fallbackToken;
      }
    }
    
    if (config.url?.includes('/admin') || config.url?.includes('/upload')) {
      if (adminToken) {
        console.log('✅ [getToken] Using admin_token');
        return adminToken;
      }
    }
    
    console.log('⚠️ [getToken] No token found');
    return null;
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(  
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken(config);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ [Request] Token added to:', config.url);
        } else {
          console.log('⚠️ [Request] No token for:', config.url);
        }
        
        // ✅ TỰ ĐỘNG TĂNG TIMEOUT CHO AI REQUEST
        if (config.url?.includes('/ai/')) {
          config.timeout = 120000; // 120 giây (2 phút)
          console.log('⏱️ [Request] AI request - timeout set to 120s');
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(  
      (response) => {
        console.log('✅ [Response] Success:', response.status, response.config?.url);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        console.log('❌ [Response] Error:', error.response?.status, originalRequest?.url);
        console.log('❌ [Response] Error data:', error.response?.data);
        
        // ✅ XỬ LÝ TIMEOUT CHO AI
        if (error.code === 'ECONNABORTED' && originalRequest?.url?.includes('/ai/')) {
          console.log('⏱️ [Response] AI request timeout - Gemini đang chậm');
        }
        
        if (error.response?.status === 401 && !originalRequest?._retry) {
          console.log('⚠️ [Response] 401 Unauthorized for:', originalRequest?.url);
          
          const token = localStorage.getItem('customer_token');
          console.log('🔍 [Response] Current token:', token ? `${token.substring(0, 30)}...` : 'KHÔNG');
          
          const isCustomerApi = originalRequest.url?.includes('/cart') || 
                                originalRequest.url?.includes('/orders') || 
                                originalRequest.url?.includes('/checkout') ||
                                originalRequest.url?.includes('/customers') ||
                                originalRequest.url?.includes('/profile') ||
                                originalRequest.url?.includes('/me') ||
                                originalRequest.url?.includes('/reviews') ||
                                originalRequest.url?.includes('/review');
          
          if (isCustomerApi && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              const refreshToken = localStorage.getItem('refresh_token');
              console.log('🔍 [Response] Refresh token:', refreshToken ? 'CÓ' : 'KHÔNG');
              
              if (refreshToken) {
                const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
                  refreshToken,
                });
                
                const newToken = response.data.data?.accessToken || response.data.accessToken;
                if (newToken) {
                  console.log('✅ [Response] Got new token');
                  localStorage.setItem('customer_token', newToken);
                  originalRequest.headers.Authorization = `Bearer ${newToken}`;
                  return this.axiosInstance(originalRequest);
                }
              }
            } catch (refreshError) {
              console.error('❌ [Response] Refresh failed:', refreshError);
              localStorage.removeItem('customer_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user_info');
            }
          }
          
          return Promise.reject(error);
        }
        
        return Promise.reject(error);
      }
    );
  }

  getInstance() {  
    return this.axiosInstance;
  }
}

export const axiosClient = new AxiosConfig().getInstance();