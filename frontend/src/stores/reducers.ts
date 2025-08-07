// src/stores/reducers.ts
import { UserState, MapState, StationState, SearchState, AppState, AppAction } from './types';

// 초기 상태들
export const initialUserState: UserState = {
  isLoggedIn: false,
  profile: null,
  preferences: {
    prioritize_safety: true,
    avoid_hills: false,
    scenic_route: false,
  },
  isLoading: false,
  error: null,
};

export const initialMapState: MapState = {
  currentLocation: null,
  selectedLocation: null,
  currentRoute: null,
  isNavigating: false,
  navigationInfo: null,
  mapCenter: {
    lat: 36.3504, // 대전 시청 기준
    lng: 127.3845,
    zoom: 14,
  },
  isLoading: false,
  error: null,
};

export const initialStationState: StationState = {
  allStations: [],
  nearbyStations: [],
  selectedStation: null,
  lastUpdated: null,
  isLoading: false,
  error: null,
};

export const initialSearchState: SearchState = {
  query: '',
  suggestions: [],
  recentSearches: [],
  isLoading: false,
  error: null,
};

export const initialAppState: AppState = {
  user: initialUserState,
  map: initialMapState,
  stations: initialStationState,
  search: initialSearchState,
};

// 사용자 리듀서
export const userReducer = (state: UserState, action: AppAction): UserState => {
  switch (action.type) {
    case 'USER_LOGIN_START':
      return { ...state, isLoading: true, error: null };
    
    case 'USER_LOGIN_SUCCESS':
      return {
        ...state,
        isLoggedIn: true,
        profile: action.payload,
        isLoading: false,
        error: null,
      };
    
    case 'USER_LOGIN_FAILURE':
      return {
        ...state,
        isLoggedIn: false,
        profile: null,
        isLoading: false,
        error: action.payload,
      };
    
    case 'USER_LOGOUT':
      return {
        ...initialUserState,
        preferences: state.preferences, // 사용자 설정은 유지
      };
    
    case 'USER_UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };
    
    case 'USER_CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

// 지도 리듀서
export const mapReducer = (state: MapState, action: AppAction): MapState => {
  switch (action.type) {
    case 'MAP_SET_CURRENT_LOCATION':
      return {
        ...state,
        currentLocation: action.payload,
        mapCenter: {
          ...state.mapCenter,
          lat: action.payload.lat,
          lng: action.payload.lng,
        },
      };
    
    case 'MAP_SET_SELECTED_LOCATION':
      return { ...state, selectedLocation: action.payload };
    
    case 'MAP_SET_ROUTE':
      return { ...state, currentRoute: action.payload, error: null };
    
    case 'MAP_CLEAR_ROUTE':
      return {
        ...state,
        currentRoute: null,
        isNavigating: false,
        navigationInfo: null,
      };
    
    case 'MAP_START_NAVIGATION':
      if (!state.currentRoute) return state;
      
      return {
        ...state,
        isNavigating: true,
        navigationInfo: {
          currentSpeed: 0,
          totalDistance: state.currentRoute.summary.distance,
          remainingDistance: state.currentRoute.summary.distance,
          estimatedTime: state.currentRoute.summary.duration,
          elapsedTime: 0,
        },
      };
    
    case 'MAP_STOP_NAVIGATION':
      return {
        ...state,
        isNavigating: false,
        navigationInfo: null,
      };
    
    case 'MAP_UPDATE_NAVIGATION':
      if (!state.navigationInfo) return state;
      
      return {
        ...state,
        navigationInfo: { ...state.navigationInfo, ...action.payload },
      };
    
    case 'MAP_SET_CENTER':
      return {
        ...state,
        mapCenter: {
          lat: action.payload.lat,
          lng: action.payload.lng,
          zoom: action.payload.zoom || state.mapCenter.zoom,
        },
      };
    
    case 'MAP_SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'MAP_SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    default:
      return state;
  }
};

// 대여소 리듀서
export const stationReducer = (state: StationState, action: AppAction): StationState => {
  switch (action.type) {
    case 'STATIONS_LOAD_START':
      return { ...state, isLoading: true, error: null };
    
    case 'STATIONS_LOAD_SUCCESS':
      return {
        ...state,
        allStations: action.payload,
        lastUpdated: new Date(),
        isLoading: false,
        error: null,
      };
    
    case 'STATIONS_LOAD_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    
    case 'STATIONS_SET_NEARBY':
      return { ...state, nearbyStations: action.payload };
    
    case 'STATIONS_SELECT':
      return { ...state, selectedStation: action.payload };
    
    case 'STATIONS_UPDATE_ONE':
      const updatedStations = state.allStations.map(station =>
        station.station_id === action.payload.station_id ? action.payload : station
      );
      
      const updatedNearbyStations = state.nearbyStations.map(station =>
        station.station_id === action.payload.station_id ? action.payload : station
      );
      
      return {
        ...state,
        allStations: updatedStations,
        nearbyStations: updatedNearbyStations,
        selectedStation: state.selectedStation?.station_id === action.payload.station_id 
          ? action.payload 
          : state.selectedStation,
      };
    
    case 'STATIONS_CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

// 검색 리듀서
export const searchReducer = (state: SearchState, action: AppAction): SearchState => {
  switch (action.type) {
    case 'SEARCH_SET_QUERY':
      return { ...state, query: action.payload };
    
    case 'SEARCH_SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload, isLoading: false, error: null };
    
    case 'SEARCH_ADD_RECENT':
      const newRecent = [action.payload, ...state.recentSearches.filter(item => item.id !== action.payload.id)];
      return {
        ...state,
        recentSearches: newRecent.slice(0, 10), // 최대 10개만 저장
      };
    
    case 'SEARCH_CLEAR_RECENT':
      return { ...state, recentSearches: [] };
    
    case 'SEARCH_SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SEARCH_SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SEARCH_CLEAR':
      return {
        ...state,
        query: '',
        suggestions: [],
        error: null,
      };
    
    default:
      return state;
  }
};

// 메인 앱 리듀서
export const appReducer = (state: AppState, action: AppAction): AppState => {
  return {
    user: userReducer(state.user, action),
    map: mapReducer(state.map, action),
    stations: stationReducer(state.stations, action),
    search: searchReducer(state.search, action),
  };
};