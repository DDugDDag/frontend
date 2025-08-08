// src/screens/MapScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import NavigationPanel from "@/components/navigation/NavigationPanel";
import BikeInfoPanel from "@/components/map/BikeInfoPanel";
import SmartRouteModal from "@/components/map/SmartRouteModal";
import SmartRoutePanel from "@/components/map/SmartRoutePanel";
import { SearchIcon, StarIcon } from "@/components/ui/Icons";
import { useAppContext } from "@/stores/AppContext";
import { stationService, aiRouteService } from "@/services";
import { Colors } from "@/constants/Colors";

export default function MapScreen() {
  const navigation = useNavigation();
  const { state, actions } = useAppContext();
  const webViewRef = useRef<WebView>(null);
  const [showSmartRouteModal, setShowSmartRouteModal] = useState(false);

  // 실제 대여소 데이터 로드
  useEffect(() => {
    loadBikeStations();
  }, []);

  // 경로가 설정되면 내비게이션 정보 업데이트
  useEffect(() => {
    if (state.map.currentRoute) {
      console.log("경로 데이터 업데이트:", state.map.currentRoute.summary);
    }
  }, [state.map.currentRoute]);

  const loadBikeStations = async () => {
    try {
      const response = await stationService.getAllStations();
      if (response.data) {
        actions.loadStations(response.data);
        console.log("대여소 정보 로드 완료:", response.data.length, "개");
      } else {
        console.error("대여소 정보 로드 실패:", response.error);
        // 실패 시 더미 데이터 사용
        const dummyStations = [
          {
            station_id: "1",
            lat: 36.3504,
            lng: 127.3845,
            available_bikes: 7,
            name: "정부청사역",
            address: "대전광역시 서구",
            last_updated: new Date().toISOString(),
            status: "운영중",
          },
          {
            station_id: "2",
            lat: 36.3621,
            lng: 127.3489,
            available_bikes: 14,
            name: "둔산동 주민센터",
            address: "대전광역시 서구",
            last_updated: new Date().toISOString(),
            status: "운영중",
          },
          {
            station_id: "3",
            lat: 36.3456,
            lng: 127.3912,
            available_bikes: 2,
            name: "시청역",
            address: "대전광역시 서구",
            last_updated: new Date().toISOString(),
            status: "운영중",
          },
          {
            station_id: "4",
            lat: 36.3789,
            lng: 127.3567,
            available_bikes: 24,
            name: "대전역",
            address: "대전광역시 동구",
            last_updated: new Date().toISOString(),
            status: "운영중",
          },
          {
            station_id: "5",
            lat: 36.3234,
            lng: 127.4123,
            available_bikes: 0,
            name: "유성온천역",
            address: "대전광역시 유성구",
            last_updated: new Date().toISOString(),
            status: "운영중",
          },
          {
            station_id: "6",
            lat: 36.389,
            lng: 127.3234,
            available_bikes: 18,
            name: "서대전네거리",
            address: "대전광역시 서구",
            last_updated: new Date().toISOString(),
            status: "운영중",
          },
          {
            station_id: "7",
            lat: 36.3123,
            lng: 127.3678,
            available_bikes: 1,
            name: "중앙로역",
            address: "대전광역시 중구",
            last_updated: new Date().toISOString(),
            status: "운영중",
          },
        ];
        actions.loadStations(dummyStations);
      }
    } catch (error) {
      console.error("대여소 정보 로드 예외:", error);
    }
  };

  // 개선된 카카오맵 HTML (네트워크 이슈 해결)
  const createKakaoMapHTML = () => {
    const stations = state.stations.allStations.map((station) => ({
      id: station.station_id,
      lat: station.lat,
      lng: station.lng,
      available: station.available_bikes,
      name: station.name,
    }));

    const stationsJS = JSON.stringify(stations);
    const selectedStationId = state.stations.selectedStation?.station_id || null;
    const nativeAppKey = Constants.expoConfig?.extra?.KAKAO_NATIVE_APP_KEY || "15107af70ffc7646a128bd53e0ff9c3e";

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>뚜따 카카오맵</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:; connect-src 'self' https://dapi.kakao.com https://*.daumcdn.net https://*.kakao.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dapi.kakao.com; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data: https:;">
        <style>
            body { margin: 0; padding: 0; overflow: hidden; }
            #map { width: 100vw; height: 100vh; }
            .bike-marker {
                background: #FFCF50;
                border: 3px solid #fff;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 12px;
                color: #3B1E1E;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                cursor: pointer;
            }
            .bike-marker.empty { background: #999; color: #fff; }
            .bike-marker.few { background: #FFA500; }
            .bike-marker.selected { 
                background: #5B913B; 
                color: #fff; 
                width: 42px; 
                height: 42px;
                border: 4px solid #fff;
            }
            .loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 16px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <div id="loading" class="loading">지도 로딩 중...</div>
        
        <script>
            let isMapLoaded = false;
            
            function sendMessage(type, data) {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type, data }));
                }
            }

            function hideLoading() {
                const loading = document.getElementById('loading');
                if (loading) loading.style.display = 'none';
            }

            function showError(message) {
                const loading = document.getElementById('loading');
                if (loading) {
                    loading.innerHTML = '지도 로딩 실패: ' + message;
                    loading.style.color = 'red';
                }
            }

            // 카카오맵 초기화
            function initKakaoMap() {
                try {
                    sendMessage('map_status', '카카오맵 초기화 시작');
                    
                    const mapContainer = document.getElementById('map');
                    const mapOption = {
                        center: new kakao.maps.LatLng(36.3504, 127.3845),
                        level: 4
                    };
                    
                    const map = new kakao.maps.Map(mapContainer, mapOption);
                    sendMessage('map_status', '카카오맵 초기화 성공');
                    hideLoading();
                    isMapLoaded = true;
                    
                    // 대여소 마커 표시
                    const stations = ${stationsJS};
                    const selectedId = ${JSON.stringify(selectedStationId)};
                    
                    stations.forEach(function(station) {
                        const markerClass = 'bike-marker' + 
                            (selectedId === station.id ? ' selected' :
                             station.available === 0 ? ' empty' :
                             station.available <= 3 ? ' few' : '');
                        
                        const content = '<div class="' + markerClass + '">' + station.available + '</div>';
                        const position = new kakao.maps.LatLng(station.lat, station.lng);
                        
                        const customOverlay = new kakao.maps.CustomOverlay({
                            map: map,
                            position: position,
                            content: content,
                            yAnchor: 1
                        });
                        
                        // 마커 클릭 이벤트
                        const markerElement = customOverlay.getContent();
                        markerElement.onclick = function() {
                            sendMessage('marker_click', station);
                        };
                    });
                    
                    // 지도 클릭 이벤트
                    kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
                        const latlng = mouseEvent.latLng;
                        sendMessage('map_click', {
                            lat: latlng.getLat(),
                            lng: latlng.getLng()
                        });
                    });
                    
                } catch (error) {
                    sendMessage('map_error', error.toString());
                    showError(error.toString());
                }
            }

            // 개선된 초기화 시퀀스 (네트워크 문제 해결)
            function initialize() {
                sendMessage('map_status', '초기화 시작');
                
                // 스크립트가 이미 로딩되었는지 확인
                if (typeof kakao !== 'undefined' && kakao.maps) {
                    sendMessage('map_status', 'Kakao Maps 이미 로딩됨');
                    initKakaoMap();
                    return;
                }
                
                // 동적 스크립트 생성 및 로딩
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.async = true;
                script.defer = true;
                
                // 스크립트 로딩 성공 시
                script.onload = function() {
                    sendMessage('map_status', 'Kakao Maps 스크립트 로딩 완료');
                    
                    // kakao 객체 확인 및 지도 초기화
                    if (typeof kakao !== 'undefined' && kakao.maps) {
                        // autoload=false이므로 load() 호출 필요
                        kakao.maps.load(function() {
                            sendMessage('map_status', 'Kakao Maps API 초기화 완료');
                            initKakaoMap();
                        });
                    } else {
                        // 폴백: 짧은 대기 후 재시도
                        setTimeout(function() {
                            if (typeof kakao !== 'undefined' && kakao.maps) {
                                kakao.maps.load(function() {
                                    sendMessage('map_status', 'Kakao Maps API 초기화 완료 (재시도)');
                                    initKakaoMap();
                                });
                            } else {
                                sendMessage('map_error', 'Kakao Maps 객체를 찾을 수 없습니다');
                                showError('Kakao Maps 로딩 실패');
                            }
                        }, 1000);
                    }
                };
                
                // 스크립트 로딩 실패 시
                script.onerror = function() {
                    sendMessage('map_error', 'Kakao Maps 스크립트 로딩 실패');
                    showError('네트워크 연결 문제로 지도를 불러올 수 없습니다');
                };
                
                // autoload=false로 설정하여 수동 초기화
                script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=${nativeAppKey}&autoload=false';
                
                // DOM에 스크립트 추가
                document.head.appendChild(script);
                
                sendMessage('map_status', 'Kakao Maps 스크립트 로딩 시작');
            }

            // 페이지 로드 완료 후 초기화 시작
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initialize);
            } else {
                initialize();
            }
        </script>
    </body>
    </html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      console.log("WebView 메시지:", data.type, data.data);
      
      switch (data.type) {
        case 'map_status':
          console.log("카카오맵 상태:", data.data);
          break;
        case 'map_error':
          console.error("카카오맵 에러:", data.data);
          Alert.alert("지도 오류", data.data);
          break;
        case 'marker_click':
          console.log("마커 클릭:", data.data);
          const station = state.stations.allStations.find(
            s => s.station_id === data.data.id
          );
          if (station) {
            actions.selectStation(station);
          }
          break;
        case 'map_click':
          console.log("지도 클릭:", data.data);
          actions.setSelectedLocation(data.data.lat, data.data.lng);
          break;
        default:
          console.log("알 수 없는 메시지:", data);
      }
    } catch (error) {
      console.error("WebView 메시지 파싱 오류:", error);
    }
  };

  const toggleNavigation = () => {
    if (state.map.isNavigating) {
      actions.stopNavigation();
    } else if (state.map.currentRoute) {
      actions.startNavigation();
    }
  };

  const handleSmartRouteSubmit = async (data: {
    mode: "bike" | "walk";
    time?: number;
    distance?: number;
  }) => {
    console.log("AI 목적지 추천 요청:", data);

    try {
      // 현재 위치 정보 (임시로 대전 중심부 사용)
      const currentLocation = {
        lat: 36.3504,
        lng: 127.3845,
      };

      // AI 서비스에 경로 추천 요청
      const response = await aiRouteService.getSmartRoute({
        mode: data.mode,
        time: data.time,
        distance: data.distance,
        currentLocation,
      });

      if (response.data) {
        console.log("AI 추천 경로:", response.data);

        // 추천된 경로를 앱 상태에 저장
        actions.setRoute({
          route_points: response.data.route,
          summary: {
            distance: response.data.totalDistance,
            duration: response.data.totalDuration,
            mode: response.data.routeType,
          },
          segments: response.data.segments,
        });

        // 목적지를 선택된 위치로 설정
        actions.setSelectedLocation(
          response.data.destination.lat,
          response.data.destination.lng
        );

        console.log(
          `${data.mode === "bike" ? "따릉이" : "뚜벅이"} 모드 경로 생성 완료!`
        );
      } else {
        Alert.alert("오류", "AI 경로 추천에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("AI 경로 추천 오류:", error);
      Alert.alert("오류", "AI 경로 추천 중 오류가 발생했습니다.");
    }
  };

  return (
    <ScreenWrapper backgroundColor="#fff" paddingHorizontal={0}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* 상단 검색바 */}
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate("Search" as never)}
          >
            <View style={styles.searchIcon}>
              <SearchIcon size={20} color="#666" />
            </View>
            <Text style={styles.searchPlaceholder}>어디로 갈거유?</Text>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => setShowSmartRouteModal(true)}
            >
              <StarIcon size={12} color="#FFCF50" />
              <Text style={styles.favoriteText}>몰라유</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* 개선된 카카오 지도 WebView */}
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: createKakaoMapHTML() }}
            style={styles.map}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={handleWebViewMessage}
            originWhitelist={['*']}
            mixedContentMode="always"
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            scalesPageToFit={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEnabled={false}
            allowsBackForwardNavigationGestures={false}
            cacheEnabled={false}
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>카카오맵 로딩 중...</Text>
              </View>
            )}
            onError={(error) => {
              console.error("WebView 로딩 에러:", error);
            }}
            onLoadStart={() => {
              console.log("WebView 로딩 시작");
            }}
            onLoadEnd={() => {
              console.log("WebView 로딩 완료");
            }}
            onHttpError={(syntheticEvent) => {
              console.error("WebView HTTP 에러:", syntheticEvent.nativeEvent);
            }}
          />
        </View>

        {/* 내비게이션 패널 */}
        <NavigationPanel />

        {/* 바이크 정보 패널 */}
        <BikeInfoPanel
          visible={
            !!state.stations.selectedStation &&
            !state.map.isNavigating &&
            !state.map.currentRoute
          }
          onOpenTashuApp={() => {
            console.log("타슈 앱 열기 시도");
            // TODO: 타슈 앱 열기 또는 웹사이트로 이동
          }}
        />

        {/* AI 추천 경로 패널 */}
        <SmartRoutePanel
          visible={!!state.map.currentRoute && !state.map.isNavigating}
          onStartNavigation={() => {
            console.log("뚜따 내비게이션 시작");
            actions.startNavigation();
            // TODO: 뚜따 자체 내비게이션 시작 (NavigationPanel 활성화)
          }}
        />

        {/* 하단 네비게이션 (임시)
        <View style={styles.bottomNavigation}>
          <TouchableOpacity style={[styles.navButton, styles.activeNavButton]}>
            <CompassIcon size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <HomeIcon size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={toggleNavigation}>
            <MapIcon size={24} color="#666" />
          </TouchableOpacity>
        </View> */}

        {/* AI 목적지 추천 모달 */}
        <SmartRouteModal
          visible={showSmartRouteModal}
          onClose={() => setShowSmartRouteModal(false)}
          onSubmit={handleSmartRouteSubmit}
        />
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundDark,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 1,
  },
  searchIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  favoriteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  favoriteText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.text,
    marginLeft: 4,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  bottomNavigation: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeNavButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    marginHorizontal: 4,
  },
});
