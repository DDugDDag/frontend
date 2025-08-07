// src/services/aiRouteService.ts
import { APIResponse } from './types';
import { api } from './api';

export interface SmartRouteRequest {
  mode: 'bike' | 'walk';
  time?: number; // 분
  distance?: number; // km
  currentLocation: {
    lat: number;
    lng: number;
  };
}

export interface SmartRouteResponse {
  destination: {
    lat: number;
    lng: number;
    name: string;
    description: string;
  };
  route: Array<{
    lat: number;
    lng: number;
  }>;
  segments: Array<{
    type: 'bike' | 'walk';
    duration: number; // 분
    description: string;
    startPoint: { lat: number; lng: number };
    endPoint: { lat: number; lng: number };
  }>;
  totalDuration: number; // 분
  totalDistance: number; // km
  routeType: 'bike' | 'walk';
}

class AIRouteService {
  async getSmartRoute(request: SmartRouteRequest): Promise<APIResponse<SmartRouteResponse>> {
    try {
      // TODO: 실제 백엔드 AI 서비스 호출
      const response = await api.post<SmartRouteResponse>('/api/ai/smart-route', request);
      return { data: response.data, status: response.status };
    } catch (error: any) {
      console.error('AI 경로 추천 요청 실패:', error);
      
      // 개발용 더미 데이터 반환
      return this.getMockSmartRoute(request);
    }
  }

  private getMockSmartRoute(request: SmartRouteRequest): APIResponse<SmartRouteResponse> {
    const { currentLocation, mode, time, distance } = request;
    
    // 현재 위치에서 반경 내 랜덤 목적지 생성
    const targetDistance = distance || (time ? time * 0.05 : 2.0); // 시간 기반 거리 추정
    const randomAngle = Math.random() * 2 * Math.PI;
    const distanceInDegrees = targetDistance / 111; // 대략적인 위도 변환
    
    const destination = {
      lat: currentLocation.lat + Math.cos(randomAngle) * distanceInDegrees,
      lng: currentLocation.lng + Math.sin(randomAngle) * distanceInDegrees,
      name: mode === 'bike' ? '뚜따 추천 따릉이 코스' : '뚜따 추천 뚜벅이 코스',
      description: mode === 'bike' 
        ? '자전거로 즐기는 대전 도심 투어 코스입니다!'
        : '걷기 좋은 대전 산책 코스입니다!'
    };

    // 간단한 경로 생성 (직선 + 약간의 곡선)
    const route = this.generateMockRoute(currentLocation, destination, mode);
    
    // 구간별 정보 생성
    const segments = this.generateMockSegments(route, mode, time || 30);

    const totalDuration = time || segments.reduce((sum, seg) => sum + seg.duration, 0);
    const totalDistance = distance || this.calculateTotalDistance(route);

    const mockResponse: SmartRouteResponse = {
      destination,
      route,
      segments,
      totalDuration,
      totalDistance,
      routeType: mode,
    };

    return { data: mockResponse, status: 200 };
  }

  private generateMockRoute(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    mode: 'bike' | 'walk'
  ): Array<{ lat: number; lng: number }> {
    const points = [start];
    const numIntermediatePoints = mode === 'bike' ? 6 : 4;
    
    for (let i = 1; i <= numIntermediatePoints; i++) {
      const ratio = i / (numIntermediatePoints + 1);
      
      // 곡선 효과를 위한 오프셋 추가
      const offsetScale = Math.sin(ratio * Math.PI) * 0.001;
      const perpAngle = Math.atan2(end.lng - start.lng, end.lat - start.lat) + Math.PI / 2;
      
      const lat = start.lat + (end.lat - start.lat) * ratio + Math.cos(perpAngle) * offsetScale;
      const lng = start.lng + (end.lng - start.lng) * ratio + Math.sin(perpAngle) * offsetScale;
      
      points.push({ lat, lng });
    }
    
    points.push(end);
    return points;
  }

  private generateMockSegments(
    route: Array<{ lat: number; lng: number }>,
    mode: 'bike' | 'walk',
    totalTime: number
  ): Array<{
    type: 'bike' | 'walk';
    duration: number;
    description: string;
    startPoint: { lat: number; lng: number };
    endPoint: { lat: number; lng: number };
  }> {
    const segments = [];
    const segmentCount = Math.min(route.length - 1, mode === 'bike' ? 3 : 2);
    const timePerSegment = Math.floor(totalTime / segmentCount);
    
    const descriptions = mode === 'bike' 
      ? ['출발지에서 자전거로', '자전거로 중간 지점까지', '목적지까지 자전거로']
      : ['출발지에서 걸어서', '목적지까지 걸어서'];

    for (let i = 0; i < segmentCount; i++) {
      const startIdx = Math.floor((route.length - 1) * i / segmentCount);
      const endIdx = Math.floor((route.length - 1) * (i + 1) / segmentCount);
      
      segments.push({
        type: mode,
        duration: i === segmentCount - 1 ? totalTime - (timePerSegment * i) : timePerSegment,
        description: `${descriptions[Math.min(i, descriptions.length - 1)]} ${timePerSegment}분`,
        startPoint: route[startIdx],
        endPoint: route[endIdx],
      });
    }

    return segments;
  }

  private calculateTotalDistance(route: Array<{ lat: number; lng: number }>): number {
    let totalDistance = 0;
    
    for (let i = 0; i < route.length - 1; i++) {
      const start = route[i];
      const end = route[i + 1];
      
      // 하버사인 공식으로 거리 계산
      const R = 6371; // 지구 반지름 (km)
      const dLat = (end.lat - start.lat) * Math.PI / 180;
      const dLng = (end.lng - start.lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      totalDistance += distance;
    }
    
    return Math.round(totalDistance * 10) / 10; // 소수점 첫째 자리까지
  }
}

export const aiRouteService = new AIRouteService();