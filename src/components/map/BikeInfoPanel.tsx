// src/components/map/BikeInfoPanel.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useAppContext } from '@/stores/AppContext';
import { BikeStationIcon, LocationIcon } from '@/components/ui/Icons';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface BikeInfoPanelProps {
  visible: boolean;
  onOpenTashuApp?: () => void;
}

export default function BikeInfoPanel({ visible, onOpenTashuApp }: BikeInfoPanelProps) {
  const { state } = useAppContext();
  const selectedStation = state.stations.selectedStation;

  if (!visible || !selectedStation) {
    return null;
  }

  // 거리 계산 (현재 위치와 선택된 대여소 사이)
  const calculateDistance = (): string => {
    if (state.map.currentLocation) {
      const { lat: currentLat, lng: currentLng } = state.map.currentLocation;
      const { lat: stationLat, lng: stationLng } = selectedStation;
      
      // 하버사인 공식으로 거리 계산
      const R = 6371000; // 지구 반지름 (미터)
      const dLat = (stationLat - currentLat) * Math.PI / 180;
      const dLng = (stationLng - currentLng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(currentLat * Math.PI / 180) * Math.cos(stationLat * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return distance < 1000 ? `${Math.round(distance)}m` : `${(distance/1000).toFixed(1)}km`;
    }
    return '계산 중...';
  };

  const handleOpenTashuApp = () => {
    console.log('타슈 앱 열기');
    if (onOpenTashuApp) {
      onOpenTashuApp();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        {/* 상단 핸들 */}
        <View style={styles.handle} />
        
        {/* 대여소 정보 */}
        <View style={styles.stationInfo}>
          <View style={styles.stationHeader}>
            <BikeStationIcon size={24} color={Colors.primary} />
            <Text style={styles.stationName}>{selectedStation.name}</Text>
          </View>
          
          <View style={styles.bikeInfo}>
            <View style={styles.bikeCount}>
              <Text style={styles.bikeCountText}>
                타슈 {selectedStation.available_bikes}대 발견했슈
              </Text>
            </View>
            
            <View style={styles.distanceInfo}>
              <LocationIcon size={16} color="#666" />
              <Text style={styles.distanceText}>
                걸어갈 거리 {calculateDistance()}
              </Text>
            </View>
          </View>
          
          {/* 자전거 일러스트 영역 */}
          <View style={styles.bikeIllustration}>
            <View style={styles.bikeIcon}>
              <Text style={styles.bikeEmoji}>🚲</Text>
            </View>
            <View style={styles.availabilityBar}>
              <View 
                style={[
                  styles.availabilityFill, 
                  { 
                    width: `${Math.min((selectedStation.available_bikes / 30) * 100, 100)}%`,
                    backgroundColor: selectedStation.available_bikes > 5 ? Colors.primary : '#FF6B6B'
                  }
                ]} 
              />
            </View>
            <Text style={styles.availabilityText}>
              {selectedStation.available_bikes > 0 ? '대여 가능' : '대여 불가'}
            </Text>
          </View>
          
          {/* 액션 버튼 */}
          <TouchableOpacity 
            style={styles.tashuButton} 
            onPress={handleOpenTashuApp}
          >
            <Text style={styles.tashuButtonText}>타슈 앱 열기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60, // 하단 네비게이션 위에 위치
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  panel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  stationInfo: {
    paddingHorizontal: 20,
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 8,
  },
  bikeInfo: {
    marginBottom: 16,
  },
  bikeCount: {
    marginBottom: 8,
  },
  bikeCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  bikeIllustration: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  bikeIcon: {
    marginBottom: 8,
  },
  bikeEmoji: {
    fontSize: 48,
  },
  availabilityBar: {
    width: width * 0.6,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  availabilityFill: {
    height: '100%',
    borderRadius: 3,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  tashuButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tashuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});