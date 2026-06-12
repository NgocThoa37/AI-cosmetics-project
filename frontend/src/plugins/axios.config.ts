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

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(  
      (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(  
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.axiosInstance(originalRequest)); 
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
              refreshToken,
            });
            
            const newAccessToken = response.data.data.accessToken;
            setAccessToken(newAccessToken);
            
            this.refreshSubscribers.forEach(callback => callback(newAccessToken));
            this.refreshSubscribers = [];
            
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.axiosInstance(originalRequest);  
          } catch (refreshError) {
            removeAccessToken();
            removeRefreshToken();
            removeUser();
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
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