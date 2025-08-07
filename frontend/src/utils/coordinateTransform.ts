// src/utils/coordinateTransform.ts - Coordinate transformation utilities for Kakao Maps
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface PixelPosition {
  x: number;
  y: number;
}

export interface CameraState {
  lat: number;
  lng: number;
  zoomLevel: number;
}

export class CoordinateTransform {
  private static readonly EARTH_RADIUS = 6378137; // 지구 반지름 (미터)
  private static readonly INITIAL_RESOLUTION = 2 * Math.PI * CoordinateTransform.EARTH_RADIUS / 256; // 초기 해상도

  /**
   * GPS 좌표를 픽셀 좌표로 변환
   */
  static coordinateToPixel(
    coordinate: Coordinate,
    camera: CameraState,
    mapWidth: number = screenWidth,
    mapHeight: number = screenHeight
  ): PixelPosition {
    const zoomFactor = Math.pow(2, camera.zoomLevel - 1);
    const resolution = CoordinateTransform.INITIAL_RESOLUTION / zoomFactor;
    
    // 카메라 중심점을 픽셀 좌표로 변환
    const cameraMercatorX = CoordinateTransform.lngToMercatorX(camera.lng);
    const cameraMercatorY = CoordinateTransform.latToMercatorY(camera.lat);
    
    // 대상 좌표를 픽셀 좌표로 변환
    const targetMercatorX = CoordinateTransform.lngToMercatorX(coordinate.lng);
    const targetMercatorY = CoordinateTransform.latToMercatorY(coordinate.lat);
    
    // 픽셀 차이 계산
    const deltaX = (targetMercatorX - cameraMercatorX) / resolution;
    const deltaY = (targetMercatorY - cameraMercatorY) / resolution;
    
    // 화면 중심을 기준으로 픽셀 좌표 계산
    const pixelX = mapWidth / 2 + deltaX;
    const pixelY = mapHeight / 2 - deltaY; // Y축은 반대로
    
    return { x: pixelX, y: pixelY };
  }

  /**
   * 픽셀 좌표를 GPS 좌표로 변환
   */
  static pixelToCoordinate(
    pixel: PixelPosition,
    camera: CameraState,
    mapWidth: number = screenWidth,
    mapHeight: number = screenHeight
  ): Coordinate {
    const zoomFactor = Math.pow(2, camera.zoomLevel - 1);
    const resolution = CoordinateTransform.INITIAL_RESOLUTION / zoomFactor;
    
    // 카메라 중심점을 메르카토르 좌표로 변환
    const cameraMercatorX = CoordinateTransform.lngToMercatorX(camera.lng);
    const cameraMercatorY = CoordinateTransform.latToMercatorY(camera.lat);
    
    // 픽셀 차이를 메르카토르 차이로 변환
    const deltaX = (pixel.x - mapWidth / 2) * resolution;
    const deltaY = (mapHeight / 2 - pixel.y) * resolution; // Y축은 반대로
    
    // 대상 메르카토르 좌표 계산
    const targetMercatorX = cameraMercatorX + deltaX;
    const targetMercatorY = cameraMercatorY + deltaY;
    
    // 메르카토르 좌표를 GPS 좌표로 변환
    const lng = CoordinateTransform.mercatorXToLng(targetMercatorX);
    const lat = CoordinateTransform.mercatorYToLat(targetMercatorY);
    
    return { lat, lng };
  }

  /**
   * 경도를 메르카토르 X 좌표로 변환
   */
  private static lngToMercatorX(lng: number): number {
    return lng * (Math.PI / 180) * CoordinateTransform.EARTH_RADIUS;
  }

  /**
   * 위도를 메르카토르 Y 좌표로 변환
   */
  private static latToMercatorY(lat: number): number {
    const latRad = lat * (Math.PI / 180);
    return Math.log(Math.tan(Math.PI / 4 + latRad / 2)) * CoordinateTransform.EARTH_RADIUS;
  }

  /**
   * 메르카토르 X 좌표를 경도로 변환
   */
  private static mercatorXToLng(x: number): number {
    return (x / CoordinateTransform.EARTH_RADIUS) * (180 / Math.PI);
  }

  /**
   * 메르카토르 Y 좌표를 위도로 변환
   */
  private static mercatorYToLat(y: number): number {
    const latRad = 2 * Math.atan(Math.exp(y / CoordinateTransform.EARTH_RADIUS)) - Math.PI / 2;
    return latRad * (180 / Math.PI);
  }

  /**
   * 두 GPS 좌표 간의 거리 계산 (하버사인 공식)
   */
  static calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
    const R = 6371000; // 지구 반지름 (미터)
    const lat1Rad = coord1.lat * (Math.PI / 180);
    const lat2Rad = coord2.lat * (Math.PI / 180);
    const deltaLatRad = (coord2.lat - coord1.lat) * (Math.PI / 180);
    const deltaLngRad = (coord2.lng - coord1.lng) * (Math.PI / 180);

    const a = 
      Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
      Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 거리 (미터)
  }

  /**
   * 좌표가 화면 영역 내에 있는지 확인
   */
  static isCoordinateInViewport(
    coordinate: Coordinate,
    camera: CameraState,
    mapWidth: number = screenWidth,
    mapHeight: number = screenHeight,
    margin: number = 100
  ): boolean {
    const pixel = CoordinateTransform.coordinateToPixel(coordinate, camera, mapWidth, mapHeight);
    return (
      pixel.x >= -margin && 
      pixel.x <= mapWidth + margin && 
      pixel.y >= -margin && 
      pixel.y <= mapHeight + margin
    );
  }

  /**
   * 줌 레벨에 따른 적절한 마커 크기 계산
   */
  static calculateMarkerSize(baseSize: number, zoomLevel: number): number {
    const scaleFactor = Math.min(Math.max(zoomLevel / 8, 0.5), 2.0);
    return Math.round(baseSize * scaleFactor);
  }

  /**
   * 카메라 상태로부터 표시할 좌표 범위 계산
   */
  static getViewportBounds(
    camera: CameraState,
    mapWidth: number = screenWidth,
    mapHeight: number = screenHeight
  ): { 
    northEast: Coordinate, 
    southWest: Coordinate 
  } {
    const northEast = CoordinateTransform.pixelToCoordinate(
      { x: mapWidth, y: 0 }, 
      camera, 
      mapWidth, 
      mapHeight
    );
    const southWest = CoordinateTransform.pixelToCoordinate(
      { x: 0, y: mapHeight }, 
      camera, 
      mapWidth, 
      mapHeight
    );
    
    return { northEast, southWest };
  }
}