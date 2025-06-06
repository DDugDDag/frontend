// 환경별 설정 값을 관리하는 설정 파일

// API 기본 URL
// 시뮬레이터/에뮬레이터에서 테스트할 때 사용
export const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

// 개발 환경에서 실제 기기 테스트를 위한 설정
// 시뮬레이터/에뮬레이터가 아닌 실제 기기에서 테스트할 때는
// 아래 URL을 주석 해제하고 개발 컴퓨터의 로컬 IP 주소로 수정하세요
// export const API_BASE_URL = 'http://10.99.219.215:8000';
//
// 💡 중요: 실제 IP 주소는 개발 컴퓨터의 네트워크 설정에서 확인하세요:
// - macOS: 시스템 설정 > 네트워크
// - Windows: 명령 프롬프트에서 'ipconfig' 실행
// - 또는 터미널에서 'ifconfig' 또는 'ip addr' 명령어 실행

// 카카오맵 API 키
export const KAKAO_MAP_API_KEY = process.env.KAKAO_MAP_API_KEY || "";

// 앱 설정
export const APP_CONFIG = {
  // 디버그 모드 활성화 여부
  DEBUG: process.env.NODE_ENV === "development",

  // 지도 초기 위치 (대한민국 서울특별시청)
  DEFAULT_LOCATION: {
    latitude: 37.5662,
    longitude: 126.9784,
  },

  // 검색 설정
  SEARCH: {
    RADIUS: 5000, // 기본 검색 반경 (미터)
    MAX_RESULTS: 15, // 최대 결과 수
  },
};
