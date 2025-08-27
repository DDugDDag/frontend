// src/screens/HomeScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import { homeHeaderStyles as h } from '@/styles/user';
import { nearbyStyles as n } from '@/styles/nearby';
import { getCurrentPosition } from '@/utils/location'; // ← expo-location 대체 래퍼
import axios from 'axios';
import Config from 'react-native-config'; // ← .env 읽기

const { WEATHER_API_KEY, BACKEND_API_URL } = Config;

const today = new Date();
const formattedDate = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
  weekday: 'long',
}).format(today);

type Weather = {
  temp: number;
  condition: string;
  area: string;
  icon: string;
};

type Station = {
  id: string;
  name: string;
  distance: string;
  image: string;
};

const nearbyStations: Station[] = [
  { id: '1', name: '둔산대여소', distance: '1.2 km', image: '1.jpg' },
  { id: '2', name: '시청역 앞', distance: '0.8 km', image: '2.jpg' },
  { id: '3', name: '한밭도서관', distance: '1.8 km', image: '3.jpg' },
];

const API_HOST = BACKEND_API_URL || 'http://localhost:8080';
const username = '홍길동';

export default function HomeScreen() {
  // expo-location의 타입 대신 우리가 쓰는 최소 타입으로 정의
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // 권한 + 현재 위치 (react-native-geolocation-service + react-native-permissions 사용)
        const pos = await getCurrentPosition();
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });

        // ✅ 날씨 API 요청
        const weatherRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=kr`,
        );

        const w = weatherRes.data;
        setWeather({
          temp: Math.round(w.main.temp),
          condition: w.weather?.[0]?.description ?? '',
          area: w.name,
          icon: w.weather?.[0]?.icon ?? '',
        });

        // ✅ 정류소 추천 요청
        const stationRes = await axios.post(`${API_HOST}/nearby`, {
          lat: latitude,
          lon: longitude,
        });

        setStations(stationRes.data);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
        setStations(nearbyStations); // 예외 시 기본 데이터로 대체
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <ScreenWrapper scrollable backgroundColor="#FFCF50">
      {/* Header */}
      <View style={h.header}>
        <Image source={{ uri: 'https://example.com/profile.jpg' }} style={h.profileImage} />
        <Text style={h.userName}>{username}님</Text>
        <Text style={h.subtitle}>오늘 날씨도 좋은데 자전거 타볼텨?</Text>
      </View>

      {/* Weather Card */}
      <View style={h.weatherCard}>
        {weather ? (
          <>
            <Text style={h.weatherTemp}>
              {weather.icon} {weather.temp}° {weather.condition}
            </Text>
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
        <TouchableOpacity>
          <Text style={n.sectionAction}>네비게이션 열기 →</Text>
        </TouchableOpacity>
      </View>

      {/* Nearby Cards */}
      <View style={{ marginTop: 12 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ height: 180 }}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {stations.map((station) => (
              <View key={station.id} style={[n.nearbyCard, { width: 240, marginRight: 12 }]}>
                <Image source={{ uri: station.image }} style={n.nearbyImage} />
                <Text style={n.distance}>
                  {station.name} - <Text style={{ fontWeight: 'bold' }}>{station.distance}</Text>
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </ScreenWrapper>
  );
}
