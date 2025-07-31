// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import { useAppContext } from '@/stores/AppContext';
import { authService } from '@/services';
import { Colors } from '@/constants/Colors';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { actions } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    
    try {
      const response = await authService.loginWithKakao();
      
      if (response.data) {
        // 사용자 정보 저장
        actions.setUser(response.data.user);
        
        console.log('카카오 로그인 성공:', response.data.user);
        
        // 메인 화면으로 이동
        navigation.navigate('Map' as never);
      } else {
        Alert.alert('로그인 실패', response.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('카카오 로그인 예외:', error);
      Alert.alert('로그인 오류', '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    // 게스트 로그인 (기본 사용자 정보 설정)
    actions.setUser({
      id: 'guest',
      name: '게스트',
      email: 'guest@ddudda.com',
      profileImage: '',
      provider: 'guest',
      preferences: {
        scenic_route: false,
        prioritize_safety: true,
        avoid_hills: false,
        preferred_speed: 'normal',
      },
    });
    
    navigation.navigate('Map' as never);
  };

  return (
    <ScreenWrapper backgroundColor={Colors.primary} paddingHorizontal={0}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        
        {/* 로고 영역 */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>뚜따</Text>
          </View>
          <Text style={styles.tagline}>대전의 자전거 여행을 시작하세요</Text>
        </View>

        {/* 로그인 버튼 영역 */}
        <View style={styles.loginContainer}>
          {/* 카카오 로그인 버튼 */}
          <TouchableOpacity 
            style={styles.kakaoButton}
            onPress={handleKakaoLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#3B1E1E" size="small" />
            ) : (
              <>
                <View style={styles.kakaoIcon}>
                  <Text style={styles.kakaoIconText}>K</Text>
                </View>
                <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
              </>
            )}
          </TouchableOpacity>

          {/* 게스트 로그인 버튼 */}
          <TouchableOpacity 
            style={styles.guestButton}
            onPress={handleGuestLogin}
            disabled={isLoading}
          >
            <Text style={styles.guestButtonText}>둘러보기</Text>
          </TouchableOpacity>
        </View>

        {/* 하단 안내 텍스트 */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            로그인하면 개인 맞춤 경로 추천과{'\n'}
            이용 기록을 확인할 수 있어요
          </Text>
        </View>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  logoContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  tagline: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  loginContainer: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  kakaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE500',
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  kakaoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B1E1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  kakaoIconText: {
    color: '#FEE500',
    fontSize: 16,
    fontWeight: 'bold',
  },
  kakaoButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B1E1E',
  },
  guestButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footerContainer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
