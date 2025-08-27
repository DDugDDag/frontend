// src/screens/Record/RecordHomeScreen.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import RecordCard from "@/components/record/RecordCard";
import MetricPill from "@/components/record/MetricPill";
import { RECORDS, getAggregates } from "@/data/records";
import { fmtKm, fmtMin } from "@/types/activity";
import { useNavigation } from "@react-navigation/native";
import { RecordStackNav } from "@/screens/Record/RecordStack.types";
import Ionicons from 'react-native-vector-icons/Ionicons';


export default function RecordHomeScreen() {
  const nav = useNavigation<RecordStackNav>();
  const aggr = useMemo(() => getAggregates(RECORDS), []);

  const Header = (
    <>
      {/* 헤더 */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 }}>
        <Text style={st.title}>나의 기록</Text>
      </View>

      {/* 통계 카드(탭하면 통계 화면으로) */}
      <Pressable style={st.statsCard} onPress={() => nav.navigate("RecordStats")}>
        <View style={st.statsHeader}>
          <Text style={st.statsHeaderText}>기록 통계</Text>
          <Ionicons name="chevron-forward" size={18} color="#777" />
        </View>

        <View style={st.statsRow}>
          <MetricPill kind="time" label="" value={fmtMin(aggr.totalSec)} />
          <MetricPill kind="cal" label="" value={`${aggr.totalCal} cal`} />
          <MetricPill kind="distance" label="" value={fmtKm(aggr.totalM, 1)} />
          <MetricPill kind="leaf" label="" value={`${aggr.totalOz} oz`} />
        </View>
      </Pressable>

      {/* 지난 여행 리스트 헤더 */}
      <View style={st.listHeader}>
        <Text style={st.listHeaderTitle}>지난 여정</Text>
        <Pressable onPress={() => nav.navigate("RecordStats")}>
          <Text style={st.link}>모두 보기</Text>
        </Pressable>
      </View>
    </>
  );

  return (
    <ScreenWrapper
      scrollable={false}                // ✅ 중첩 스크롤 방지
      backgroundColor="#FFCF50"
    >
      <FlatList
        ListHeaderComponent={Header}    // ✅ 상단 콘텐츠를 헤더로
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        data={RECORDS}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <RecordCard
            record={item}
            onPress={() => nav.navigate("RecordDetail", { recordId: item.id })}
          />
        )}
      />
    </ScreenWrapper>
  );
}

const st = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: "#2d1b69" },
  statsCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  statsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statsHeaderText: { fontSize: 14, color: "#888", fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 10, flexWrap: "wrap" },
  listHeader: {
    marginTop: 18,
    marginBottom: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listHeaderTitle: { fontSize: 14, color: "#7d7d7d" },
  link: { fontSize: 13, color: "#8a6cf2", fontWeight: "600" },
});
