// src/components/map/BikeInfoPanel.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAppContext } from "@/stores/AppContext";
import { Colors } from "@/constants/Colors";

interface BikeInfoPanelProps {
  visible: boolean;
  onOpenTashuApp?: () => void;
}

export default function BikeInfoPanel({
  visible,
  onOpenTashuApp,
}: BikeInfoPanelProps) {
  const { state } = useAppContext();
  const selectedStation = state.stations.selectedStation;

  if (!visible || !selectedStation) {
    return null;
  }

  // 거리 계산 (현재 위치와 선택된 대여소 사이)
  const calculateDistance = (): string => {
    if (state.map.currentLocation) {
      const { lat: currentLat, lng: currentLng } = state.map.currentLocation;
      const { lat: stationLat, lng: stationLng } = selectedStation;

      // 하버사인 공식으로 거리 계산
      const R = 6371000; // 지구 반지름 (미터)
      const dLat = ((stationLat - currentLat) * Math.PI) / 180;
      const dLng = ((stationLng - currentLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((currentLat * Math.PI) / 180) *
          Math.cos((stationLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return distance < 1000
        ? `${Math.round(distance)}m`
        : `${(distance / 1000).toFixed(1)}km`;
    }
    return "계산 중...";
  };

  const handleOpenTashuApp = () => {
    console.log("타슈 앱 열기");
    if (onOpenTashuApp) {
      onOpenTashuApp();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        {/* 자전거 일러스트 (왼쪽) */}
        <View style={styles.bikeIllustrationContainer}>
          <Text style={styles.bikeEmoji}>🚲</Text>
        </View>

        {/* 오른쪽 정보 영역 */}
        <View style={styles.infoContainer}>
          {/* 상단 타슈 개수 */}
          <Text style={styles.bikeCountText}>
            타슈 {selectedStation.available_bikes}대 발견했슈
          </Text>

          {/* 거리 정보 */}
          <Text style={styles.distanceText}>
            걸어갈 거리 {calculateDistance()}
          </Text>

          {/* 타슈 앱 열기 버튼 */}
          <TouchableOpacity
            style={styles.tashuButton}
            onPress={handleOpenTashuApp}
          >
            <Text style={styles.tashuButtonText}>타슈 앱 열기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 60, // 하단 네비게이션 위에 위치
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  panel: {
    backgroundColor: Colors.primary, // 노란색 배경 (#FFCF50)
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  bikeIllustrationContainer: {
    marginRight: 20,
  },
  bikeEmoji: {
    fontSize: 80, // 큰 자전거 이모지
  },
  infoContainer: {
    flex: 1,
    alignItems: "flex-end", // 오른쪽 정렬
  },
  bikeCountText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text, // 진한 갈색 텍스트
    marginBottom: 8,
    textAlign: "right",
  },
  distanceText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
    textAlign: "right",
  },
  tashuButton: {
    backgroundColor: Colors.background, // 흰색 배경
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tashuButtonText: {
    color: Colors.text, // 진한 갈색 텍스트
    fontSize: 16,
    fontWeight: "bold",
  },
});
