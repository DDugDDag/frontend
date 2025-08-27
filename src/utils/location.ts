// src/utils/location.ts
import Geolocation from 'react-native-geolocation-service';
import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';

// 최소 필요한 타입만 선언 (TS 에러 해결용)
export type GeolocationOptions = {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number;
  forceRequestLocation?: boolean;
  showLocationDialog?: boolean;
};

export type GeolocationResponse = {
  coords: {
    latitude: number;
    longitude: number;
    altitude?: number | null;
    accuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
  };
  timestamp: number;
};

async function ensurePermission(): Promise<boolean> {
  const perm =
    Platform.OS === 'android'
      ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

  const status = await check(perm);
  if (status === RESULTS.GRANTED) return true;

  const asked = await request(perm);
  if (asked === RESULTS.GRANTED) return true;

  // 사용자가 영구 거부한 경우 설정으로 유도 (선택)
  if (asked === RESULTS.BLOCKED) {
    try { await openSettings(); } catch {}
  }
  return false;
}

export async function getCurrentPosition(
  options: GeolocationOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
): Promise<GeolocationResponse> {
  const ok = await ensurePermission();
  if (!ok) throw new Error('Location permission denied');

  return new Promise<GeolocationResponse>((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (pos) => resolve(pos as unknown as GeolocationResponse),
      (err) => reject(err),
      options
    );
  });
}
