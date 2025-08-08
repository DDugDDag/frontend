// src/stores/types.ts
import { BikeStation, RouteResponse, SearchSuggestion, User } from '../services/types';

// 사용자 상태
export interface UserState {
  isLoggedIn: boolean;
  profile: User | null;
  preferences: {
    prioritize_safety: boolean;
    avoid_hills: boolean;
    scenic_route: boolean;
  };
  isLoading: boolean;
  error: string | null;
}

// 지도 상태
export interface MapState {
  currentLocation: {
    lat: number;
    lng: number;
    address?: string;
  } | null;
  selectedLocation: {
    lat: number;
    lng: number;
    address?: string;
    name?: string;
  } | null;
  currentRoute: RouteResponse | null;
  isNavigating: boolean;
  navigationInfo: {
    currentSpeed: number; // km/h
    totalDistance: number; // km
    remainingDistance: number; // km
    estimatedTime: number; // minutes
    elapsedTime: number; // minutes
  } | null;
  mapCenter: {
    lat: number;
    lng: number;
    zoom: number;
  };
  isLoading: boolean;
  error: string | null;
}

// 대여소 상태
export interface StationState {
  allStations: BikeStation[];
  nearbyStations: BikeStation[];
  selectedStation: BikeStation | null;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
}

// 검색 상태
export interface SearchState {
  query: string;
  suggestions: SearchSuggestion[];
  recentSearches: SearchSuggestion[];
  isLoading: boolean;
  error: string | null;
}

// 전체 앱 상태
export interface AppState {
  user: UserState;
  map: MapState;
  stations: StationState;
  search: SearchState;
}

// 액션 타입들
export type UserAction =
  | { type: 'USER_LOGIN_START' }
  | { type: 'USER_LOGIN_SUCCESS'; payload: User }
  | { type: 'USER_LOGIN_FAILURE'; payload: string }
  | { type: 'USER_LOGOUT' }
  | { type: 'USER_UPDATE_PREFERENCES'; payload: Partial<UserState['preferences']> }
  | { type: 'USER_CLEAR_ERROR' };

export type MapAction =
  | { type: 'MAP_SET_CURRENT_LOCATION'; payload: { lat: number; lng: number; address?: string } }
  | { type: 'MAP_SET_SELECTED_LOCATION'; payload: { lat: number; lng: number; address?: string; name?: string } }
  | { type: 'MAP_SET_ROUTE'; payload: RouteResponse }
  | { type: 'MAP_CLEAR_ROUTE' }
  | { type: 'MAP_START_NAVIGATION' }
  | { type: 'MAP_STOP_NAVIGATION' }
  | { type: 'MAP_UPDATE_NAVIGATION'; payload: Partial<MapState['navigationInfo']> }
  | { type: 'MAP_SET_CENTER'; payload: { lat: number; lng: number; zoom?: number } }
  | { type: 'MAP_SET_LOADING'; payload: boolean }
  | { type: 'MAP_SET_ERROR'; payload: string | null };

export type StationAction =
  | { type: 'STATIONS_LOAD_START' }
  | { type: 'STATIONS_LOAD_SUCCESS'; payload: BikeStation[] }
  | { type: 'STATIONS_LOAD_FAILURE'; payload: string }
  | { type: 'STATIONS_SET_NEARBY'; payload: BikeStation[] }
  | { type: 'STATIONS_SELECT'; payload: BikeStation | null }
  | { type: 'STATIONS_UPDATE_ONE'; payload: BikeStation }
  | { type: 'STATIONS_CLEAR_ERROR' };

export type SearchAction =
  | { type: 'SEARCH_SET_QUERY'; payload: string }
  | { type: 'SEARCH_SET_SUGGESTIONS'; payload: SearchSuggestion[] }
  | { type: 'SEARCH_ADD_RECENT'; payload: SearchSuggestion }
  | { type: 'SEARCH_CLEAR_RECENT' }
  | { type: 'SEARCH_SET_LOADING'; payload: boolean }
  | { type: 'SEARCH_SET_ERROR'; payload: string | null }
  | { type: 'SEARCH_CLEAR' };

export type AppAction = UserAction | MapAction | StationAction | SearchAction;