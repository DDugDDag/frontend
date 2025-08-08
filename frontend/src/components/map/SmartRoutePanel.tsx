// src/components/map/SmartRoutePanel.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useAppContext } from "@/stores/AppContext";
import { Colors } from "@/constants/Colors";

const { width } = Dimensions.get("window");

interface SmartRoutePanelProps {
  visible: boolean;
  onStartNavigation?: () => void;
}

export default function SmartRoutePanel({
  visible,
  onStartNavigation,
}: SmartRoutePanelProps) {
  const { state } = useAppContext();
  const currentRoute = state.map.currentRoute;
  const [selectedMode, setSelectedMode] = useState<"bike" | "walk">(
    currentRoute?.summary?.mode || "bike"
  );

  if (!visible || !currentRoute) {
    return null;
  }

  const routeMode = selectedMode;
  const totalDuration = currentRoute.summary?.duration || 15;
  const totalDistance = currentRoute.summary?.distance || 2.5;

  const handleStartNavigation = () => {
    console.log("내비게이션 시작");
    if (onStartNavigation) {
      onStartNavigation();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        {/* 모드 선택 탭 (클릭 가능) */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeTab,
              routeMode === "bike" && styles.modeTabActive,
            ]}
            onPress={() => setSelectedMode("bike")}
          >
            <Text
              style={[
                styles.modeTabText,
                routeMode === "bike" && styles.modeTabTextActive,
              ]}
            >
              따릉
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeTab,
              routeMode === "walk" && styles.modeTabActive,
            ]}
            onPress={() => setSelectedMode("walk")}
          >
            <Text
              style={[
                styles.modeTabText,
                routeMode === "walk" && styles.modeTabTextActive,
              ]}
            >
              뚜벅
            </Text>
          </TouchableOpacity>
        </View>

        {/* 경로 정보 */}
        <View style={styles.routeInfo}>
          <View style={styles.navigationIcon}>
            <Text style={styles.navigationEmoji}>
              {routeMode === "bike" ? "🚲" : "🚶‍♂️"}
            </Text>
          </View>

          <View style={styles.routeDetails}>
            <Text style={styles.routeModeTitle}>
              {routeMode === "bike" ? "따릉 모드" : "뚜벅 모드"}
            </Text>
            <Text style={styles.routeTime}>
              총 이동시간{" "}
              <Text style={styles.routeTimeValue}>{totalDuration}분</Text>
            </Text>
          </View>
        </View>

        {/* 액션 버튼들 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.navigationButton}
            onPress={handleStartNavigation}
          >
            <Text style={styles.navigationButtonText}>내비게이션 시작</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tashuButton}
            onPress={() => {
              console.log("타슈 앱 열기");
              // TODO: 실제 타슈 앱 열기 구현
            }}
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
    bottom: 70, // 하단 네비게이션 위에 여유 공간 확보
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  panel: {
    backgroundColor: "#FFCF50",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modeSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 25,
    padding: 4,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  modeTabActive: {
    backgroundColor: Colors.secondary,
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  modeTabTextActive: {
    color: Colors.text,
  },
  routeInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  navigationIcon: {
    alignItems: "center",
    marginRight: 16,
  },
  navigationEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  navigationText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },
  routeDetails: {
    flex: 1,
  },
  routeModeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3B1E1E",
    marginBottom: 4,
  },
  routeTime: {
    fontSize: 14,
    color: "#3B1E1E",
  },
  routeTimeValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3B1E1E",
  },
  illustrationContainer: {
    alignItems: "flex-end",
    marginBottom: 16,
  },
  bikeIllustration: {
    padding: 8,
  },
  bikeEmoji: {
    fontSize: 48,
  },
  walkIllustration: {
    padding: 8,
  },
  walkEmoji: {
    fontSize: 48,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  navigationButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navigationButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  tashuButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tashuButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },
});
