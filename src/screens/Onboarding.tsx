import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { Colors } from "@/constants/Colors";
import type { ICarouselInstance } from "react-native-reanimated-carousel";

type PanProps = { activeOffsetX: [number, number] };

const slides = [
  {
    key: "1",
    title: "위치",
    description: "위치 기반 실시간 여행",
    image: require("@/assets/images/onboarding/onboarding1.png"),
  },
  {
    key: "2",
    title: "대여",
    description: "로컬 공공자전거 대여 연계",
    image: require("@/assets/images/onboarding/onboarding2.png"),
  },
  {
    key: "3",
    title: "여행",
    description: "기억에 남는 자전거 여행",
    image: require("@/assets/images/onboarding/onboarding3.png"),
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<ICarouselInstance>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      carouselRef.current?.next();
    }
  };

  const handleSkip = () => navigation.navigate("Login" as never);
  const handleStart = () => navigation.navigate("Login" as never);

  const getPanProps = (): PanProps | {} => {
    if (Platform.OS === "web") return {}; // Web에서는 제한 적용 X

    if (currentIndex === 0) return { activeOffsetX: [-10, 9999] }; // 첫 슬라이드: 왼쪽 스와이프 막기
    if (currentIndex === slides.length - 1) return { activeOffsetX: [-9999, 10] }; // 마지막: 오른쪽 스와이프 막기
    return {}; // 중간: 제한 없음
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background} paddingHorizontal={0}>
      <View style={{ flex: 1 }}>
        <Carousel
          ref={carouselRef}
          width={width}
          height={height}
          data={slides}
          onProgressChange={(_, absoluteProgress) => {
            const index = Math.round(absoluteProgress);
            if (index !== currentIndex) {
              setCurrentIndex(index);
            }
          }}
          scrollAnimationDuration={500}
          panGestureHandlerProps={getPanProps()}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width, height }]}>
              <Image
                source={item.image}
                style={[
                  styles.image,
                  {
                    width: width * 0.7,
                    height: width * 0.7,
                  },
                ]}
              />
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}
        />

        {/* 페이지 표시 점 */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>

        {/* 하단 버튼 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>

          {currentIndex === slides.length - 1 ? (
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startText}>시작하기</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleNext}>
              <Text style={styles.next}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: Colors.background,
  },
  image: {
    resizeMode: "contain",
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3C1E1E",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 50,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  dot: {
    backgroundColor: "#ccc",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.primary,
  },
  buttonRow: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    alignSelf: "center",
  },
  skip: {
    color: Colors.primary,
    fontWeight: "bold",
    fontSize: 16,
  },
  next: {
    color: Colors.primary,
    fontWeight: "bold",
    fontSize: 16,
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
