// src/screens/HomeScreen.tsx

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { homeHeaderStyles as h } from "@/styles/user";
import { nearbyStyles as n } from "@/styles/nearby";
import * as Location from "expo-location";
import { WEATHER_API_KEY } from "@env";
import { apiClient } from "@/services";

const today = new Date();
const formattedDate = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "long" }).format(today);

type Weather = { temp: number; condition: string; area: string; icon: string };

type StationCard = { id: string; name: string; distance: string; image: string };

const nearbyStationsFallback: StationCard[] = [
  { id: "1", name: "둔산대여소", distance: "1.2 km", image: "1.jpg" },
  { id: "2", name: "시청역 앞", distance: "0.8 km", image: "2.jpg" },
  { id: "3", name: "한밭도서관", distance: "1.8 km", image: "3.jpg" },
];

const username = "홍길동";
export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [stations, setStations] = useState<StationCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("위치 권한 거부됨");
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);

        const { latitude, longitude } = loc.coords;

        // 날씨
        const weatherResp = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=kr`
        );
        if (weatherResp.ok) {
          const w = await weatherResp.json();
          setWeather({
            temp: Math.round(w?.main?.temp ?? 0),
            condition: w?.weather?.[0]?.description ?? "",
            area: w?.name ?? "",
            icon: w?.weather?.[0]?.icon ?? "",
          });
        }

        // 근처 정류소(백엔드)
        const stationRes = await apiClient.post<any[]>("/api/nearby", { lat: latitude, lon: longitude });
        if (stationRes.data && Array.isArray(stationRes.data)) {
          const toKm = (m: number) => `${(m / 1000).toFixed(1)} km`;
          const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const R = 6371000; // meters
            const toRad = (d: number) => (d * Math.PI) / 180;
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
          };

          const cards: StationCard[] = stationRes.data.map((s: any) => ({
            id: s.station_id || s.id || String(Math.random()),
            name: s.name || "대여소",
            distance: toKm(haversine(latitude, longitude, s.lat || s.latitude, s.lng || s.longitude)),
            image: "1.jpg",
          }));
          setStations(cards);
        } else {
          setStations(nearbyStationsFallback);
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        setStations(nearbyStationsFallback);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const weatherIconUri = weather?.icon ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png` : undefined;

  return (
    <ScreenWrapper scrollable backgroundColor="#FFCF50">
      {/* Header */}
      <View style={h.header}>
        <Image source={{ uri: "https://example.com/profile.jpg" }} style={h.profileImage} />
        <Text style={h.userName}>{username}님</Text>
        <Text style={h.subtitle}>오늘 날씨도 좋은데 자전거 타볼텨?</Text>
      </View>

      {/* Weather Card */}
      <View style={h.weatherCard}>
        {weather ? (
          <>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 12 }}>
              {weatherIconUri ? (
                <Image source={{ uri: weatherIconUri }} style={{ width: 40, height: 40 }} />
              ) : null}
              <Text style={h.weatherTemp}>{weather.temp}° {weather.condition}</Text>
            </View>
            <Text style={h.weatherLocation}>{weather.area}</Text>
          </>
        ) : (
          <Text style={h.weatherTemp}>날씨 정보 불러오는 중...</Text>
        )}
        <View style={h.weatherButton}>
          <Text style={h.weatherButtonText}>{formattedDate}</Text>
        </View>
      </View>

      {/* Nearby Section */}
      <View style={n.section}>
        <Text style={n.sectionTitle}>근처</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="네비게이션 열기">
          <Text style={n.sectionAction}>네비게이션 열기 →</Text>
        </TouchableOpacity>
      </View>

      {/* Nearby Cards */}
      <View style={{ marginTop: 12 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 180 }} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {stations.map((station) => (
              <View key={station.id} style={[n.nearbyCard, { width: 240, marginRight: 12 }]}>
                <Image source={{ uri: station.image }} style={n.nearbyImage} />
                <Text style={n.distance}>
                  {station.name} - <Text style={{ fontWeight: "bold" }}>{station.distance}</Text>
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </ScreenWrapper>
  );
}
