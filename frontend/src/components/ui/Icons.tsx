// src/components/ui/Icons.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface IconProps {
  size?: number;
  color?: string;
}

// 검색 아이콘
export const SearchIcon = ({ size = 20, color = "#666" }: IconProps) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.icon, { fontSize: size * 0.8, color }]}>🔍</Text>
  </View>
);

// 위치 아이콘 (현재 위치)
export const LocationIcon = ({ size = 12, color = "#5B913B" }: IconProps) => (
  <View
    style={[
      styles.locationDot,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      },
    ]}
  />
);

// 목적지 아이콘
export const DestinationIcon = ({ size = 16, color = "#666" }: IconProps) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.icon, { fontSize: size * 0.9, color }]}>📍</Text>
  </View>
);

// 즐겨찾기/몰라유 아이콘
export const StarIcon = ({ size = 12, color = "#FFCF50" }: IconProps) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.icon, { fontSize: size, color }]}>⭐</Text>
  </View>
);

// 내비게이션 아이콘들
export const CompassIcon = ({ size = 24, color = "#666" }: IconProps) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.icon, { fontSize: size * 0.9, color }]}>🧭</Text>
  </View>
);

export const RecordIcon = ({ size = 24, color = "#666" }: IconProps) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.icon, { fontSize: size * 0.9, color }]}>✏️</Text>
  </View>
);

export const HomeIcon = ({ size = 24, color = "#666" }: IconProps) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.icon, { fontSize: size * 0.9, color }]}>🏠</Text>
  </View>
);

export const MapIcon = ({ size = 24, color = "#666" }: IconProps) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.icon, { fontSize: size * 0.9, color }]}>🗺️</Text>
  </View>
);

// 뒤로가기 아이콘
export const BackIcon = ({ size = 24, color = "#3B1E1E" }: IconProps) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.icon, { fontSize: size, color, fontWeight: "bold" }]}>
      ←
    </Text>
  </View>
);

// 음성 아이콘
export const MicIcon = ({ size = 20, color = "#666" }: IconProps) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.icon, { fontSize: size * 0.9, color }]}>🎤</Text>
  </View>
);

// 장소 타입별 아이콘
export const BikeStationIcon = ({
  size = 16,
  color = "#5B913B",
}: IconProps) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.icon, { fontSize: size * 0.9, color }]}>🚲</Text>
  </View>
);

export const LandmarkIcon = ({ size = 16, color = "#666" }: IconProps) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.icon, { fontSize: size * 0.9, color }]}>📍</Text>
  </View>
);

export const PlaceIcon = ({ size = 16, color = "#666" }: IconProps) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Text style={[styles.icon, { fontSize: size * 0.9, color }]}>📍</Text>
  </View>
);

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    textAlign: "center",
  },
  locationDot: {
    // 현재 위치 점 스타일
  },
});
