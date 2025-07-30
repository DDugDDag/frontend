// src/screens/MapScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import Constants from 'expo-constants';
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { SearchIcon, StarIcon, CompassIcon, HomeIcon, MapIcon } from "@/components/ui/Icons";
import { useAppContext } from "@/stores/AppContext";
import { stationService } from "@/services";
import { Colors } from "@/constants/Colors";

interface BikeStation {
  id: string;
  lat: number;
  lng: number;
  available: number;
  name: string;
}

interface NavigationInfo {
  speed: string;
  distance: string;
  duration: string;
  isNavigating: boolean;
}

export default function MapScreen() {
  const navigation = useNavigation();
  const { state, actions } = useAppContext();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 실제 대여소 데이터 로드
  useEffect(() => {
    loadBikeStations();
  }, []);

  // 경로가 설정되면 내비게이션 정보 업데이트
  useEffect(() => {
    if (state.map.currentRoute) {
      console.log('경로 데이터 업데이트:', state.map.currentRoute.summary);
    }
  }, [state.map.currentRoute]);

  const loadBikeStations = async () => {
    setIsLoading(true);
    try {
      const response = await stationService.getAllStations();
      if (response.data) {
        actions.loadStations(response.data);
        console.log('대여소 정보 로드 완료:', response.data.length, '개');
      } else {
        console.error('대여소 정보 로드 실패:', response.error);
        // 실패 시 더미 데이터 사용
        const dummyStations = [
          { station_id: "1", lat: 36.3504, lng: 127.3845, available_bikes: 7, name: "정부청사역", address: "대전광역시 서구", last_updated: new Date().toISOString(), status: "운영중" },
          { station_id: "2", lat: 36.3621, lng: 127.3489, available_bikes: 14, name: "둔산동 주민센터", address: "대전광역시 서구", last_updated: new Date().toISOString(), status: "운영중" },
          { station_id: "3", lat: 36.3456, lng: 127.3912, available_bikes: 2, name: "시청역", address: "대전광역시 서구", last_updated: new Date().toISOString(), status: "운영중" },
          { station_id: "4", lat: 36.3789, lng: 127.3567, available_bikes: 24, name: "대전역", address: "대전광역시 동구", last_updated: new Date().toISOString(), status: "운영중" },
          { station_id: "5", lat: 36.3234, lng: 127.4123, available_bikes: 0, name: "유성온천역", address: "대전광역시 유성구", last_updated: new Date().toISOString(), status: "운영중" },
          { station_id: "6", lat: 36.3890, lng: 127.3234, available_bikes: 18, name: "서대전네거리", address: "대전광역시 서구", last_updated: new Date().toISOString(), status: "운영중" },
          { station_id: "7", lat: 36.3123, lng: 127.3678, available_bikes: 1, name: "중앙로역", address: "대전광역시 중구", last_updated: new Date().toISOString(), status: "운영중" },
        ];
        actions.loadStations(dummyStations);
      }
    } catch (error) {
      console.error('대여소 정보 로드 예외:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 카카오맵 HTML 템플릿
  const createMapHTML = () => {
    const stations = state.stations.allStations.map(station => ({
      id: station.station_id,
      lat: station.lat,
      lng: station.lng,
      available: station.available_bikes,
      name: station.name,
    }));
    
    const stationsJS = JSON.stringify(stations);
    const currentRouteJS = state.map.currentRoute ? JSON.stringify(state.map.currentRoute.route_points) : 'null';
    const selectedLocationJS = state.map.selectedLocation ? JSON.stringify(state.map.selectedLocation) : 'null';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>뚰따 지도</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=${Constants.expoConfig?.extra?.KAKAO_MAP_API_KEY || '5fd93db4631259c8576b6ce26b8fc125'}"></script>
        <style>
            body { margin: 0; padding: 0; }
            #map { width: 100%; height: 100vh; }
            .custom-marker {
                background: #FFCF50;
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
        <script>
            var mapContainer = document.getElementById('map');
            var mapOption = {
                center: new kakao.maps.LatLng(36.3504, 127.3845), // 대전 중심
                level: 3
            };
            
            var map = new kakao.maps.Map(mapContainer, mapOption);
            var stations = ${stationsJS};
            var routePoints = ${currentRouteJS};
            var selectedLocation = ${selectedLocationJS};
            
            // 자전거 대여소 마커 추가
            stations.forEach(function(station) {
                var markerPosition = new kakao.maps.LatLng(station.lat, station.lng);
                
                var content = '<div class="custom-marker">' + station.available + '</div>';
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
            
            // 현재 위치 마커 (대전 시청 기준)
            var currentPosition = new kakao.maps.LatLng(36.3504, 127.3845);
            var currentLocationOverlay = new kakao.maps.CustomOverlay({
                position: currentPosition,
                content: '<div class="current-location"></div>',
                yAnchor: 1
            });
            currentLocationOverlay.setMap(map);
            
            // 경로 표시
            if (routePoints && routePoints.length > 0) {
                var path = routePoints.map(function(point) {
                    return new kakao.maps.LatLng(point.lat, point.lng);
                });
                
                var polyline = new kakao.maps.Polyline({
                    path: path,
                    strokeWeight: 6,
                    strokeColor: '#5B913B',
                    strokeOpacity: 0.8,
                    strokeStyle: 'solid'
                });
                
                polyline.setMap(map);
                
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
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'mapClick',
                    lat: latlng.getLat(),
                    lng: latlng.getLng()
                }));
            });
        </script>
    </body>
    </html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'stationClick') {
        console.log('대여소 클릭:', data.station);
        
        // 대여소 정보를 상태에서 찾기
        const station = state.stations.allStations.find(s => s.station_id === data.station.id);
        if (station) {
          actions.selectStation(station);
          // TODO: 대여소 상세 정보 모달 표시
        }
      } else if (data.type === 'mapClick') {
        console.log('지도 클릭:', data.lat, data.lng);
        // 클릭한 위치를 선택된 위치로 설정
        actions.setSelectedLocation(data.lat, data.lng);
      }
    } catch (error) {
      console.error('WebView 메시지 파싱 오류:', error);
    }
  };

  const toggleNavigation = () => {
    if (state.map.isNavigating) {
      actions.stopNavigation();
    } else if (state.map.currentRoute) {
      actions.startNavigation();
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
            <TouchableOpacity style={styles.favoriteButton}>
              <StarIcon size={12} color="#3B1E1E" />
              <Text style={styles.favoriteText}>물리유</Text>
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
          />
        </View>

        {/* 내비게이션 정보 패널 */}
        {state.map.isNavigating && state.map.navigationInfo && (
          <View style={styles.navigationPanel}>
            <View style={styles.navigationInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>현재 속도</Text>
                <Text style={styles.infoValue}>{state.map.navigationInfo.currentSpeed.toFixed(1)} km/h</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>총 거리</Text>
                <Text style={styles.infoValue}>{state.map.navigationInfo.totalDistance.toFixed(2)} km</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>이동 예상 시간</Text>
                <Text style={styles.infoValue}>{state.map.navigationInfo.estimatedTime} mins</Text>
              </View>
            </View>
          </View>
        )}

        {/* 경로 요약 정보 (경로가 있지만 내비게이션이 시작되지 않은 경우) */}
        {!state.map.isNavigating && state.map.currentRoute && (
          <View style={styles.routeSummaryPanel}>
            <View style={styles.routeSummaryInfo}>
              <Text style={styles.routeSummaryTitle}>경로 정보</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>거리: </Text>
                <Text style={styles.summaryValue}>{state.map.currentRoute.summary.distance} km</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>예상 시간: </Text>
                <Text style={styles.summaryValue}>{state.map.currentRoute.summary.duration} 분</Text>
              </View>
              <TouchableOpacity 
                style={styles.startNavigationButton}
                onPress={toggleNavigation}
              >
                <Text style={styles.startNavigationText}>안내 시작</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 하단 네비게이션 (임시) */}
        <View style={styles.bottomNavigation}>
          <TouchableOpacity style={styles.navButton}>
            <CompassIcon size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navButton, styles.activeNavButton]}>
            <HomeIcon size={24} color="#3B1E1E" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={toggleNavigation}>
            <MapIcon size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
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
    color: "#666",
  },
  favoriteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accent,
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
  navigationPanel: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: Colors.accent,
    margin: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  navigationInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.text,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  bottomNavigation: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
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
    backgroundColor: Colors.accent,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  routeSummaryPanel: {
    position: "absolute",
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  routeSummaryInfo: {
    padding: 16,
  },
  routeSummaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  startNavigationButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  startNavigationText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});