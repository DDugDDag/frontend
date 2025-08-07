// src/services/searchService.ts
import Constants from 'expo-constants';
import { KakaoPlace, SearchSuggestion, APIResponse } from './types';

class SearchService {
  private kakaoRestApiKey = Constants.expoConfig?.extra?.KAKAO_REST_API_KEY || '5fd93db4631259c8576b6ce26b8fc125';

  /**
   * 카카오 로컬 API를 사용하여 장소를 검색합니다
   */
  async searchPlaces(
    query: string,
    lat?: number,
    lng?: number,
    radius: number = 5000,
    page: number = 1,
    size: number = 15
  ): Promise<APIResponse<KakaoPlace[]>> {
    try {
      console.log('장소 검색 요청:', { query, lat, lng, radius });

      const params = new URLSearchParams({
        query,
        page: page.toString(),
        size: size.toString(),
      });

      // 위치 기반 검색
      if (lat !== undefined && lng !== undefined) {
        params.append('y', lat.toString());
        params.append('x', lng.toString());
        params.append('radius', radius.toString());
      }

      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?${params.toString()}`,
        {
          headers: {
            'Authorization': `KakaoAK ${this.kakaoRestApiKey}`,
          },
        }
      );

      if (!response.ok) {
        return {
          error: '장소 검색에 실패했습니다.',
          status: response.status,
        };
      }

      const data = await response.json();

      // 카카오 API 응답을 우리 형식으로 변환
      const places: KakaoPlace[] = data.documents.map((item: any) => ({
        id: item.id || `place_${Date.now()}_${Math.random()}`,
        title: item.place_name,
        description: `${item.address_name || item.road_address_name || ''}\n${item.phone || ''}`.trim(),
        coordinate: {
          latitude: parseFloat(item.y),
          longitude: parseFloat(item.x),
        },
        address_name: item.address_name,
        road_address_name: item.road_address_name,
        phone: item.phone,
        place_url: item.place_url,
        distance: item.distance ? parseInt(item.distance) : undefined,
      }));

      console.log('장소 검색 성공:', places.length, '개');
      return {
        data: places,
        status: 200,
      };
    } catch (error: any) {
      console.error('장소 검색 예외:', error);
      return {
        error: '장소 검색 중 오류가 발생했습니다.',
        status: 500,
      };
    }
  }

  /**
   * 백엔드 API를 통한 통합 검색 (장소 + 대여소)
   */
  async searchIntegrated(
    query: string,
    lat?: number,
    lng?: number,
    radius: number = 5000
  ): Promise<APIResponse<SearchSuggestion[]>> {
    try {
      console.log('통합 검색 요청:', { query, lat, lng, radius });

      // 카카오 장소 검색
      const placesResponse = await this.searchPlaces(query, lat, lng, radius);
      
      const suggestions: SearchSuggestion[] = [];

      // 카카오 검색 결과를 제안 형식으로 변환
      if (placesResponse.data) {
        const placeSuggestions: SearchSuggestion[] = placesResponse.data.map(place => ({
          id: place.id,
          name: place.title,
          address: place.address_name || place.road_address_name,
          type: this.determineLocationType(place.title),
          lat: place.coordinate.latitude,
          lng: place.coordinate.longitude,
          distance: place.distance,
        }));

        suggestions.push(...placeSuggestions);
      }

      // 대전 지역 기본 검색 제안 추가
      if (query.length > 0) {
        const defaultSuggestions = this.getDefaultSuggestions(query);
        suggestions.push(...defaultSuggestions);
      }

      // 중복 제거 및 관련성 순으로 정렬
      const uniqueSuggestions = this.removeDuplicatesAndSort(suggestions, query);

      console.log('통합 검색 성공:', uniqueSuggestions.length, '개');
      return {
        data: uniqueSuggestions.slice(0, 10), // 상위 10개만 반환
        status: 200,
      };
    } catch (error: any) {
      console.error('통합 검색 예외:', error);
      return {
        error: '검색 중 오류가 발생했습니다.',
        status: 500,
      };
    }
  }

  /**
   * 자동완성 검색 제안을 가져옵니다
   */
  async getAutocompleteSuggestions(
    query: string,
    lat?: number,
    lng?: number
  ): Promise<APIResponse<SearchSuggestion[]>> {
    if (query.trim().length < 1) {
      return {
        data: this.getDefaultSuggestions(),
        status: 200,
      };
    }

    return this.searchIntegrated(query, lat, lng, 3000);
  }

  /**
   * 장소 타입을 결정합니다
   */
  private determineLocationType(placeName: string): 'location' | 'station' | 'landmark' {
    const lowerName = placeName.toLowerCase();
    
    if (lowerName.includes('역') || lowerName.includes('station') || lowerName.includes('대여소')) {
      return 'station';
    }
    
    if (lowerName.includes('공원') || lowerName.includes('산') || lowerName.includes('강') || 
        lowerName.includes('박물관') || lowerName.includes('기념관') || lowerName.includes('타워') ||
        lowerName.includes('궁') || lowerName.includes('사') || lowerName.includes('절')) {
      return 'landmark';
    }
    
    return 'location';
  }

  /**
   * 기본 검색 제안을 가져옵니다 (대전 지역 특화)
   */
  private getDefaultSuggestions(query?: string): SearchSuggestion[] {
    const defaultSuggestions: SearchSuggestion[] = [
      {
        id: 'default_1',
        name: '동성로',
        address: '대전광역시 중구 동성로',
        type: 'landmark',
        lat: 36.3247,
        lng: 127.4206,
      },
      {
        id: 'default_2',
        name: '대전역',
        address: '대전광역시 동구 중앙로 215',
        type: 'station',
        lat: 36.3314,
        lng: 127.4349,
      },
      {
        id: 'default_3',
        name: '정부청사역',
        address: '대전광역시 서구 청사로 189',
        type: 'station',
        lat: 36.3504,
        lng: 127.3845,
      },
      {
        id: 'default_4',
        name: '둔산동',
        address: '대전광역시 서구 둔산동',
        type: 'location',
        lat: 36.3504,
        lng: 127.3845,
      },
      {
        id: 'default_5',
        name: '유성온천',
        address: '대전광역시 유성구 온천동',
        type: 'landmark',
        lat: 36.3621,
        lng: 127.3489,
      },
    ];

    if (query) {
      return defaultSuggestions.filter(suggestion =>
        suggestion.name.toLowerCase().includes(query.toLowerCase()) ||
        (suggestion.address && suggestion.address.toLowerCase().includes(query.toLowerCase()))
      );
    }

    return defaultSuggestions;
  }

  /**
   * 중복을 제거하고 관련성 순으로 정렬합니다
   */
  private removeDuplicatesAndSort(suggestions: SearchSuggestion[], query: string): SearchSuggestion[] {
    // 이름으로 중복 제거
    const uniqueMap = new Map<string, SearchSuggestion>();
    
    suggestions.forEach(suggestion => {
      const key = suggestion.name.toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, suggestion);
      }
    });

    const uniqueSuggestions = Array.from(uniqueMap.values());

    // 관련성 순으로 정렬 (정확한 매치 > 시작 매치 > 포함 매치)
    return uniqueSuggestions.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const queryLower = query.toLowerCase();

      // 정확한 매치
      if (aName === queryLower && bName !== queryLower) return -1;
      if (bName === queryLower && aName !== queryLower) return 1;

      // 시작 매치
      if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
      if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1;

      // 포함 매치 (이미 필터링됨)
      return a.name.localeCompare(b.name, 'ko-KR');
    });
  }
}

export const searchService = new SearchService();