// src/components/map/SmartRoutePanel.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useAppContext } from '@/stores/AppContext';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface SmartRoutePanelProps {
  visible: boolean;
  onStartNavigation?: () => void;
}

export default function SmartRoutePanel({ visible, onStartNavigation }: SmartRoutePanelProps) {
  const { state } = useAppContext();
  const currentRoute = state.map.currentRoute;

  if (!visible || !currentRoute) {
    return null;
  }

  const routeMode = currentRoute.summary?.mode || 'bike';
  const totalDuration = currentRoute.summary?.duration || 15;
  const totalDistance = currentRoute.summary?.distance || 2.5;

  const handleStartNavigation = () => {
    console.log('내비게이션 시작');
    if (onStartNavigation) {
      onStartNavigation();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        {/* 모드 선택 탭 (표시용) */}
        <View style={styles.modeSelector}>
          <View style={[
            styles.modeTab,
            routeMode === 'bike' && styles.modeTabActive
          ]}>
            <Text style={[
              styles.modeTabText,
              routeMode === 'bike' && styles.modeTabTextActive
            ]}>
              따릉
            </Text>
          </View>
          <View style={[
            styles.modeTab,
            routeMode === 'walk' && styles.modeTabActive
          ]}>
            <Text style={[
              styles.modeTabText,
              routeMode === 'walk' && styles.modeTabTextActive
            ]}>
              뚜벅
            </Text>
          </View>
        </View>

        {/* 경로 정보 */}
        <View style={styles.routeInfo}>
          <View style={styles.navigationIcon}>
            <Text style={styles.navigationEmoji}>🧭</Text>
            <Text style={styles.navigationText}>내비게이션 시작</Text>
          </View>
          
          <View style={styles.routeDetails}>
            <Text style={styles.routeModeTitle}>
              {routeMode === 'bike' ? '따릉 모드' : '뚜벅 모드'}
            </Text>
            <Text style={styles.routeTime}>
              총 이동시간 <Text style={styles.routeTimeValue}>{totalDuration}분</Text>
            </Text>
          </View>
        </View>

        {/* 자전거/캐릭터 일러스트 */}
        <View style={styles.illustrationContainer}>
          {routeMode === 'bike' ? (
            <View style={styles.bikeIllustration}>
              <Text style={styles.bikeEmoji}>🚲</Text>
            </View>
          ) : (
            <View style={styles.walkIllustration}>
              <Text style={styles.walkEmoji}>🚶‍♂️</Text>
            </View>
          )}
        </View>

        {/* 타슈 앱 열기 버튼 */}
        <TouchableOpacity 
          style={styles.startButton} 
          onPress={handleStartNavigation}
        >
          <Text style={styles.startButtonText}>타슈 앱 열기</Text>
        </TouchableOpacity>
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
    backgroundColor: '#FFCF50',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 25,
    padding: 4,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: Colors.primary,
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modeTabTextActive: {
    color: '#fff',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  navigationIcon: {
    alignItems: 'center',
    marginRight: 16,
  },
  navigationEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  navigationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B1E1E',
  },
  routeDetails: {
    flex: 1,
  },
  routeModeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B1E1E',
    marginBottom: 4,
  },
  routeTime: {
    fontSize: 14,
    color: '#3B1E1E',
  },
  routeTimeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B1E1E',
  },
  illustrationContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  bikeIllustration: {
    padding: 8,
  },
  bikeEmoji: {
    fontSize: 48,
  },
  walkIllustration: {
    padding: 8,
  },
  walkEmoji: {
    fontSize: 48,
  },
  startButton: {
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
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});