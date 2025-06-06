import logging
import asyncio
from typing import List, Dict, Any, Optional

from app.api.external import TashuAPI
from app.api.ai_integration import AIRouteOptimizer, AIRouteRequest, AIRouteResponse
from app.api.utils import calculate_distance, validate_coordinates, DataFormatException

logger = logging.getLogger(__name__)

class RouteFinder:
    """자전거 경로 찾기 클래스 - AI 모델 연동"""
    
    def __init__(self):
        self.tashu_api = TashuAPI()
        self.ai_optimizer = AIRouteOptimizer()
        logger.info("경로 찾기 모듈 초기화 완료")
    
    async def find_path_async(self, start_lat: float, start_lng: float, end_lat: float, end_lng: float, 
                        preferences: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        비동기적으로 출발지와 목적지 사이의 최적 자전거 경로를 찾는 함수
        AI 모델을 사용하여 경로를 최적화합니다.
        """
        logger.info(f"경로 찾기 요청: ({start_lat}, {start_lng}) -> ({end_lat}, {end_lng})")
        
        try:
            # AI 모델 요청 객체 생성
            ai_request = AIRouteRequest(start_lat, start_lng, end_lat, end_lng, preferences)
            
            # AI 모델을 사용하여 최적 경로 찾기
            ai_response = await self.ai_optimizer.find_optimal_route(ai_request)
            
            # 주변 자전거 대여소 정보 추가
            nearby_stations = await self._get_nearby_stations_async(start_lat, start_lng, end_lat, end_lng)
            
            # 턴바이턴 안내 생성
            instructions = self._generate_turn_by_turn_instructions(ai_response.coordinates, nearby_stations)
            
            # 최종 응답 구성
            response = {
                "route_id": None,  # 추후 경로 저장 기능 구현 시 사용
                "summary": {
                    "distance": ai_response.total_distance,
                    "duration": ai_response.estimated_duration,
                    "elevation_gain": ai_response.elevation_gain,
                    "safety_score": ai_response.safety_score,
                    "confidence_score": ai_response.confidence_score,
                    "algorithm_version": ai_response.algorithm_version,
                    "bike_stations": len(nearby_stations)
                },
                "route_points": ai_response.coordinates,
                "instructions": instructions,
                "nearby_stations": nearby_stations,
                "metadata": {
                    "generated_at": ai_request.timestamp,
                    "preferences": preferences or {},
                    "process_time": ai_response.process_time
                }
            }
            
            logger.info(f"경로 찾기 완료: {ai_response.total_distance}km, {ai_response.estimated_duration}분")
            return response
            
        except DataFormatException as e:
            logger.error(f"입력 데이터 오류: {e}")
            raise
        except Exception as e:
            logger.error(f"경로 찾기 중 오류: {e}")
            # 심각한 오류 시 기본 경로 반환
            return await self._generate_fallback_route(start_lat, start_lng, end_lat, end_lng)
    
    def find_path(self, start_lat: float, start_lng: float, end_lat: float, end_lng: float, 
                  preferences: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        동기적 경로 찾기 함수 (기존 API 호환성을 위해 유지)
        내부적으로 비동기 함수를 호출합니다.
        """
        logger.info("동기 경로 찾기 요청 -> 비동기 처리로 변환")
        
        try:
            # 새로운 이벤트 루프에서 비동기 함수 실행
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                return loop.run_until_complete(
                    self.find_path_async(start_lat, start_lng, end_lat, end_lng, preferences)
                )
            finally:
                loop.close()
        except Exception as e:
            logger.error(f"동기 경로 찾기 중 오류: {e}")
            # 이벤트 루프 오류 시 기본 동기 경로 반환
            return self._generate_basic_route(start_lat, start_lng, end_lat, end_lng)
    
    async def _get_nearby_stations_async(self, start_lat: float, start_lng: float, 
                                   end_lat: float, end_lng: float) -> List[Dict[str, Any]]:
        """비동기적으로 출발지와 목적지 근처의 자전거 대여소를 찾는 함수"""
        logger.info("주변 자전거 대여소 검색")
        
        try:
            # 자전거 대여소 정보 조회
            stations = self.tashu_api.get_stations()
            
            # 각 대여소의 거리 계산
            for station in stations:
                station["distance_from_start"] = calculate_distance(
                    start_lat, start_lng, station["lat"], station["lng"]
                )
                station["distance_from_end"] = calculate_distance(
                    end_lat, end_lng, station["lat"], station["lng"]
                )
            
            # 출발지와 목적지에서 가까운 대여소 선택
            start_stations = sorted(stations, key=lambda x: x["distance_from_start"])[:3]
            end_stations = sorted(stations, key=lambda x: x["distance_from_end"])[:3]
            
            # 중복 제거 및 위치 정보 추가
            all_stations = []
            seen_ids = set()
            
            for station in start_stations:
                if station["station_id"] not in seen_ids:
                    station["location_type"] = "start"
                    station["location_description"] = "출발지 근처"
                    all_stations.append(station)
                    seen_ids.add(station["station_id"])
            
            for station in end_stations:
                if station["station_id"] not in seen_ids:
                    station["location_type"] = "end"
                    station["location_description"] = "목적지 근처"
                    all_stations.append(station)
                    seen_ids.add(station["station_id"])
            
            logger.info(f"주변 대여소 {len(all_stations)}개 검색 완료")
            return all_stations
            
        except Exception as e:
            logger.error(f"주변 대여소 검색 중 오류: {e}")
            return []
    
    def _generate_turn_by_turn_instructions(self, route_points: List[Dict[str, float]], 
                                          nearby_stations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """턴바이턴 안내 지시사항 생성"""
        logger.info("턴바이턴 안내 생성")
        
        instructions = []
        
        if not route_points or len(route_points) < 2:
            return instructions
        
        # 출발 안내
        instructions.append({
            "step": 1,
            "type": "start",
            "description": "출발지에서 자전거 경로를 시작합니다.",
            "distance": 0,
            "duration": 0,
            "coordinate": route_points[0]
        })
        
        # 출발지 근처 대여소 안내
        start_stations = [s for s in nearby_stations if s.get("location_type") == "start"]
        for i, station in enumerate(start_stations):
            instructions.append({
                "step": len(instructions) + 1,
                "type": "bike_station",
                "description": f"{station['name']} 대여소에서 자전거를 대여할 수 있습니다. "
                             f"현재 {station['available_bikes']}대 이용 가능",
                "distance": round(station["distance_from_start"], 2),
                "duration": max(1, int(station["distance_from_start"] / 5 * 60)),  # 5km/h 도보 속도
                "coordinate": {"lat": station["lat"], "lng": station["lng"]},
                "station_info": {
                    "station_id": station["station_id"],
                    "available_bikes": station["available_bikes"],
                    "total_docks": station["total_docks"]
                }
            })
        
        # 중간 경로 안내 생성
        total_distance = sum(
            calculate_distance(route_points[i]["lat"], route_points[i]["lng"], 
                             route_points[i+1]["lat"], route_points[i+1]["lng"])
            for i in range(len(route_points) - 1)
        )
        
        # 주요 구간별 안내
        if len(route_points) > 4:
            quarter_point = len(route_points) // 4
            half_point = len(route_points) // 2
            three_quarter_point = len(route_points) * 3 // 4
            
            key_points = [
                (quarter_point, "1/4 지점"),
                (half_point, "중간 지점"),
                (three_quarter_point, "3/4 지점")
            ]
            
            for point_idx, description in key_points:
                if point_idx < len(route_points):
                    segment_distance = sum(
                        calculate_distance(route_points[i]["lat"], route_points[i]["lng"], 
                                         route_points[i+1]["lat"], route_points[i+1]["lng"])
                        for i in range(point_idx)
                    )
                    
                    instructions.append({
                        "step": len(instructions) + 1,
                        "type": "waypoint",
                        "description": f"{description}에 도달했습니다. 계속 직진하세요.",
                        "distance": round(segment_distance, 2),
                        "duration": max(1, int(segment_distance / 15 * 60)),
                        "coordinate": route_points[point_idx]
                    })
        
        # 목적지 근처 대여소 안내
        end_stations = [s for s in nearby_stations if s.get("location_type") == "end"]
        for station in end_stations:
            instructions.append({
                "step": len(instructions) + 1,
                "type": "bike_station",
                "description": f"목적지 근처 {station['name']} 대여소에서 자전거를 반납할 수 있습니다.",
                "distance": round(total_distance - station["distance_from_end"], 2),
                "duration": max(1, int((total_distance - station["distance_from_end"]) / 15 * 60)),
                "coordinate": {"lat": station["lat"], "lng": station["lng"]},
                "station_info": {
                    "station_id": station["station_id"],
                    "available_docks": station.get("total_docks", 0) - station.get("available_bikes", 0),
                    "total_docks": station["total_docks"]
                }
            })
        
        # 도착 안내
        instructions.append({
            "step": len(instructions) + 1,
            "type": "arrival",
            "description": "목적지에 도착했습니다.",
            "distance": round(total_distance, 2),
            "duration": max(1, int(total_distance / 15 * 60)),
            "coordinate": route_points[-1]
        })
        
        logger.info(f"턴바이턴 안내 {len(instructions)}개 생성 완료")
        return instructions
    
    async def _generate_fallback_route(self, start_lat: float, start_lng: float, 
                                 end_lat: float, end_lng: float) -> Dict[str, Any]:
        """AI 모델 실패 시 기본 경로 생성"""
        logger.warning("기본 경로 생성 모드")
        
        distance = calculate_distance(start_lat, start_lng, end_lat, end_lng)
        duration = max(int(distance / 15 * 60), 5)
        
        # 간단한 직선 경로
        num_points = max(3, int(distance * 2))
        route_points = []
        
        for i in range(num_points + 1):
            ratio = i / num_points
            lat = start_lat + (end_lat - start_lat) * ratio
            lng = start_lng + (end_lng - start_lng) * ratio
            route_points.append({"lat": lat, "lng": lng})
        
        return {
            "route_id": None,
            "summary": {
                "distance": round(distance, 2),
                "duration": duration,
                "elevation_gain": 0,
                "safety_score": 0.5,
                "confidence_score": 0.3,
                "algorithm_version": "fallback_basic",
                "bike_stations": 0
            },
            "route_points": route_points,
            "instructions": [
                {
                    "step": 1,
                    "type": "start",
                    "description": "출발지에서 목적지로 직진하세요.",
                    "distance": 0,
                    "duration": 0,
                    "coordinate": route_points[0]
                },
                {
                    "step": 2,
                    "type": "arrival",
                    "description": "목적지에 도착했습니다.",
                    "distance": round(distance, 2),
                    "duration": duration,
                    "coordinate": route_points[-1]
                }
            ],
            "nearby_stations": [],
            "metadata": {
                "generated_at": "fallback",
                "preferences": {},
                "process_time": 0.1
            }
        }
    
    def _generate_basic_route(self, start_lat: float, start_lng: float, 
                            end_lat: float, end_lng: float) -> Dict[str, Any]:
        """동기적 기본 경로 생성 (이벤트 루프 없이)"""
        logger.warning("기본 동기 경로 생성")
        
        distance = calculate_distance(start_lat, start_lng, end_lat, end_lng)
        duration = max(int(distance / 15 * 60), 5)
        
        route_points = [
            {"lat": start_lat, "lng": start_lng},
            {"lat": end_lat, "lng": end_lng}
        ]
        
        return {
            "route_id": None,
            "summary": {
                "distance": round(distance, 2),
                "duration": duration,
                "elevation_gain": 0,
                "safety_score": 0.5,
                "confidence_score": 0.2,
                "algorithm_version": "basic_sync",
                "bike_stations": 0
            },
            "route_points": route_points,
            "instructions": [
                {
                    "step": 1,
                    "type": "start",
                    "description": "출발지에서 목적지로 이동하세요.",
                    "distance": 0,
                    "duration": 0,
                    "coordinate": route_points[0]
                },
                {
                    "step": 2,
                    "type": "arrival",
                    "description": "목적지에 도착했습니다.",
                    "distance": round(distance, 2),
                    "duration": duration,
                    "coordinate": route_points[-1]
                }
            ],
            "nearby_stations": [],
            "metadata": {
                "generated_at": "basic_sync",
                "preferences": {},
                "process_time": 0.05
            }
        }
    
    def get_ai_model_status(self) -> Dict[str, Any]:
        """AI 모델 상태 조회"""
        return self.ai_optimizer.get_model_status() 