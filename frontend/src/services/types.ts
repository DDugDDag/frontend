// src/services/types.ts

// 기본 응답 타입
export interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

// 좌표 타입
export interface Coordinate {
  latitude: number;
  longitude: number;
}

// 경로 요청 타입
export interface RouteRequest {
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  preferences?: {
    prioritize_safety?: boolean;
    avoid_hills?: boolean;
    scenic_route?: boolean;
  };
}

// 경로 포인트 타입
export interface RoutePoint {
  lat: number;
  lng: number;
  step?: number;
}

// 경로 안내 타입
export interface RouteInstruction {
  step: number;
  type: 'start' | 'straight' | 'left' | 'right' | 'slight-left' | 'slight-right' | 'finish';
  description: string;
  distance: number; // meters
  duration: number; // minutes
  coordinate: RoutePoint;
}

// 경로 요약 타입
export interface RouteSummary {
  distance: number; // km
  duration: number; // minutes
  mode?: 'bike' | 'walk'; // 이동 모드
  elevation_gain?: number; // meters
  safety_score?: number; // 0-1
  confidence_score?: number; // 0-1
  algorithm_version?: string;
  bike_stations?: number;
}

// 경로 응답 타입
export interface RouteResponse {
  route_id?: string;
  summary: RouteSummary;
  route_points: RoutePoint[];
  instructions: RouteInstruction[];
  nearby_stations: BikeStation[];
  metadata?: {
    generated_at: string;
    preferences?: any;
    process_time: number;
  };
}

// 자전거 대여소 타입
export interface BikeStation {
  station_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  available_bikes: number;
  total_docks?: number;
  distance_from_start?: number;
  distance_from_end?: number;
  location_type?: 'start' | 'end' | 'route';
  location_description?: string;
  last_updated: string;
  status?: string;
}

// 자전거 도로 타입
export interface BikePath {
  id: string;
  name: string;
  type: '전용도로' | '겸용도로' | '우선도로';
  length: number; // meters
  points: RoutePoint[];
}

// 카카오 장소 검색 타입
export interface KakaoPlace {
  id: string;
  title: string;
  description: string;
  coordinate: Coordinate;
  address_name?: string;
  road_address_name?: string;
  phone?: string;
  place_url?: string;
  distance?: number;
}

// 검색 제안 타입
export interface SearchSuggestion {
  id: string;
  name: string;
  address?: string;
  type: 'location' | 'station' | 'landmark';
  lat?: number;
  lng?: number;
  distance?: number;
}

// 사용자 타입
export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  provider: 'kakao' | 'guest';
  preferences: {
    scenic_route: boolean;
    prioritize_safety: boolean;
    avoid_hills: boolean;
    preferred_speed: 'slow' | 'normal' | 'fast';
  };
}

// API 에러 타입
export interface APIError {
  code: string;
  message: string;
  details?: any;
}