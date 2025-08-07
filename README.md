# 뚜따 앱 (Ddudda App)

이 프로젝트는 위치 기반 서비스를 제공하는 뚜따 앱의 프론트엔드와 백엔드 코드를 포함하고 있습니다. 카카오맵 API를 활용한 모바일 앱으로, 지도 표시, 장소 검색, 마커 관리, 상세 정보 표시 등의 기능을 제공합니다.

## 프로젝트 구조

- `frontend/`: React Native와 Expo를 사용한 모바일 앱 프론트엔드
- `backend/`: FastAPI를 사용한 백엔드 웹 서버

> **참고**: 이 프로젝트의 루트 디렉토리는 프론트엔드 및 백엔드 디렉토리의 상위 폴더이며, 각 폴더는 독립적으로 실행 가능합니다.

## 주요 기능

- **지도 표시**: 카카오맵 기반 지도 표시 (React Native WebView와 FastAPI 서버 활용)
- **현재 위치**: 사용자의 현재 위치 확인 및 지도에 표시
- **장소 검색**: 카카오 로컬 API를 활용한 키워드 기반 장소 검색
- **마커 관리**: 검색 결과 및 현재 위치를 지도에 마커로 표시
- **상세 정보**: 장소 상세 정보 표시 (주소, 연락처, 길찾기 등)
- **길찾기 연동**: 카카오맵 앱 또는 네이티브 지도 앱과 연동한 길찾기 기능

## 기술 스택

### 프론트엔드

- React Native, Expo
- TypeScript
- Expo Router
- React Native WebView
- Zustand (상태 관리)

### 백엔드

- FastAPI
- Python
- Jinja2 템플릿
- 카카오맵 JavaScript API
- 카카오 로컬 API

## 프론트엔드 시작하기

```bash
cd frontend
npm install
npx expo start
```

## 백엔드 시작하기

```bash
cd backend
pip install -r requirements.txt
python main.py
```

## 개발 환경 설정

1. 백엔드 설정:

   - `.env` 파일을 생성하고 카카오 API 키 설정 (env_example 참조)
   - `KAKAO_MAP_API_KEY`: 카카오맵 JavaScript API 키
   - `KAKAO_REST_API_KEY`: 카카오 REST API 키

2. 프론트엔드 설정:

   - `.env` 파일 생성 및 설정
   - 실제 기기 테스트 시 `constants/Config.ts`에서 백엔드 서버 URL 확인
   - 필요한 경우 로컬 IP 주소로 URL 업데이트

3. 카카오 개발자 계정 설정:
   - 애플리케이션 등록 및 API 키 발급
   - 웹 플랫폼 등록 (도메인 설정)
   - 로컬 API 사용 권한 활성화

## 구현 과정

이 프로젝트는 다음과 같은 단계로 구현되었습니다:

1. 초기 프로젝트 구조 설정 (React Native, FastAPI)
2. 카카오맵 연동을 위한 WebView 구현
3. 위치 권한 및 현재 위치 기능 추가
4. 카카오맵 HTML 템플릿 생성 및 FastAPI 서버 구현
5. 마커 클릭 이벤트 및 통신 구현
6. 카카오 로컬 API를 활용한 장소 검색 기능 추가
7. 장소 상세 정보 페이지 구현
8. 길찾기 기능 추가 (카카오맵 앱 연동)

## 문서화

각 디렉토리에는 상세한 README.md 파일이 있어 해당 부분의 구현 방법과 사용법을 설명합니다:

- [프론트엔드 문서](frontend/README.md)
- [백엔드 문서](backend/README.md)

## 보안 참고사항

- API 키는 환경 변수 파일(.env)에 저장하고 Git에 커밋하지 않도록 주의하세요.
- `.gitignore` 파일에 환경 변수 파일이 포함되어 있는지 확인하세요.

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.
