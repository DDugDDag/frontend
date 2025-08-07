// src/services/api.ts
import Constants from 'expo-constants';
import { APIResponse, APIError } from './types';

// 환경 변수에서 API URL 가져오기
const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL || 'http://localhost:8000';

class APIClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = BACKEND_API_URL, timeout: number = 30000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const error: APIError = {
          code: response.status.toString(),
          message: data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`,
          details: data,
        };
        
        return {
          error: error.message,
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        return {
          error: '요청 시간이 초과되었습니다.',
          status: 408,
        };
      }

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          error: '네트워크 연결을 확인해주세요.',
          status: 0,
        };
      }

      return {
        error: error.message || '알 수 없는 오류가 발생했습니다.',
        status: 500,
      };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<APIResponse<T>> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }

    return this.request<T>(url, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<APIResponse<{ status: string; message: string }>> {
    return this.get('/api/health');
  }
}

// 기본 API 클라이언트 인스턴스
export const apiClient = new APIClient();
export const api = apiClient;

// 에러 핸들링 유틸리티
export const handleAPIError = (response: APIResponse<any>): string => {
  if (response.error) {
    return response.error;
  }
  
  if (response.status && response.status >= 400) {
    switch (response.status) {
      case 400:
        return '잘못된 요청입니다.';
      case 401:
        return '인증이 필요합니다.';
      case 403:
        return '접근 권한이 없습니다.';
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.';
      case 408:
        return '요청 시간이 초과되었습니다.';
      case 500:
        return '서버 내부 오류가 발생했습니다.';
      case 502:
        return '서버 게이트웨이 오류입니다.';
      case 503:
        return '서비스를 사용할 수 없습니다.';
      default:
        return `서버 오류 (${response.status})`;
    }
  }
  
  return '알 수 없는 오류가 발생했습니다.';
};