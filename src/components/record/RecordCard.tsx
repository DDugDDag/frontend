// src/components/record/RecordCard.tsx
import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { ActivityRecord, fmtKm } from "@/types/activity";
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  record: ActivityRecord;
  onPress?: () => void;
};

export default function RecordCard({ record, onPress }: Props) {
  return (
    <Pressable style={s.card} onPress={onPress}>
      {/* 미니 맵 프리뷰(이미지 플레이스홀더) */}
      <Image
        source={{ uri: "https://maps.gstatic.com/tactile/basepage/pegman_sherlock.png" }}
        style={s.thumb}
      />
      <View style={{ flex: 1 }}>
        <Text style={s.title}>
          {record.type === "bike" ? "자전거" : record.type === "walk" ? "걷기" : "러닝"}
        </Text>
        <Text style={s.meta}>
          Distance: {fmtKm(record.distanceM, 0)}   Pace: {record.paceKmHr?.toFixed(1)} km/hr
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  thumb: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#eee" },
  title: { fontSize: 16, fontWeight: "600", color: "#222" },
  meta: { fontSize: 12, color: "#777", marginTop: 2 },
});
