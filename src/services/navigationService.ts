// src/services/navigationService.ts
import { getCurrentPosition, type GeolocationResponse } from '@/utils/location';
import { APIResponse } from './types';

interface NavigationData {
  currentSpeed: number;           // km/h
  currentHeading: number;         // degrees
  currentLocation: { lat: number; lng: number; accuracy: number };
  totalDistance: number;          // km
  remainingDistance: number;      // km
  estimatedTime: number;          // minutes
  nextInstruction?: {
    type: 'left' | 'right' | 'straight' | 'finish';
    description: string;
    distance: number;             // meters
  };
}

class NavigationService {
  private isNavigating = false;
  private tick: ReturnType<typeof setInterval> | null = null;
  private routePoints: Array<{ lat: number; lng: number }> = [];
  private currentRouteIndex = 0;
  private totalRouteDistance = 0;
  private traveledDistance = 0;

  /**
   * 실시간 내비게이션 시작 (1초 주기 폴링)
   */
  async startNavigation(
    routePoints: Array<{ lat: number; lng: number }>,
    onUpdate: (data: NavigationData) => void,
    onError: (error: string) => void
  ): Promise<APIResponse<boolean>> {
    try {
      this.routePoints = routePoints;
      this.currentRouteIndex = 0;
      this.totalRouteDistance = this.calculateTotalDistance(routePoints);
      this.traveledDistance = 0;
      this.isNavigating = true;

      // 매 1초 현재 위치 갱신
      this.tick = setInterval(async () => {
        try {
          const pos = await getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 2000,
          });
          if (this.isNavigating) {
            this.processLocationUpdate(pos, onUpdate, onError);
          }
        } catch (e) {
          onError('현재 위치를 가져오지 못했습니다.');
        }
      }, 1000);

      return { data: true, status: 200 };
    } catch (e) {
      return { error: '내비게이션을 시작할 수 없습니다.', status: 500 };
    }
  }

  /**
   * 실시간 내비게이션 중지
   */
  async stopNavigation(): Promise<APIResponse<boolean>> {
    try {
      this.isNavigating = false;
      if (this.tick) {
        clearInterval(this.tick);
        this.tick = null;
      }
      this.routePoints = [];
      this.currentRouteIndex = 0;
      this.totalRouteDistance = 0;
      this.traveledDistance = 0;
      return { data: true, status: 200 };
    } catch (e) {
      return { error: '내비게이션을 중지할 수 없습니다.', status: 500 };
    }
  }

  isNavigationActive(): boolean {
    return this.isNavigating;
  }

  /**
   * 위치 업데이트 처리
   */
  private processLocationUpdate(
    location: GeolocationResponse,
    onUpdate: (data: NavigationData) => void,
    onError: (error: string) => void
  ) {
    try {
      const currentLat = location.coords.latitude;
      const currentLng = location.coords.longitude;
      const currentSpeed = ((location.coords.speed ?? 0) as number) * 3.6; // m/s → km/h
      const currentHeading = (location.coords.heading ?? 0) as number;
      const accuracy = (location.coords.accuracy ?? 0) as number;

      // 가장 가까운 경로 포인트
      const nearestPoint = this.findNearestRoutePoint(currentLat, currentLng);
      if (nearestPoint.index > this.currentRouteIndex) {
        this.currentRouteIndex = nearestPoint.index;
      }

      // 이동/남은 거리
      if (this.currentRouteIndex > 0) {
        this.traveledDistance = this.calculateDistanceToIndex(this.currentRouteIndex);
      }
      const remainingDistance = Math.max(
        0,
        this.totalRouteDistance - this.traveledDistance
      );

      // ETA
      const averageSpeed = currentSpeed > 0 ? currentSpeed : 15; // 기본 15km/h
      const estimatedTime = Math.round((remainingDistance / averageSpeed) * 60);

      // 다음 안내(간단 로직)
      const nextInstruction = this.getNextInstruction();

      onUpdate({
        currentSpeed,
        currentHeading,
        currentLocation: { lat: currentLat, lng: currentLng, accuracy },
        totalDistance: this.totalRouteDistance,
        remainingDistance,
        estimatedTime,
        nextInstruction,
      });

      // 도착 처리 (50m 이내)
      if (remainingDistance < 0.05) {
        this.stopNavigation();
      }
    } catch (e) {
      onError('위치 정보 처리 중 오류가 발생했습니다.');
    }
  }

  private findNearestRoutePoint(lat: number, lng: number): { index: number; distance: number } {
    let nearestIndex = this.currentRouteIndex;
    let minDistance = Infinity;
    for (let i = this.currentRouteIndex; i < this.routePoints.length; i++) {
      const p = this.routePoints[i];
      const d = this.calculateDistance(lat, lng, p.lat, p.lng);
      if (d < minDistance) {
        minDistance = d;
        nearestIndex = i;
      }
    }
    return { index: nearestIndex, distance: minDistance };
  }

  private calculateTotalDistance(points: Array<{ lat: number; lng: number }>): number {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += this.calculateDistance(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng);
    }
    return total;
  }

  private calculateDistanceToIndex(index: number): number {
    let sum = 0;
    for (let i = 1; i <= index && i < this.routePoints.length; i++) {
      sum += this.calculateDistance(
        this.routePoints[i - 1].lat,
        this.routePoints[i - 1].lng,
        this.routePoints[i].lat,
        this.routePoints[i].lng
      );
    }
    return sum;
  }

  private getNextInstruction(): NavigationData['nextInstruction'] {
    const nextIndex = this.currentRouteIndex + 5;
    if (nextIndex >= this.routePoints.length - 1) {
      return { type: 'finish', description: '목적지에 도착했습니다', distance: 0 };
    }
    const distanceToNext = this.calculateDistanceToIndex(nextIndex) - this.traveledDistance;
    return { type: 'straight', description: '직진하세요', distance: Math.max(0, Math.round(distanceToNext * 1000)) };
  }

  // 하버사인
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // km
  }
  private toRad(deg: number) { return deg * (Math.PI / 180); }
}

export const navigationService = new NavigationService();
