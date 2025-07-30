// src/screens/SearchScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { BackIcon, LocationIcon, DestinationIcon, MicIcon, BikeStationIcon, LandmarkIcon, PlaceIcon } from "@/components/ui/Icons";
import { useAppContext } from "@/stores/AppContext";
import { searchService, routeService } from "@/services";
import { SearchSuggestion } from "@/services/types";
import { Colors } from "@/constants/Colors";

interface LocationInput {
  location: string;
  address: string;
  lat?: number;
  lng?: number;
  name?: string;
}

export default function SearchScreen() {
  const navigation = useNavigation();
  const { state, actions } = useAppContext();
  const [currentLocation] = useState<LocationInput>({
    location: "현 위치",
    address: state.map.currentLocation?.address || "대전광역시 서구 둔산동"
  });
  const [destination, setDestination] = useState<LocationInput>({
    location: "",
    address: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const destinationInputRef = useRef<TextInput>(null);

  // 검색 제안 데이터 (실제로는 API에서 가져올 예정)
  const defaultSuggestions: SearchSuggestion[] = [
    {
      id: "1",
      name: "동성로",
      address: "대전광역시 중구 동성로",
      type: "landmark",
      lat: 36.3247,
      lng: 127.4206
    },
    {
      id: "2", 
      name: "동성로 하나로마트",
      address: "대전광역시 중구 동성로 123",
      type: "location",
      lat: 36.3250,
      lng: 127.4210
    },
    {
      id: "3",
      name: "동부 지방법원",
      address: "대전광역시 중구 대종로 396",
      type: "landmark",
      lat: 36.3289,
      lng: 127.4156
    },
    {
      id: "4",
      name: "동학산 입구",
      address: "대전광역시 중구 동학사길",
      type: "landmark",
      lat: 36.3456,
      lng: 127.4123
    }
  ];

  useEffect(() => {
    // 컴포넌트 마운트 시 목적지 입력창에 포커스
    setTimeout(() => {
      destinationInputRef.current?.focus();
    }, 300);
    
    // 기본 제안 목록 설정
    actions.setSearchSuggestions(defaultSuggestions);
  }, []);

  useEffect(() => {
    // 검색어 상태 업데이트
    actions.setSearchQuery(state.search.query);
  }, []);

  useEffect(() => {
    // 검색어에 따른 실시간 검색
    const searchWithAPI = async () => {
      if (state.search.query.trim() === "") {
        actions.setSearchSuggestions(defaultSuggestions);
        return;
      }

      setIsLoading(true);
      actions.setSearchQuery(state.search.query);

      try {
        const currentLat = state.map.currentLocation?.lat || 36.3504;
        const currentLng = state.map.currentLocation?.lng || 127.3845;
        
        const response = await searchService.getAutocompleteSuggestions(
          state.search.query,
          currentLat,
          currentLng
        );

        if (response.data) {
          actions.setSearchSuggestions(response.data);
        } else if (response.error) {
          console.error('검색 실패:', response.error);
          // 에러 시 기본 필터링으로 폴백
          const filtered = defaultSuggestions.filter(item =>
            item.name.toLowerCase().includes(state.search.query.toLowerCase()) ||
            item.address?.toLowerCase().includes(state.search.query.toLowerCase())
          );
          actions.setSearchSuggestions(filtered);
        }
      } catch (error) {
        console.error('검색 예외:', error);
        actions.setSearchSuggestions(defaultSuggestions);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchWithAPI, 300); // 300ms 디바운스
    return () => clearTimeout(timeoutId);
  }, [state.search.query]);

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    setDestination({
      location: suggestion.name,
      address: suggestion.address || "",
      lat: suggestion.lat,
      lng: suggestion.lng
    });
    
    actions.setSearchQuery(suggestion.name);
    actions.addRecentSearch(suggestion);
    
    // 선택된 위치를 지도 상태에 저장
    if (suggestion.lat && suggestion.lng) {
      actions.setSelectedLocation(
        suggestion.lat,
        suggestion.lng,
        suggestion.address,
        suggestion.name
      );
    }
    
    Keyboard.dismiss();
  };

  const handleSearchRoute = async () => {
    if (destination.location.trim() === "") {
      destinationInputRef.current?.focus();
      return;
    }

    if (!destination.lat || !destination.lng) {
      console.error("목적지 좌표가 없습니다.");
      return;
    }

    setIsLoading(true);
    actions.setSearchQuery("경로 검색 중...");

    try {
      // 출발지 좌표 (현재 위치 또는 기본값)
      const startLat = state.map.currentLocation?.lat || 36.3504;
      const startLng = state.map.currentLocation?.lng || 127.3845;

      // 경로 찾기 API 호출
      const routeResponse = await routeService.findRoute({
        start_lat: startLat,
        start_lng: startLng,
        end_lat: destination.lat,
        end_lng: destination.lng,
        preferences: state.user.preferences,
      });

      if (routeResponse.data) {
        // 경로 데이터를 상태에 저장
        actions.setRoute(routeResponse.data);
        
        console.log("경로 찾기 성공:", {
          distance: routeResponse.data.summary.distance,
          duration: routeResponse.data.summary.duration,
          points: routeResponse.data.route_points.length,
        });

        // 지도 화면으로 이동
        navigation.navigate("Map" as never);
      } else {
        console.error("경로 찾기 실패:", routeResponse.error);
        
        // 실패 시에도 선택된 위치는 지도에 표시
        actions.setSelectedLocation(
          destination.lat,
          destination.lng,
          destination.address,
          destination.location
        );
        
        navigation.navigate("Map" as never);
      }
    } catch (error) {
      console.error("경로 찾기 예외:", error);
      
      // 에러 시에도 지도로 이동 (선택된 위치만 표시)
      navigation.navigate("Map" as never);
    } finally {
      setIsLoading(false);
      actions.clearSearch();
    }
  };

  const handleCurrentLocationPress = () => {
    // TODO: 현재 위치 변경 기능
    console.log("현재 위치 변경");
  };

  const handleVoiceInput = () => {
    // TODO: 음성 인식 기능
    console.log("음성 인식 시작");
  };

  const getIconForSuggestion = (type: string) => {
    switch (type) {
      case 'station': 
        return <BikeStationIcon size={16} color="#5B913B" />;
      case 'landmark': 
        return <LandmarkIcon size={16} color="#666" />;
      default: 
        return <PlaceIcon size={16} color="#666" />;
    }
  };

  return (
    <ScreenWrapper backgroundColor={Colors.accent} paddingHorizontal={0}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.accent} />
        
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BackIcon size={24} color="#3B1E1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>검색</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* 검색 입력 영역 */}
        <View style={styles.searchInputContainer}>
          {/* 출발지 */}
          <TouchableOpacity 
            style={styles.locationInputRow}
            onPress={handleCurrentLocationPress}
          >
            <View style={styles.locationIcon}>
              <LocationIcon size={12} color="#5B913B" />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>{currentLocation.location}</Text>
              <Text style={styles.addressText}>{currentLocation.address}</Text>
            </View>
          </TouchableOpacity>

          {/* 구분선 */}
          <View style={styles.separator} />

          {/* 목적지 */}
          <View style={styles.locationInputRow}>
            <View style={styles.locationIcon}>
              <DestinationIcon size={16} color="#666" />
            </View>
            <View style={styles.locationInfo}>
              <TextInput
                ref={destinationInputRef}
                style={styles.destinationInput}
                placeholder="동"
                placeholderTextColor="#999"
                value={state.search.query}
                onChangeText={actions.setSearchQuery}
                returnKeyType="search"
                onSubmitEditing={handleSearchRoute}
              />
              {destination.address ? (
                <Text style={styles.addressText}>{destination.address}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* 검색 제안 목록 */}
        <ScrollView 
          style={styles.suggestionsContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>검색 중...</Text>
            </View>
          ) : (
            state.search.suggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion.id}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <View style={styles.suggestionIcon}>
                {getIconForSuggestion(suggestion.type)}
              </View>
              <View style={styles.suggestionInfo}>
                <Text style={styles.suggestionName}>{suggestion.name}</Text>
                {suggestion.address && (
                  <Text style={styles.suggestionAddress}>{suggestion.address}</Text>
                )}
              </View>
            </TouchableOpacity>
            ))
          )}
          
          {/* 빈 공간 (키보드 높이 고려) */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* 하단 버튼 영역 */}
        <View style={styles.bottomButtonContainer}>
          {/* 음성 인식 버튼 */}
          <TouchableOpacity 
            style={styles.voiceButton}
            onPress={handleVoiceInput}
          >
            <MicIcon size={20} color="#666" />
          </TouchableOpacity>
          
          {/* 경로 찾기 버튼 */}
          {destination.location.trim() !== "" && (
            <TouchableOpacity 
              style={styles.searchRouteButton}
              onPress={handleSearchRoute}
            >
              <Text style={styles.searchRouteText}>경로 찾기</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.accent,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  searchInputContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  locationIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  addressText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  destinationInput: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    padding: 0,
    margin: 0,
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginLeft: 44,
    marginVertical: 8,
  },
  suggestionsContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    marginTop: 16,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  suggestionIcon: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  suggestionAddress: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  bottomSpacer: {
    height: 120, // 키보드 높이 고려
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  bottomButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  searchRouteButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchRouteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});