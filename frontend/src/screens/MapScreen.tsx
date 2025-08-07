// src/screens/MapScreen.tsx - Kakao Maps Native SDK Implementation
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  Keyboard,
} from "react-native";
import { KakaoMapView, KakaoMapRef } from "@react-native-kakao/map";
import { useNavigation } from "@react-navigation/native";
import { CoordinateTransform } from "@/utils/coordinateTransform";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import NavigationPanel from "@/components/navigation/NavigationPanel";
import BikeInfoPanel from "@/components/map/BikeInfoPanel";
import SmartRouteModal from "@/components/map/SmartRouteModal";
import SmartRoutePanel from "@/components/map/SmartRoutePanel";
import { SearchIcon, StarIcon } from "@/components/ui/Icons";
import { useAppContext } from "@/stores/AppContext";
import { stationService, aiRouteService } from "@/services";
import { Colors } from "@/constants/Colors";

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const navigation = useNavigation();
  const { state, actions } = useAppContext();
  const mapViewRef = useRef<KakaoMapRef>(null);
  const [showSmartRouteModal, setShowSmartRouteModal] = useState(false);
  
  // 대전 지역 중심 좌표
  const [camera, setCamera] = useState({
    lat: 36.3504,
    lng: 127.3845,
    zoomLevel: 6,
  });

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

  // 상태 업데이트 및 성능 최적화
  useEffect(() => {
    console.log('카메라 상태 변경:', camera);
    
    // 카메라 변경 시 마커 업데이트 최적화
    const updateTimeout = setTimeout(() => {
      // 마커 업데이트 로직을 디바운스하여 성능 향상
    }, 50);
    
    return () => clearTimeout(updateTimeout);
  }, [camera.lat, camera.lng, camera.zoomLevel]);

  // 키보드 이벤트 감지
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      // 키보드가 나타났을 때 지도 크기 조정
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // 키보드가 숨겨졌을 때 지도 크기 복원
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

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




  // 성능 최적화된 마커 위치 계산 함수
  const calculateMarkerPosition = useCallback((station: any) => {
    if (!camera) return { top: 0, left: 0 };
    
    const pixel = CoordinateTransform.coordinateToPixel(
      { lat: station.lat, lng: station.lng },
      camera,
      width,
      height - 200 // 상단 검색바와 하단 패널 공간 제외
    );
    
    return {
      top: pixel.y + 100, // 상단 검색바 높이 고려
      left: pixel.x - 18, // 마커 중심점 조정
    };
  }, [camera, width, height]);

  // 마커가 화면 영역 내에 있는지 확인
  const isStationVisible = useCallback((station: any) => {
    if (!camera) return false;
    
    return CoordinateTransform.isCoordinateInViewport(
      { lat: station.lat, lng: station.lng },
      camera,
      width,
      height - 200,
      50 // 여유 공간
    );
  }, [camera, width, height]);

  // 화면에 표시될 마커 리스트 메모이제이션
  const visibleStations = useMemo(() => {
    return state.stations.allStations.filter(isStationVisible);
  }, [state.stations.allStations, isStationVisible]);

  // 지도 클릭 이벤트 핸들러
  const handleMapClick = useCallback((event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const coordinate = CoordinateTransform.pixelToCoordinate(
      { x: locationX, y: locationY },
      camera,
      width,
      height - 200
    );
    console.log('지도 클릭:', coordinate);
    actions.setSelectedLocation(coordinate.lat, coordinate.lng);
  }, [camera, width, height, actions]);

  // 마커 사이즈 메모이제이션
  const markerSize = useMemo(() => {
    return CoordinateTransform.calculateMarkerSize(36, camera.zoomLevel);
  }, [camera.zoomLevel]);

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

  // 마커 색상 결정 함수
  const getMarkerColor = (station: any) => {
    if (state.stations.selectedStation?.station_id === station.station_id) {
      return '#5B913B'; // 선택된 대여소: 초록색
    }
    if (station.available_bikes === 0) {
      return '#999999'; // 빈 대여소: 회색
    }
    if (station.available_bikes <= 3) {
      return '#FFA500'; // 부족한 대여소: 주황색
    }
    return '#FFCF50'; // 충분한 대여소: 노란색
  };

  // 카메라 애니메이션 함수
  const animateCameraToLocation = useCallback((lat: number, lng: number, zoomLevel: number = 5) => {
    setCamera({
      lat,
      lng,
      zoomLevel,
    });
  }, []);

  // 대여소 선택 시 카메라 이동
  const handleMarkerPress = useCallback((station: any) => {
    console.log('마커 클릭:', station);
    actions.selectStation(station);
    
    // 키보드 숨기기
    Keyboard.dismiss();
    
    // 카메라를 마커 위치로 이동
    animateCameraToLocation(station.lat, station.lng, Math.max(camera.zoomLevel, 5));
  }, [actions, camera.zoomLevel]);

  // 줄 레벨 제스처 핸들러
  const handleZoomIn = useCallback(() => {
    setCamera(prev => ({
      ...prev,
      zoomLevel: Math.min(prev.zoomLevel + 1, 14)
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setCamera(prev => ({
      ...prev,
      zoomLevel: Math.max(prev.zoomLevel - 1, 1)
    }));
  }, []);

  // 현재 위치로 이동
  const handleCurrentLocation = useCallback(async () => {
    try {
      // TODO: 위치 규한 확인 및 현재 위치 가져오기
      // 임시로 대전 중심으로 이동
      animateCameraToLocation(36.3504, 127.3845, 6);
    } catch (error) {
      console.error('현재 위치 가져오기 실패:', error);
      Alert.alert('오류', '현재 위치를 가져올 수 없습니다.');
    }
  }, []);

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

        {/* 카카오 네이티브 지도 */}
        <View style={styles.mapContainer}>
          <KakaoMapView
            ref={mapViewRef}
            style={styles.map}
            camera={camera}
            isShowCompass={true}
            isShowScaleBar={true}
            baseMapType="map"
            poiEnabled={true}
            poiClickable={true}
          />
          
          {/* 지도 클릭 이벤트를 위한 투명 오버레이 */}
          <TouchableOpacity
            style={styles.mapClickOverlay}
            activeOpacity={1.0}
            onPress={handleMapClick}
          />
          
          {/* 대여소 오버레이 마커들 (좌표 변환 사용) */}
          {visibleStations.map((station) => {
              const position = calculateMarkerPosition(station);
              
              return (
                <TouchableOpacity
                  key={station.station_id}
                  style={[
                    styles.markerOverlay,
                    {
                      top: position.top,
                      left: position.left,
                    }
                  ]}
                  onPress={() => handleMarkerPress(station)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <View
                    style={[
                      styles.customMarker,
                      { 
                        backgroundColor: getMarkerColor(station),
                        width: markerSize,
                        height: markerSize,
                        borderRadius: markerSize / 2,
                        borderWidth: state.stations.selectedStation?.station_id === station.station_id ? 4 : 3,
                        borderColor: state.stations.selectedStation?.station_id === station.station_id ? '#2E7D1B' : '#fff',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 5,
                      }
                    ]}
                  >
                    <Text style={[
                      styles.markerText,
                      { 
                        fontSize: Math.max(10, markerSize * 0.33),
                        color: state.stations.selectedStation?.station_id === station.station_id ? '#fff' : '#3B1E1E',
                        fontWeight: state.stations.selectedStation?.station_id === station.station_id ? 'bold' : 'bold',
                      }
                    ]}>
                      {station.available_bikes}
                    </Text>
                  </View>
                  <Text style={[
                    styles.markerLabel,
                    { 
                      fontSize: Math.max(9, markerSize * 0.25),
                      backgroundColor: state.stations.selectedStation?.station_id === station.station_id 
                        ? 'rgba(46, 125, 27, 0.9)' 
                        : 'rgba(255, 255, 255, 0.8)',
                      color: state.stations.selectedStation?.station_id === station.station_id ? '#fff' : '#000',
                    }
                  ]}>
                    {station.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          
          {/* 선택된 위치 마커 */}
          {state.map.selectedLocation && (
            (() => {
              const selectedPosition = calculateMarkerPosition({
                lat: state.map.selectedLocation.lat,
                lng: state.map.selectedLocation.lng,
              });
              
              return (
                <View
                  style={[
                    styles.markerOverlay,
                    {
                      top: selectedPosition.top,
                      left: selectedPosition.left,
                    }
                  ]}
                >
                  <View style={styles.selectedLocationMarker}>
                    <View style={styles.selectedLocationDot} />
                  </View>
                </View>
              );
            })()
          )}
          
          {/* 경로 선 시각화 */}
          {state.map.currentRoute && state.map.currentRoute.route_points && (
            <View style={styles.routeOverlay}>
              {state.map.currentRoute.route_points.map((point, index) => {
                if (index === 0) return null; // 첨번째 포인트 제외
                
                const currentPos = calculateMarkerPosition(point);
                const prevPos = calculateMarkerPosition(state.map.currentRoute!.route_points[index - 1]);
                
                const distance = Math.sqrt(
                  Math.pow(currentPos.left - prevPos.left, 2) + 
                  Math.pow(currentPos.top - prevPos.top, 2)
                );
                
                const angle = Math.atan2(
                  currentPos.top - prevPos.top, 
                  currentPos.left - prevPos.left
                ) * 180 / Math.PI;
                
                return (
                  <View
                    key={`route-${index}`}
                    style={[
                      styles.routeSegment,
                      {
                        left: prevPos.left,
                        top: prevPos.top,
                        width: distance,
                        transform: [{ rotate: `${angle}deg` }],
                      }
                    ]}
                  />
                );
              })}
            </View>
          )}
          
          {/* 맵 컨트롤 버튼들 */}
          <View style={styles.mapControls}>
            <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn}>
              <Text style={styles.controlButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut}>
              <Text style={styles.controlButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={handleCurrentLocation}>
              <Text style={styles.controlButtonText}>⌖</Text>
            </TouchableOpacity>
          </View>
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
          }}
        />

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
    zIndex: 1000,
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
    position: 'relative',
  },
  mapClickOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: 'box-none',
  },
  map: {
    width: width,
    height: '100%',
  },
  markerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 100,
    pointerEvents: 'auto',
  },
  customMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3B1E1E',
  },
  markerLabel: {
    fontSize: 10,
    color: '#000',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '600',
  },
  selectedLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF4444',
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  selectedLocationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  routeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    pointerEvents: 'none',
  },
  routeSegment: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#5B913B',
    borderRadius: 2,
    opacity: 0.8,
  },
  mapControls: {
    position: 'absolute',
    top: 20,
    right: 16,
    zIndex: 200,
    flexDirection: 'column',
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.backgroundDark,
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
});