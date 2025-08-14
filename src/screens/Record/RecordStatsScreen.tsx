// src/screens/Record/RecordStatsScreen.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { getAggregates } from "@/data/records";
import { fmtKm, fmtMeter, fmtMin } from "@/types/activity";
import MetricPill from "@/components/record/MetricPill";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function RecordStatsScreen() {
  const nav = useNavigation();
  const aggr = useMemo(() => getAggregates(), []);

  return (
    <ScreenWrapper
      scrollable
      backgroundColor="#FFCF50"
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10, flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={() => nav.goBack()} style={{ padding: 6, marginRight: 8 }}>
          <Ionicons name="chevron-back" size={22} />
        </Pressable>
        <Text style={st.title}>기록 통계</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <View style={st.card}><MetricPill kind="time" label="이동 시간" value={fmtMin(aggr.totalSec)} /></View>
        <View style={st.card}><MetricPill kind="cal" label="칼로리" value={`${aggr.totalCal} cal`} /></View>
        <View style={st.card}><MetricPill kind="distance" label="이동 거리" value={fmtMeter(aggr.totalM)} /></View>
        <View style={st.card}><MetricPill kind="leaf" label="절약 탄소배출량" value={`${aggr.totalOz} oz`} /></View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const st = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "800", color: "#2d1b69" },
  card: { marginBottom: 14 },
});
