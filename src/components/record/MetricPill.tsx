// src/components/MetricPill.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Kind = "time" | "cal" | "distance" | "leaf";
type Props = { kind: Kind; label: string; value: string };

export default function MetricPill({ kind, label, value }: Props) {
  const Icon =
    kind === "time" ? () => <Ionicons name="time-outline" size={20} /> :
    kind === "cal" ? () => <MaterialCommunityIcons name="fire" size={22} /> :
    kind === "distance" ? () => <MaterialCommunityIcons name="sine-wave" size={22} /> :
    () => <Ionicons name="leaf-outline" size={22} />;

  return (
    <View style={s.pill}>
      <Icon />
      <View style={{ marginLeft: 8 }}>
        <Text style={s.label}>{label}</Text>
        <Text style={s.value}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  label: { color: "#7c7c7c", fontSize: 12 },
  value: { color: "#2d1b69", fontSize: 18, fontWeight: "700", marginTop: 2 },
});
