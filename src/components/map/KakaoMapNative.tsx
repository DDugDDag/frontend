import React from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';

interface KakaoMapNativeProps {
  latitude?: number;
  longitude?: number;
  level?: number;
  style?: ViewStyle;
}

const KakaoMapViewNative =
  requireNativeComponent<KakaoMapNativeProps>('KakaoMapView');

const KakaoMapNative: React.FC<KakaoMapNativeProps> = ({
  latitude = 37.566826,
  longitude = 126.9786567,
  level = 3,
  style,
}) => {
  return (
    <KakaoMapViewNative
      latitude={latitude}
      longitude={longitude}
      level={level}
      style={style}
    />
  );
};

export default KakaoMapNative;
