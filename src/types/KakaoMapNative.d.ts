import { ViewStyle } from 'react-native';

export interface KakaoMapNativeProps {
  latitude?: number;
  longitude?: number;
  level?: number;
  style?: ViewStyle;
}

export const KakaoMapNative: React.ComponentType<KakaoMapNativeProps>;
