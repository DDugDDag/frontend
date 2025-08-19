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
  NativeSyntheticEvent,
} from "react-native";
import KakaoMapView from "@/components/map/KakaoMapView";

import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import NavigationPanel from "@/components/navigation/NavigationPanel";
import BikeInfoPanel from "@/components/map/BikeInfoPanel";
import RideInputModal from "@/components/map/RideInputModal";
import SmartRouteModal from "@/components/map/SmartRouteModal";
import {
  SearchIcon,
  StarIcon,
  CompassIcon,
  HomeIcon,
  MapIcon,
} from "@/components/ui/Icons";
import { useAppContext } from "@/stores/AppContext";
import { stationService, aiRouteService } from "@/services";
import { styles } from '@/styles/map';

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
  const [isLoading, setIsLoading] = useState(false);
  const [showRideModal, setShowRideModal] = useState(false);
  const [rideModalType, setRideModalType] = useState<"time" | "distance">("time");
  const [showSmartRouteModal, setShowSmartRouteModal] = useState(false);

  useEffect(() => {
    loadBikeStations();
  }, []);

  useEffect(() => {
    if (state.map.currentRoute) {
      console.log("경로 데이터 업데이트:", state.map.currentRoute.summary);
    }
  }, [state.map.currentRoute]);

  const loadBikeStations = async () => {
    setIsLoading(true);
    try {
      const response = await stationService.getAllStations();
      if (response.data) {
        actions.loadStations(response.data);
      } else {
        const dummyStations = [
          { station_id: "1", lat: 36.3504, lng: 127.3845, available_bikes: 7, name: "정부청사역", address: "대전광역시 서구", last_updated: new Date().toISOString(), status: "운영중" },
          { station_id: "2", lat: 36.3621, lng: 127.3489, available_bikes: 14, name: "둔산동 주민센터", address: "대전광역시 서구", last_updated: new Date().toISOString(), status: "운영중" },
          { station_id: "3", lat: 36.3456, lng: 127.3912, available_bikes: 2, name: "시청역", address: "대전광역시 서구", last_updated: new Date().toISOString(), status: "운영중" },
        ];
        actions.loadStations(dummyStations);
      }
    } catch (error) {
      console.error("대여소 정보 로드 예외:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStationSelect = (event: NativeSyntheticEvent<{ stationId: string }>) => {
    const { stationId } = event.nativeEvent;
    console.log("네이티브에서 대여소 클릭:", stationId);
    const station = state.stations.allStations.find((s) => s.station_id === stationId);
    if (station) {
      actions.selectStation(station);
    }
  };

  const handleMapClick = (event: NativeSyntheticEvent<{ lat: number; lng: number }>) => {
    const { lat, lng } = event.nativeEvent;
    console.log("네이티브에서 지도 클릭:", lat, lng);
    actions.setSelectedLocation(lat, lng);
  };

  const handleRideTimeInput = () => {
    setRideModalType("time");
    setShowRideModal(true);
  };

  const handleRideDistanceInput = () => {
    setRideModalType("distance");
    setShowRideModal(true);
  };

  const handleRideModalSubmit = (value: number) => {
    console.log(`주행 ${rideModalType}:`, value);
  };

  const handleSmartRouteSubmit = async (data: { mode: 'bike' | 'walk'; time?: number; distance?: number; }) => {
    console.log('AI 목적지 추천 요청:', data);
    try {
      const currentLocation = { lat: 36.3504, lng: 127.3845 };
      const response = await aiRouteService.getSmartRoute({ ...data, currentLocation });
      if (response.data) {
        actions.setRoute({
          route_points: response.data.route,
          summary: { distance: response.data.totalDistance, duration: response.data.totalDuration, mode: response.data.routeType },
          segments: response.data.segments,
        });
        actions.setSelectedLocation(response.data.destination.lat, response.data.destination.lng);
      } else {
        Alert.alert('오류', 'AI 경로 추천에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('AI 경로 추천 오류:', error);
      Alert.alert('오류', 'AI 경로 추천 중 오류가 발생했습니다.');
    }
  };

  return (
    <ScreenWrapper backgroundColor="#fff" paddingHorizontal={0}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <View style={styles.mapContainer}>
        <KakaoMapView
          style={{ flex: 1 }}            // ✅ 추가
          // 또는 style={StyleSheet.absoluteFillObject}
          stationList={state.stations.allStations}
          onStationSelect={handleStationSelect}
          onMapClick={handleMapClick}
          collapsable={false}            // ✅ 안드로이드 뷰 제거 방지
        />
        </View>

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
              <StarIcon size={12} color="#3B1E1E" />
              <Text style={styles.favoriteText}>몰라유</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
        
        <View style={styles.testButtonsContainer}>
            <TouchableOpacity style={styles.testButton} onPress={handleRideTimeInput}>
                <Text style={styles.testButtonText}>주행 시간</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.testButton} onPress={handleRideDistanceInput}>
                <Text style={styles.testButtonText}>주행 거리</Text>
            </TouchableOpacity>
        </View>

        <NavigationPanel />
        <BikeInfoPanel
          visible={!!state.stations.selectedStation && !state.map.isNavigating}
          onOpenTashuApp={() => console.log("타슈 앱 열기 시도")}
        />
        <RideInputModal
          visible={showRideModal}
          type={rideModalType}
          onClose={() => setShowRideModal(false)}
          onSubmit={handleRideModalSubmit}
        />
        <SmartRouteModal
          visible={showSmartRouteModal}
          onClose={() => setShowSmartRouteModal(false)}
          onSubmit={handleSmartRouteSubmit}
        />
      </SafeAreaView>
    </ScreenWrapper>
  );
}