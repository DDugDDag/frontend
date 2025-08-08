// src/services/navigationService.ts
import * as Location from "expo-location";
import { APIResponse } from "./types";

interface NavigationData {
  currentSpeed: number; // km/h
  currentHeading: number; // degrees
  currentLocation: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  totalDistance: number; // km
  remainingDistance: number; // km
  estimatedTime: number; // minutes
  nextInstruction?: {
    type: "left" | "right" | "straight" | "finish";
    description: string;
    distance: number; // meters
  };
}

class NavigationService {
  private isNavigating = false;
  private locationSubscription: Location.LocationSubscription | null = null;
  private routePoints: Array<{ lat: number; lng: number }> = [];
  private currentRouteIndex = 0;
  private totalRouteDistance = 0;
  private startTime: Date | null = null;
  private traveledDistance = 0;

  /**
   * 실시간 내비게이션을 시작합니다
   */
  async startNavigation(
    routePoints: Array<{ lat: number; lng: number }>,
    onUpdate: (data: NavigationData) => void,
    onError: (error: string) => void
  ): Promise<APIResponse<boolean>> {
    try {
      console.log("실시간 내비게이션 시작");

      // 위치 권한 확인
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return {
          error: "위치 권한이 필요합니다.",
          status: 403,
        };
      }

      this.routePoints = routePoints;
      this.currentRouteIndex = 0;
      this.totalRouteDistance = this.calculateTotalDistance(routePoints);
      this.startTime = new Date();
      this.traveledDistance = 0;
      this.isNavigating = true;

      // 실시간 위치 추적 시작
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // 1초마다 업데이트
          distanceInterval: 5, // 5m 이동시 업데이트
        },
        (location) => {
          if (this.isNavigating) {
            this.processLocationUpdate(location, onUpdate, onError);
          }
        }
      );

      console.log("실시간 내비게이션 시작 완료");
      return {
        data: true,
        status: 200,
      };
    } catch (error: any) {
      console.error("내비게이션 시작 예외:", error);
      return {
        error: "내비게이션을 시작할 수 없습니다.",
        status: 500,
      };
    }
  }

  /**
   * 실시간 내비게이션을 중지합니다
   */
  async stopNavigation(): Promise<APIResponse<boolean>> {
    try {
      console.log("실시간 내비게이션 중지");

      this.isNavigating = false;

      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }

      // 내비게이션 데이터 초기화
      this.routePoints = [];
      this.currentRouteIndex = 0;
      this.totalRouteDistance = 0;
      this.startTime = null;
      this.traveledDistance = 0;

      console.log("실시간 내비게이션 중지 완료");
      return {
        data: true,
        status: 200,
      };
    } catch (error: any) {
      console.error("내비게이션 중지 예외:", error);
      return {
        error: "내비게이션을 중지할 수 없습니다.",
        status: 500,
      };
    }
  }

  /**
   * 내비게이션 상태를 반환합니다
   */
  isNavigationActive(): boolean {
    return this.isNavigating;
  }

  /**
   * 위치 업데이트를 처리합니다
   */
  private processLocationUpdate(
    location: Location.LocationObject,
    onUpdate: (data: NavigationData) => void,
    onError: (error: string) => void
  ) {
    try {
      const currentLat = location.coords.latitude;
      const currentLng = location.coords.longitude;
      const currentSpeed = (location.coords.speed || 0) * 3.6; // m/s를 km/h로 변환
      const currentHeading = location.coords.heading || 0;
      const accuracy = location.coords.accuracy || 0;

      // 현재 위치에서 가장 가까운 경로 포인트 찾기
      const nearestPoint = this.findNearestRoutePoint(currentLat, currentLng);

      if (nearestPoint.index > this.currentRouteIndex) {
        this.currentRouteIndex = nearestPoint.index;
      }

      // 이동 거리 계산
      if (this.currentRouteIndex > 0) {
        this.traveledDistance = this.calculateDistanceToIndex(
          this.currentRouteIndex
        );
      }

      // 남은 거리 계산
      const remainingDistance = this.totalRouteDistance - this.traveledDistance;

      // 예상 도착 시간 계산
      const averageSpeed = currentSpeed > 0 ? currentSpeed : 15; // 기본 15km/h
      const estimatedTime = Math.round((remainingDistance / averageSpeed) * 60); // 분 단위

      // 다음 안내 계산
      const nextInstruction = this.getNextInstruction();

      const navigationData: NavigationData = {
        currentSpeed,
        currentHeading,
        currentLocation: { lat: currentLat, lng: currentLng, accuracy },
        totalDistance: this.totalRouteDistance,
        remainingDistance,
        estimatedTime,
        nextInstruction,
      };

      onUpdate(navigationData);

      // 목적지 도착 확인
      if (remainingDistance < 0.05) {
        // 50m 이내
        this.stopNavigation();
        console.log("목적지 도착!");
      }
    } catch (error: any) {
      console.error("위치 업데이트 처리 예외:", error);
      onError("위치 정보 처리 중 오류가 발생했습니다.");
    }
  }

  /**
   * 현재 위치에서 가장 가까운 경로 포인트를 찾습니다
   */
  private findNearestRoutePoint(
    lat: number,
    lng: number
  ): { index: number; distance: number } {
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = this.currentRouteIndex; i < this.routePoints.length; i++) {
      const point = this.routePoints[i];
      const distance = this.calculateDistance(lat, lng, point.lat, point.lng);

      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    return { index: nearestIndex, distance: minDistance };
  }

  /**
   * 경로의 총 거리를 계산합니다
   */
  private calculateTotalDistance(
    points: Array<{ lat: number; lng: number }>
  ): number {
    let totalDistance = 0;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      totalDistance += this.calculateDistance(
        prev.lat,
        prev.lng,
        curr.lat,
        curr.lng
      );
    }

    return totalDistance;
  }

  /**
   * 특정 인덱스까지의 거리를 계산합니다
   */
  private calculateDistanceToIndex(index: number): number {
    let distance = 0;

    for (let i = 1; i <= index && i < this.routePoints.length; i++) {
      const prev = this.routePoints[i - 1];
      const curr = this.routePoints[i];
      distance += this.calculateDistance(
        prev.lat,
        prev.lng,
        curr.lat,
        curr.lng
      );
    }

    return distance;
  }

  /**
   * 다음 안내 정보를 가져옵니다
   */
  private getNextInstruction(): NavigationData["nextInstruction"] {
    const nextIndex = this.currentRouteIndex + 5; // 5포인트 앞 확인

    if (nextIndex >= this.routePoints.length - 1) {
      return {
        type: "finish",
        description: "목적지에 도착했습니다",
        distance: 0,
      };
    }

    const distanceToNext =
      this.calculateDistanceToIndex(nextIndex) - this.traveledDistance;

    // 간단한 방향 안내 (실제로는 더 복잡한 로직 필요)
    return {
      type: "straight",
      description: "직진하세요",
      distance: Math.round(distanceToNext * 1000),
    };
  }

  /**
   * 두 좌표 간의 거리를 계산합니다 (하버사인 공식)
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // 지구의 반지름 (km)
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const navigationService = new NavigationService();
