import { axiosClient } from '@/plugins/axios.config';
import { ApiResponse } from '@/types';

export class BaseService {
  protected async get<T>(url: string, params?: any): Promise<T> {
    const response = await axiosClient.get<ApiResponse<T>>(url, { params });
    return response.data.data;
  }

  protected async post<T>(url: string, data?: any): Promise<T> {
    const response = await axiosClient.post<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  protected async put<T>(url: string, data?: any): Promise<T> {
    const response = await axiosClient.put<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  protected async patch<T>(url: string, data?: any): Promise<T> {
    const response = await axiosClient.patch<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  protected async delete<T>(url: string): Promise<T> {
    const response = await axiosClient.delete<ApiResponse<T>>(url);
    return response.data.data;
  }
}