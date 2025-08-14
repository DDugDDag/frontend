// src/screens/Record/RecordDetailScreen.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, Share } from "react-native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { getRecordById } from "@/data/records";
import { fmtKm, fmtMin, fmtTimeHM, fmtYmdDot } from "@/types/activity";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RecordStackRouteProp } from "@/screens/Record/RecordStack.types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Polyline, Marker } from "react-native-maps";

export default function RecordDetailScreen() {
  const nav = useNavigation();
  const route = useRoute<RecordStackRouteProp<"RecordDetail">>();
  const record = getRecordById(route.params.recordId);

  const meta = useMemo(() => {
    if (!record) return null;
    const d = new Date(record.dateISO);
    return {
      title: "나의 기록",
      subtitle: `${fmtYmdDot(d)}, ${fmtTimeHM(d)} · ${fmtKm(record.distanceM)} · ${fmtMin(record.durationSec).replace(" mins","분")}`,
    };
  }, [record]);

  if (!record) {
    return (
      <ScreenWrapper backgroundColor="#FFCF50" >
        <View style={{ padding: 20 }}><Text>기록을 찾을 수 없습니다.</Text></View>
      </ScreenWrapper>
    );
  }

  const onShare = async () => {
    await Share.share({
      message: `[공유] ${record.type === "bike" ? "자전거" : "걷기"} · ${fmtKm(record.distanceM)} · ${fmtMin(record.durationSec)}`
    });
  };

  const first = record.path?.[0] ?? { latitude: 37.5665, longitude: 126.9780 };
  const last = record.path?.[record.path.length - 1] ?? first;

  return (
    <ScreenWrapper
      scrollable
      backgroundColor="#FFCF50"
    >
      {/* 헤더 */}
      <View style={st.headerRow}>
        <Pressable onPress={() => nav.goBack()} style={{ padding: 6, marginRight: 8 }}>
          <Ionicons name="chevron-back" size={22} />
        </Pressable>
        <Text style={st.title}>{meta?.title}</Text>
        <Pressable onPress={() => { /* 삭제 액션 연결 지점 */ }} style={{ marginLeft: "auto", padding: 6 }}>
          <Ionicons name="trash-outline" size={20} color="#7a5f00" />
        </Pressable>
      </View>
      <Text style={st.subtitle}>{meta?.subtitle}</Text>

      {/* 지도 */}
      <View style={st.mapCard}>
        <MapView
          style={{ width: "100%", height: 180, borderRadius: 16 }}
          initialRegion={{
            latitude: first.latitude,
            longitude: first.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {record.path && <Polyline coordinates={record.path} strokeWidth={4} />}
          <Marker coordinate={first} title="출발" />
          <Marker coordinate={last} title="도착" />
        </MapView>
      </View>

      {/* 출발/도착 타임라인 */}
      <View style={st.timeline}>
        <MaterialCommunityIcons name="transit-connection-variant" size={22} color="#7a5f00" />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <View style={st.rowBetween}>
            <Text style={st.pointText}>{record.startName ?? "출발 지점"}</Text>
            <Text style={st.timeText}>출발 {fmtTimeHM(new Date(record.dateISO))}</Text>
          </View>
          <View style={st.separator} />
          <View style={st.rowBetween}>
            <Text style={st.pointText}>{record.endName ?? "도착 지점"}</Text>
            <Text style={st.timeText}>도착 {fmtTimeHM(new Date(new Date(record.dateISO).getTime() + record.durationSec * 1000))}</Text>
          </View>
        </View>
      </View>

      {/* 공유 버튼 */}
      <Pressable style={st.shareBtn} onPress={onShare}>
        <Text style={st.shareText}>공유할겨우</Text>
        <Ionicons name="share-outline" size={18} />
      </Pressable>
    </ScreenWrapper>
  );
}

const st = StyleSheet.create({
  headerRow: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6, flexDirection: "row", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "800", color: "#2d1b69" },
  subtitle: { paddingHorizontal: 20, color: "#6d5b2e", marginBottom: 12 },
  mapCard: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  timeline: {
    marginTop: 16,
    marginHorizontal: 20,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pointText: { fontSize: 16, fontWeight: "700", color: "#2d1b69" },
  timeText: { fontSize: 12, color: "#7a5f00" },
  separator: { height: 10 },
  shareBtn: {
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  shareText: { fontWeight: "800", color: "#2d1b69" },
});
