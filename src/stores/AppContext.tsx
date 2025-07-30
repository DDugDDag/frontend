// src/stores/AppContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppAction } from './types';
import { appReducer, initialAppState } from './reducers';
import { SearchSuggestion } from '../services/types';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // 편의 액션들
  actions: {
    // 사용자 액션
    loginUser: (profile: any) => void;
    logoutUser: () => void;
    updateUserPreferences: (preferences: Partial<AppState['user']['preferences']>) => void;
    
    // 지도 액션
    setCurrentLocation: (lat: number, lng: number, address?: string) => void;
    setSelectedLocation: (lat: number, lng: number, address?: string, name?: string) => void;
    setRoute: (route: any) => void;
    clearRoute: () => void;
    startNavigation: () => void;
    stopNavigation: () => void;
    updateNavigation: (info: Partial<AppState['map']['navigationInfo']>) => void;
    
    // 대여소 액션
    loadStations: (stations: any[]) => void;
    setNearbyStations: (stations: any[]) => void;
    selectStation: (station: any | null) => void;
    
    // 검색 액션
    setSearchQuery: (query: string) => void;
    setSearchSuggestions: (suggestions: SearchSuggestion[]) => void;
    addRecentSearch: (suggestion: SearchSuggestion) => void;
    clearSearch: () => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

// AsyncStorage 키들
const STORAGE_KEYS = {
  USER_PREFERENCES: '@ddudda/user_preferences',
  RECENT_SEARCHES: '@ddudda/recent_searches',
  USER_PROFILE: '@ddudda/user_profile',
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  // 앱 시작 시 저장된 데이터 로드
  useEffect(() => {
    loadStoredData();
  }, []);

  // 상태 변경 시 자동 저장
  useEffect(() => {
    saveUserPreferences();
  }, [state.user.preferences]);

  useEffect(() => {
    saveRecentSearches();
  }, [state.search.recentSearches]);

  useEffect(() => {
    saveUserProfile();
  }, [state.user.profile]);

  const loadStoredData = async () => {
    try {
      // 사용자 설정 로드
      const savedPreferences = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        dispatch({ type: 'USER_UPDATE_PREFERENCES', payload: preferences });
      }

      // 최근 검색 로드
      const savedRecentSearches = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      if (savedRecentSearches) {
        const recentSearches = JSON.parse(savedRecentSearches);
        recentSearches.forEach((search: SearchSuggestion) => {
          dispatch({ type: 'SEARCH_ADD_RECENT', payload: search });
        });
      }

      // 사용자 프로필 로드
      const savedProfile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        dispatch({ type: 'USER_LOGIN_SUCCESS', payload: profile });
      }
    } catch (error) {
      console.error('저장된 데이터 로드 실패:', error);
    }
  };

  const saveUserPreferences = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(state.user.preferences)
      );
    } catch (error) {
      console.error('사용자 설정 저장 실패:', error);
    }
  };

  const saveRecentSearches = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.RECENT_SEARCHES,
        JSON.stringify(state.search.recentSearches)
      );
    } catch (error) {
      console.error('최근 검색 저장 실패:', error);
    }
  };

  const saveUserProfile = async () => {
    try {
      if (state.user.profile) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_PROFILE,
          JSON.stringify(state.user.profile)
        );
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      }
    } catch (error) {
      console.error('사용자 프로필 저장 실패:', error);
    }
  };

  // 편의 액션들
  const actions = {
    // 사용자 액션
    loginUser: (profile: any) => {
      dispatch({ type: 'USER_LOGIN_SUCCESS', payload: profile });
    },
    
    logoutUser: () => {
      dispatch({ type: 'USER_LOGOUT' });
      AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    },
    
    updateUserPreferences: (preferences: Partial<AppState['user']['preferences']>) => {
      dispatch({ type: 'USER_UPDATE_PREFERENCES', payload: preferences });
    },

    // 지도 액션
    setCurrentLocation: (lat: number, lng: number, address?: string) => {
      dispatch({ type: 'MAP_SET_CURRENT_LOCATION', payload: { lat, lng, address } });
    },
    
    setSelectedLocation: (lat: number, lng: number, address?: string, name?: string) => {
      dispatch({ type: 'MAP_SET_SELECTED_LOCATION', payload: { lat, lng, address, name } });
    },
    
    setRoute: (route: any) => {
      dispatch({ type: 'MAP_SET_ROUTE', payload: route });
    },
    
    clearRoute: () => {
      dispatch({ type: 'MAP_CLEAR_ROUTE' });
    },
    
    startNavigation: () => {
      dispatch({ type: 'MAP_START_NAVIGATION' });
    },
    
    stopNavigation: () => {
      dispatch({ type: 'MAP_STOP_NAVIGATION' });
    },
    
    updateNavigation: (info: Partial<AppState['map']['navigationInfo']>) => {
      dispatch({ type: 'MAP_UPDATE_NAVIGATION', payload: info });
    },

    // 대여소 액션
    loadStations: (stations: any[]) => {
      dispatch({ type: 'STATIONS_LOAD_SUCCESS', payload: stations });
    },
    
    setNearbyStations: (stations: any[]) => {
      dispatch({ type: 'STATIONS_SET_NEARBY', payload: stations });
    },
    
    selectStation: (station: any | null) => {
      dispatch({ type: 'STATIONS_SELECT', payload: station });
    },

    // 검색 액션
    setSearchQuery: (query: string) => {
      dispatch({ type: 'SEARCH_SET_QUERY', payload: query });
    },
    
    setSearchSuggestions: (suggestions: SearchSuggestion[]) => {
      dispatch({ type: 'SEARCH_SET_SUGGESTIONS', payload: suggestions });
    },
    
    addRecentSearch: (suggestion: SearchSuggestion) => {
      dispatch({ type: 'SEARCH_ADD_RECENT', payload: suggestion });
    },
    
    clearSearch: () => {
      dispatch({ type: 'SEARCH_CLEAR' });
    },
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    actions,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// 컨텍스트 사용을 위한 커스텀 훅
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// 개별 상태 선택을 위한 편의 훅들
export const useUserState = () => useAppContext().state.user;
export const useMapState = () => useAppContext().state.map;
export const useStationState = () => useAppContext().state.stations;
export const useSearchState = () => useAppContext().state.search;