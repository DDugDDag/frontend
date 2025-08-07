// src/services/stationService.ts
import { apiClient, handleAPIError } from './api';
import { BikeStation, BikePath, APIResponse } from './types';

class StationService {
  /**
   * 모든 자전거 대여소 정보를 가져옵니다
   */
  async getAllStations(): Promise<APIResponse<BikeStation[]>> {
    try {
      console.log('대여소 정보 요청');
      
      const response = await apiClient.get<BikeStation[]>('/api/bike-stations');
      
      if (response.error) {
        console.error('대여소 정보 실패:', response.error);
        return {
          error: handleAPIError(response),
          status: response.status,
        };
      }

      console.log('대여소 정보 성공:', response.data?.length, '개');
      return response;
    } catch (error: any) {
      console.error('대여소 정보 예외:', error);
      return {
        error: '대여소 정보를 가져올 수 없습니다.',
        status: 500,
      };
    }
  }

  /**
   * 특정 대여소의 상세 정보를 가져옵니다
   */
  async getStationById(stationId: string): Promise<APIResponse<BikeStation>> {
    try {
      console.log('대여소 상세 정보 요청:', stationId);
      
      const response = await apiClient.get<BikeStation>(`/api/bike-stations/${stationId}`);
      
      if (response.error) {
        console.error('대여소 상세 정보 실패:', response.error);
        return {
          error: handleAPIError(response),
          status: response.status,
        };
      }

      console.log('대여소 상세 정보 성공:', response.data);
      return response;
    } catch (error: any) {
      console.error('대여소 상세 정보 예외:', error);
      return {
        error: '대여소 상세 정보를 가져올 수 없습니다.',
        status: 500,
      };
    }
  }

  /**
   * 특정 위치 주변의 자전거 대여소를 가져옵니다
   */
  async getNearbyStations(
    lat: number, 
    lng: number, 
    radiusKm: number = 2
  ): Promise<APIResponse<BikeStation[]>> {
    try {
      // 모든 대여소를 가져와서 거리로 필터링
      const allStationsResponse = await this.getAllStations();
      
      if (allStationsResponse.error || !allStationsResponse.data) {
        return allStationsResponse;
      }

      // 거리 계산 및 필터링
      const nearbyStations = allStationsResponse.data
        .map(station => ({
          ...station,
          distance: this.calculateDistance(lat, lng, station.lat, station.lng),
        }))
        .filter(station => station.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);

      console.log(`주변 대여소 ${nearbyStations.length}개 찾음 (반경 ${radiusKm}km)`);

      return {
        data: nearbyStations,
        status: 200,
      };
    } catch (error: any) {
      console.error('주변 대여소 검색 예외:', error);
      return {
        error: '주변 대여소를 찾을 수 없습니다.',
        status: 500,
      };
    }
  }

  /**
   * 자전거 도로 정보를 가져옵니다
   */
  async getBikePaths(
    lat: number,
    lng: number,
    radius: number = 2000
  ): Promise<APIResponse<BikePath[]>> {
    try {
      console.log('자전거 도로 정보 요청:', { lat, lng, radius });
      
      const response = await apiClient.get<BikePath[]>('/api/bike-paths', {
        lat,
        lng,
        radius,
      });
      
      if (response.error) {
        console.error('자전거 도로 정보 실패:', response.error);
        return {
          error: handleAPIError(response),
          status: response.status,
        };
      }

      console.log('자전거 도로 정보 성공:', response.data?.length, '개');
      return response;
    } catch (error: any) {
      console.error('자전거 도로 정보 예외:', error);
      return {
        error: '자전거 도로 정보를 가져올 수 없습니다.',
        status: 500,
      };
    }
  }

  /**
   * 대전시 자전거 노선 정보를 가져옵니다
   */
  async getBikeRoutes(): Promise<APIResponse<any[]>> {
    try {
      console.log('자전거 노선 정보 요청');
      
      const response = await apiClient.get<any[]>('/api/bike-routes');
      
      if (response.error) {
        console.error('자전거 노선 정보 실패:', response.error);
        return {
          error: handleAPIError(response),
          status: response.status,
        };
      }

      console.log('자전거 노선 정보 성공:', response.data?.length, '개');
      return response;
    } catch (error: any) {
      console.error('자전거 노선 정보 예외:', error);
      return {
        error: '자전거 노선 정보를 가져올 수 없습니다.',
        status: 500,
      };
    }
  }

  /**
   * 대여소의 상태를 체크합니다 (이용 가능한 자전거 수 등)
   */
  async getStationStatus(stationId: string): Promise<APIResponse<{
    available_bikes: number;
    available_docks: number;
    is_operational: boolean;
    last_updated: string;
  }>> {
    const stationResponse = await this.getStationById(stationId);
    
    if (stationResponse.error || !stationResponse.data) {
      return {
        error: stationResponse.error,
        status: stationResponse.status,
      };
    }

    const station = stationResponse.data;
    
    return {
      data: {
        available_bikes: station.available_bikes,
        available_docks: (station.total_docks || 20) - station.available_bikes,
        is_operational: station.status === '운영중',
        last_updated: station.last_updated,
      },
      status: 200,
    };
  }

  /**
   * 두 좌표 간의 거리를 계산합니다 (하버사인 공식)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
}

export const stationService = new StationService();