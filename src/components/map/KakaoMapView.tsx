import React from 'react';
import { requireNativeComponent, ViewProps, StyleSheet, NativeSyntheticEvent } from 'react-native';

// 네이티브에서 넘어오는 이벤트 데이터 타입을 정의합니다.
interface StationSelectEvent {
  stationId: string;
}
interface MapClickEvent {
  lat: number;
  lng: number;
}


// 네이티브 컴포넌트에 전달할 props 타입을 정의합니다.
interface KakaoMapViewProps extends ViewProps {
  stationList?: any[]; // stationList prop을 추가합니다 (실제 Station 타입 사용 권장)
  onStationSelect?: (event: NativeSyntheticEvent<StationSelectEvent>) => void;
  onMapClick?: (event: NativeSyntheticEvent<MapClickEvent>) => void;
}

const RCKakaoMapView = requireNativeComponent<KakaoMapViewProps>('KakaoMapView');

const KakaoMapView: React.FC<KakaoMapViewProps> = (props) => {
  return <RCKakaoMapView style={styles.map} {...props} />;
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default KakaoMapView;