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
import {
  SearchIcon,
  StarIcon,
  CompassIcon,
  HomeIcon,
  MapIcon,
} from "@/components/ui/Icons";
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

  // 카카오맵 HTML 템플릿
  const createMapHTML = () => {
    const stations = state.stations.allStations.map((station) => ({
      id: station.station_id,
      lat: station.lat,
      lng: station.lng,
      available: station.available_bikes,
      name: station.name,
    }));

    const stationsJS = JSON.stringify(stations);
    const currentRouteJS = state.map.currentRoute
      ? JSON.stringify(state.map.currentRoute.route_points)
      : "null";
    const selectedLocationJS = state.map.selectedLocation
      ? JSON.stringify(state.map.selectedLocation)
      : "null";
    const selectedStationId =
      state.stations.selectedStation?.station_id || null;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>뚰따 지도</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${
          Constants.expoConfig?.extra?.KAKAO_MAP_API_KEY ||
          "5fd93db4631259c8576b6ce26b8fc125"
        }"></script>
        <style>
            body { margin: 0; padding: 0; }
            #map { width: 100%; height: 100vh; }
            .custom-marker {
                border: 3px solid #fff;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
                color: #3B1E1E;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
            }
            .marker-many { background: #FFCF50; }
            .marker-few { background: #FFA500; }
            .marker-empty { background: #999; color: #fff; }
            .marker-selected { 
                background: #5B913B; 
                color: #fff; 
                width: 50px; 
                height: 50px; 
                font-size: 16px;
                border: 4px solid #fff;
                box-shadow: 0 4px 12px rgba(91,145,59,0.4);
            }
            .current-location {
                background: #5B913B;
                border: 4px solid #fff;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <div id="error-message" style="display: none; text-align: center; padding: 50px; color: #666;">
            지도를 로드하는 중입니다...
        </div>
        <script>
            // Kakao Maps API 로딩 확인 및 오류 처리
            function initializeMap() {
                try {
                    if (typeof kakao === 'undefined' || !kakao.maps) {
                        throw new Error('Kakao Maps API가 로드되지 않았습니다.');
                    }

                    var mapContainer = document.getElementById('map');
                    if (!mapContainer) {
                        throw new Error('지도 컨테이너를 찾을 수 없습니다.');
                    }

                    var mapOption = {
                        center: new kakao.maps.LatLng(36.3504, 127.3845), // 대전 중심
                        level: 3
                    };
                    
                    var map = new kakao.maps.Map(mapContainer, mapOption);
                    
                    // 지도 로드 성공 시 에러 메시지 숨기기
                    document.getElementById('error-message').style.display = 'none';
                    mapContainer.style.display = 'block';
                    
                    console.log('지도 초기화 성공');
                    return map;
                } catch (error) {
                    console.error('지도 초기화 오류:', error);
                    showError('지도를 로드할 수 없습니다: ' + error.message);
                    return null;
                }
            }

            function showError(message) {
                var errorDiv = document.getElementById('error-message');
                var mapDiv = document.getElementById('map');
                
                if (errorDiv && mapDiv) {
                    errorDiv.innerHTML = message;
                    errorDiv.style.display = 'block';
                    mapDiv.style.display = 'none';
                }
                
                // React Native로 에러 메시지 전송
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'error',
                        message: message
                    }));
                }
            }

            // API 로딩 완료 후 지도 초기화
            var map = null;
            var initAttempts = 0;
            var maxAttempts = 10;

            function tryInitialize() {
                if (typeof kakao !== 'undefined' && kakao.maps) {
                    map = initializeMap();
                    if (map) {
                        setupMapFeatures();
                    }
                } else {
                    initAttempts++;
                    if (initAttempts < maxAttempts) {
                        setTimeout(tryInitialize, 500);
                    } else {
                        showError('Kakao Maps API 로딩 시간이 초과되었습니다.');
                    }
                }
            }

            // 페이지 로드 시 초기화 시도
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', tryInitialize);
            } else {
                tryInitialize();
            }

            function setupMapFeatures() {
                if (!map) return;
                
                try {
            var stations = ${stationsJS};
            var routePoints = ${currentRouteJS};
            var selectedLocation = ${selectedLocationJS};
            var selectedStationId = ${JSON.stringify(selectedStationId)};
            
            // 자전거 대여소 마커 추가
            stations.forEach(function(station) {
                var markerPosition = new kakao.maps.LatLng(station.lat, station.lng);
                
                // 마커 스타일 결정
                var markerClass = 'custom-marker ';
                var isSelected = selectedStationId === station.id;
                
                if (isSelected) {
                    markerClass += 'marker-selected';
                } else if (station.available === 0) {
                    markerClass += 'marker-empty';
                } else if (station.available <= 3) {
                    markerClass += 'marker-few';
                } else {
                    markerClass += 'marker-many';
                }
                
                var content = '<div class="' + markerClass + '">' + station.available + '</div>';
                var customOverlay = new kakao.maps.CustomOverlay({
                    position: markerPosition,
                    content: content,
                    yAnchor: 1
                });
                
                customOverlay.setMap(map);
                
                // 마커 클릭 이벤트
                kakao.maps.event.addListener(customOverlay, 'click', function() {
                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'stationClick',
                        station: station
                    }));
                });
            });
            
            // 현재 위치 마커 및 원형 영역
            var currentPosition = new kakao.maps.LatLng(36.3504, 127.3845);
            
            // 현재 위치 원형 영역 (반경 500m)
            var circle = new kakao.maps.Circle({
                center: currentPosition,
                radius: 500, // 미터
                strokeWeight: 2,
                strokeColor: '#5B913B',
                strokeOpacity: 0.6,
                fillColor: '#5B913B',
                fillOpacity: 0.1
            });
            circle.setMap(map);
            
            // 현재 위치 마커
            var currentLocationOverlay = new kakao.maps.CustomOverlay({
                position: currentPosition,
                content: '<div class="current-location"></div>',
                yAnchor: 1
            });
            currentLocationOverlay.setMap(map);
            
            // AI 추천 경로 표시 (Map 3 스타일)
            if (routePoints && routePoints.length > 0) {
                var path = routePoints.map(function(point) {
                    return new kakao.maps.LatLng(point.lat, point.lng);
                });
                
                // 메인 경로 라인 (두꺼운 노란색)
                var polyline = new kakao.maps.Polyline({
                    path: path,
                    strokeWeight: 8,
                    strokeColor: '#FFCF50',
                    strokeOpacity: 0.9,
                    strokeStyle: 'solid'
                });
                polyline.setMap(map);
                
                // 경로 시작점 마커
                var startMarker = new kakao.maps.CustomOverlay({
                    position: path[0],
                    content: '<div style="background: #5B913B; border: 3px solid #fff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; font-size: 12px;">●</div>',
                    yAnchor: 1
                });
                startMarker.setMap(map);
                
                // 경로 종료점 마커 (목적지)
                var endMarker = new kakao.maps.CustomOverlay({
                    position: path[path.length - 1],
                    content: '<div style="background: #FFCF50; border: 3px solid #fff; border-radius: 15px; padding: 5px 10px; font-weight: bold; font-size: 12px; color: #3B1E1E; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">목적지</div>',
                    yAnchor: 1
                });
                endMarker.setMap(map);
                
                // 구간별 시간 표시 (Map 3 스타일)
                if (path.length >= 3) {
                    var midPoint1 = Math.floor(path.length * 0.33);
                    var midPoint2 = Math.floor(path.length * 0.66);
                    
                    var timeMarker1 = new kakao.maps.CustomOverlay({
                        position: path[midPoint1],
                        content: '<div style="background: #5B913B; color: #fff; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">걷기 3분</div>',
                        yAnchor: 1
                    });
                    timeMarker1.setMap(map);
                    
                    var timeMarker2 = new kakao.maps.CustomOverlay({
                        position: path[midPoint2],
                        content: '<div style="background: #5B913B; color: #fff; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">자전거 11분</div>',
                        yAnchor: 1
                    });
                    timeMarker2.setMap(map);
                }
                
                // 경로 범위에 맞게 지도 조정
                var bounds = new kakao.maps.LatLngBounds();
                path.forEach(function(point) {
                    bounds.extend(point);
                });
                map.setBounds(bounds);
            }
            
            // 선택된 위치 표시
            if (selectedLocation) {
                var selectedMarkerPosition = new kakao.maps.LatLng(selectedLocation.lat, selectedLocation.lng);
                var selectedMarker = new kakao.maps.Marker({
                    position: selectedMarkerPosition,
                    image: new kakao.maps.MarkerImage(
                        'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
                            '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
                            '<circle cx="16" cy="16" r="12" fill="#FFCF50" stroke="#fff" stroke-width="3"/>' +
                            '<text x="16" y="20" text-anchor="middle" font-size="16" fill="#3B1E1E">📍</text>' +
                            '</svg>'
                        ),
                        new kakao.maps.Size(32, 32),
                        { offset: new kakao.maps.Point(16, 32) }
                    )
                });
                selectedMarker.setMap(map);
                
                // 선택된 위치로 지도 중심 이동
                if (!routePoints || routePoints.length === 0) {
                    map.setCenter(selectedMarkerPosition);
                }
            }
            
            // 지도 클릭 이벤트
                    kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
                        var latlng = mouseEvent.latLng;
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'mapClick',
                                lat: latlng.getLat(),
                                lng: latlng.getLng()
                            }));
                        }
                    });

                    console.log('지도 기능 설정 완료');
                } catch (error) {
                    console.error('지도 기능 설정 오류:', error);
                    showError('지도 기능을 설정하는 중 오류가 발생했습니다: ' + error.message);
                }
            }
        </script>
    </body>
    </html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "error") {
        console.error("지도 에러:", data.message);
        Alert.alert("지도 오류", data.message);
        return;
      }

      if (data.type === "stationClick") {
        console.log("대여소 클릭:", data.station);

        // 대여소 정보를 상태에서 찾기
        const station = state.stations.allStations.find(
          (s) => s.station_id === data.station.id
        );
        if (station) {
          actions.selectStation(station);
          // TODO: 대여소 상세 정보 모달 표시
        }
      } else if (data.type === "mapClick") {
        console.log("지도 클릭:", data.lat, data.lng);
        // 클릭한 위치를 선택된 위치로 설정
        actions.setSelectedLocation(data.lat, data.lng);
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


        {/* 지도 WebView */}
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: createMapHTML() }}
            style={styles.webview}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            allowsBackForwardNavigationGestures={false}
            mixedContentMode="compatibility"
            originWhitelist={['*']}
            allowUniversalAccessFromFileURLs={true}
            allowFileAccessFromFileURLs={true}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error: ', nativeEvent);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView HTTP error: ', nativeEvent);
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

        {/* 하단 네비게이션 (임시) */}
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
        </View>


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
  webview: {
    flex: 1,
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
