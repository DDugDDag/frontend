// screens/HomeScreen.tsx
import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { homeHeaderStyles as h } from '@/styles/user'; // 사실 여기엔 user만 들어있지 않음... 수정해야 됨.
import { nearbyStyles as n } from '@/styles/nearby';
import * as Location from 'expo-location';
import axios from 'axios';


// 임시 데이터 (나중에 API로 대체 필요)
const nearbyStations = [
  {
    id: '1',
    name: '둔산대여소',
    distance: '1.2 km',
    image: '1.jpg',
  },
  {
    id: '2',
    name: '시청역 앞',
    distance: '0.8 km',
    image: '2.jpg',
  },
  {
    id: '3',
    name: '한밭도서관',
    distance: '1.8 km',
    image: '3.jpg',
  },
];

// 날씨정보 및 gps는 프론트 백 중 어디서 처리할 지 정했었던 것 같지 않아 일단 더미데이터

export default function HomeScreen() {
  return (
    <ScreenWrapper scrollable backgroundColor="#FFCF50">
      {/* Header */}
      <View style={h.header}>
        <Image
          source={{ uri: 'https://example.com/profile.jpg' }}
          style={h.profileImage}
        />
        <Text style={h.userName}>홍길동 님</Text>
        <Text style={h.subtitle}>오늘 날씨도 좋은데 자전거 타볼터?</Text>
      </View>

      {/* Weather Card */}
      <View style={h.weatherCard}>
        <Text style={h.weatherTemp}>🌤️ 18° 흐림</Text>
        <Text style={h.weatherLocation}>둔산동</Text>
        <TouchableOpacity style={h.weatherButton}>
          <Text style={h.weatherButtonText}>9월 24일 수요일</Text>
        </TouchableOpacity>
      </View>

      {/* Nearby Section */}
      <View style={n.section}>
        <Text style={n.sectionTitle}>근처</Text>
        <TouchableOpacity>
          <Text style={n.sectionAction}>네비게이션 열기 →</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Scroll Nearby Cards */}
      <View style={{ marginTop: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ height: 180 }} // 카드 높이 맞춤
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {nearbyStations.map((station) => (
            <View
              key={station.id}
              style={[n.nearbyCard, { width: 240, marginRight: 12 }]}
            >
              <Image source={{ uri: station.image }} style={n.nearbyImage} />
              <Text style={n.distance}>
                {station.name} -{' '}
                <Text style={{ fontWeight: 'bold' }}>{station.distance}</Text>
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}
