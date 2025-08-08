// src/services/api.ts
import Constants from "expo-constants";
import { APIResponse, APIError } from "./types";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = "@ddudda/token";
let authToken: string | null = null;

export async function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

async function ensureAuthTokenLoaded() {
  if (authToken !== null) return;
  try {
    const stored = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    authToken = stored || null;
  } catch {
    authToken = null;
  }
}

// 환경 변수에서 API URL 가져오기
const RAW_BACKEND_API_URL =
  Constants.expoConfig?.extra?.BACKEND_API_URL || "http://localhost:8000";

function normalizeBaseUrl(url: string): string {
  try {
    const u = new URL(url);
    // Android 에뮬레이터 로컬호스트 교정
    if (
      Platform.OS === "android" &&
      (u.hostname === "localhost" || u.hostname === "127.0.0.1")
    ) {
      u.hostname = "10.0.2.2";
    }
    // iOS 시뮬레이터는 localhost 가능, 실기기는 LAN IP 필요(사용자가 설정)
    return u.toString().replace(/\/$/, "");
  } catch {
    return url.replace(/\/$/, "");
  }
}

const BACKEND_API_URL = normalizeBaseUrl(RAW_BACKEND_API_URL);

class APIClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = BACKEND_API_URL, timeout: number = 30000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      await ensureAuthTokenLoaded();

      const defaultHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (authToken) {
        defaultHeaders["Authorization"] = `Bearer ${authToken}`;
      }

      // 간단한 재시도(네트워크 오류/일부 5xx)
      const maxRetries = 2;
      let attempt = 0;
      let lastError: any = null;

      while (attempt <= maxRetries) {
        try {
          const response = await fetch(url, {
            ...options,
            headers: {
              ...defaultHeaders,
              ...options.headers,
            },
            signal: controller.signal,
          });

          const contentType = response.headers.get("content-type");
          let data: any;
          if (contentType && contentType.includes("application/json")) {
            data = await response.json();
          } else {
            data = await response.text();
          }

          if (!response.ok) {
            const error: APIError = {
              code: response.status.toString(),
              message:
                (data as any)?.detail ||
                (data as any)?.message ||
                `HTTP ${response.status}: ${response.statusText}`,
              details: data,
            };

            // 5xx는 재시도, 그 외는 즉시 반환
            if (response.status >= 500 && response.status < 600 && attempt < maxRetries) {
              attempt += 1;
              await this.sleep(300 * attempt);
              continue;
            }

            clearTimeout(timeoutId);
            return { error: error.message, status: response.status };
          }

          clearTimeout(timeoutId);
          return { data, status: response.status };
        } catch (err: any) {
          lastError = err;
          // Abort/네트워크 오류 시 재시도
          if (
            (err.name === "AbortError" ||
              (err.name === "TypeError" && (err.message || "").includes("fetch"))) &&
            attempt < maxRetries
          ) {
            attempt += 1;
            await this.sleep(300 * attempt);
            continue;
          }
          break;
        }
      }

      clearTimeout(timeoutId);

      if (lastError?.name === "AbortError") {
        return { error: "요청 시간이 초과되었습니다.", status: 408 };
      }
      if (lastError?.name === "TypeError" && (lastError.message || "").includes("fetch")) {
        return { error: "네트워크 연결을 확인해주세요.", status: 0 };
      }
      return { error: lastError?.message || "알 수 없는 오류가 발생했습니다.", status: 500 };
    } catch (error: any) {
      clearTimeout(timeoutId);
      return {
        error: error.message || "알 수 없는 오류가 발생했습니다.",
        status: 500,
      };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<APIResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) searchParams.append(key, value.toString());
      });
      if (searchParams.toString()) url += `?${searchParams.toString()}`;
    }
    return this.request<T>(url, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: "POST", body: data ? JSON.stringify(data) : undefined });
  }

  async put<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: "PUT", body: data ? JSON.stringify(data) : undefined });
  }

  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Health check
  async healthCheck(): Promise<APIResponse<{ status: string; message: string }>> {
    return this.get("/api/health");
  }
}

// 기본 API 클라이언트 인스턴스
export const apiClient = new APIClient();
export const api = apiClient;

// 에러 핸들링 유틸리티
export const handleAPIError = (response: APIResponse<any>): string => {
  if (response.error) return response.error;
  if (response.status && response.status >= 400) {
    switch (response.status) {
      case 400:
        return "잘못된 요청입니다.";
      case 401:
        return "인증이 필요합니다.";
      case 403:
        return "접근 권한이 없습니다.";
      case 404:
        return "요청한 리소스를 찾을 수 없습니다.";
      case 408:
        return "요청 시간이 초과되었습니다.";
      case 500:
        return "서버 내부 오류가 발생했습니다.";
      case 502:
        return "서버 게이트웨이 오류입니다.";
      case 503:
        return "서비스를 사용할 수 없습니다.";
      default:
        return `서버 오류 (${response.status})`;
    }
  }
  return "알 수 없는 오류가 발생했습니다.";
};
