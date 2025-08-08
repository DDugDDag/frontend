// src/components/navigation/NavigationPanel.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useAppContext } from "@/stores/AppContext";
import { navigationService } from "@/services";
import { Colors } from "@/constants/Colors";

interface NavigationPanelProps {
  onNavigationUpdate?: (data: any) => void;
}

export default function NavigationPanel({
  onNavigationUpdate,
}: NavigationPanelProps) {
  const { state, actions } = useAppContext();

  const handleStartNavigation = async () => {
    if (!state.map.currentRoute) {
      Alert.alert("알림", "경로를 먼저 설정해주세요.");
      return;
    }

    try {
      const routePoints = state.map.currentRoute.route_points.map((point) => ({
        lat: point.lat,
        lng: point.lng,
      }));

      const response = await navigationService.startNavigation(
        routePoints,
        (navigationData) => {
          // 내비게이션 상태 업데이트
          actions.updateNavigation({
            currentSpeed: navigationData.currentSpeed,
            totalDistance: navigationData.totalDistance,
            remainingDistance: navigationData.remainingDistance,
            estimatedTime: navigationData.estimatedTime,
          });

          // 외부 콜백 호출
          if (onNavigationUpdate) {
            onNavigationUpdate(navigationData);
          }
        },
        (error) => {
          console.error("내비게이션 오류:", error);
          Alert.alert("내비게이션 오류", error);
          actions.stopNavigation();
        }
      );

      if (response.data) {
        actions.startNavigation();
        console.log("실시간 내비게이션 시작됨");
      } else {
        Alert.alert(
          "오류",
          response.error || "내비게이션을 시작할 수 없습니다."
        );
      }
    } catch (error) {
      console.error("내비게이션 시작 예외:", error);
      Alert.alert("오류", "내비게이션을 시작할 수 없습니다.");
    }
  };

  const handleStopNavigation = async () => {
    try {
      await navigationService.stopNavigation();
      actions.stopNavigation();
      console.log("실시간 내비게이션 중지됨");
    } catch (error) {
      console.error("내비게이션 중지 예외:", error);
    }
  };

  // 경로 요약 정보 (내비게이션이 시작되지 않은 경우)
  useEffect(() => {
    return () => {
      try {
        if (navigationService.isNavigationActive()) {
          navigationService.stopNavigation();
        }
      } catch {}
    };
  }, []);

  if (!state.map.isNavigating && state.map.currentRoute) {
    return (
      <View style={styles.routeSummaryPanel}>
        <View style={styles.routeSummaryInfo}>
          <Text style={styles.routeSummaryTitle}>경로 정보</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>거리: </Text>
            <Text style={styles.summaryValue}>
              {state.map.currentRoute.summary.distance} km
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>예상 시간: </Text>
            <Text style={styles.summaryValue}>
              {state.map.currentRoute.summary.duration} 분
            </Text>
          </View>
          <TouchableOpacity
            style={styles.startNavigationButton}
            onPress={handleStartNavigation}
          >
            <Text style={styles.startNavigationText}>실시간 안내 시작</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 실시간 내비게이션 정보 (내비게이션이 진행 중인 경우)
  if (state.map.isNavigating && state.map.navigationInfo) {
    return (
      <View style={styles.navigationPanel}>
        <View style={styles.navigationHeader}>
          <Text style={styles.navigationTitle}>실시간 안내</Text>
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStopNavigation}
          >
            <Text style={styles.stopButtonText}>중지</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navigationInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>현재 속도</Text>
            <Text style={styles.infoValue}>
              {state.map.navigationInfo.currentSpeed.toFixed(1)} km/h
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>남은 거리</Text>
            <Text style={styles.infoValue}>
              {state.map.navigationInfo.remainingDistance.toFixed(2)} km
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>도착 예정</Text>
            <Text style={styles.infoValue}>
              {state.map.navigationInfo.estimatedTime} 분
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  routeSummaryPanel: {
    position: "absolute",
    bottom: 70,
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
    color: Colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  navigationPanel: {
    position: "absolute",
    bottom: 70,
    left: 16,
    right: 16,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  navigationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  navigationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  stopButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stopButtonText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  navigationInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingBottom: 16,
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
});
