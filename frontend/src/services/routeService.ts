// src/services/routeService.ts
import { apiClient, handleAPIError } from './api';
import { RouteRequest, RouteResponse, APIResponse } from './types';

class RouteService {
  /**
   * 두 지점 간의 자전거 경로를 찾습니다
   */
  async findRoute(request: RouteRequest): Promise<APIResponse<RouteResponse>> {
    try {
      console.log('경로 찾기 요청:', request);
      
      const response = await apiClient.post<RouteResponse>('/api/find-path', request);
      
      if (response.error) {
        console.error('경로 찾기 실패:', response.error);
        return {
          error: handleAPIError(response),
          status: response.status,
        };
      }

      console.log('경로 찾기 성공:', response.data);
      return response;
    } catch (error: any) {
      console.error('경로 찾기 예외:', error);
      return {
        error: '경로 찾기 중 오류가 발생했습니다.',
        status: 500,
      };
    }
  }

  /**
   * 경치 좋은 경로를 찾습니다 (사용자 맞춤형)
   */
  async findScenicRoute(request: RouteRequest): Promise<APIResponse<RouteResponse>> {
    const scenicRequest = {
      ...request,
      preferences: {
        ...request.preferences,
        scenic_route: true,
      },
    };

    return this.findRoute(scenicRequest);
  }

  /**
   * 안전한 경로를 찾습니다
   */
  async findSafeRoute(request: RouteRequest): Promise<APIResponse<RouteResponse>> {
    const safeRequest = {
      ...request,
      preferences: {
        ...request.preferences,
        prioritize_safety: true,
      },
    };

    return this.findRoute(safeRequest);
  }

  /**
   * 좌표를 주소로 변환합니다 (역지오코딩)
   */
  async reverseGeocode(lat: number, lng: number): Promise<APIResponse<{ address: string }>> {
    try {
      // 카카오 REST API를 사용한 역지오코딩
      const Constants = require('expo-constants').default;
      const KAKAO_REST_API_KEY = Constants.expoConfig?.extra?.KAKAO_REST_API_KEY || '5fd93db4631259c8576b6ce26b8fc125';
      
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
        {
          headers: {
            'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        return {
          error: '주소를 가져올 수 없습니다.',
          status: response.status,
        };
      }

      const data = await response.json();
      
      if (data.documents && data.documents.length > 0) {
        const document = data.documents[0];
        const address = document.road_address 
          ? document.road_address.address_name 
          : document.address.address_name;
        
        return {
          data: { address },
          status: 200,
        };
      }

      return {
        error: '주소를 찾을 수 없습니다.',
        status: 404,
      };
    } catch (error: any) {
      console.error('역지오코딩 실패:', error);
      return {
        error: '위치 정보를 가져올 수 없습니다.',
        status: 500,
      };
    }
  }

  /**
   * 두 좌표 간의 거리를 계산합니다 (하버사인 공식)
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // 지구의 반지름 (km)
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 예상 소요 시간을 계산합니다 (평균 자전거 속도 15km/h 기준)
   */
  calculateEstimatedTime(distanceKm: number): number {
    const averageSpeedKmh = 15;
    return Math.round((distanceKm / averageSpeedKmh) * 60); // 분 단위
  }
}

export const routeService = new RouteService();