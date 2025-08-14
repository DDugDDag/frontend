// src/types/activity.ts
export type ActivityType = "bike" | "walk" | "run";

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface ActivityRecord {
  id: string;
  type: ActivityType;
  dateISO: string;        // 예: "2025-05-16T15:02:00+09:00"
  durationSec: number;    // 이동 시간(초)
  distanceM: number;      // 이동 거리(미터)
  calories: number;       // kcal 단위 단순 예시
  co2SavedOz?: number;    // 예시 지표
  paceKmHr?: number;      // 평균 속도
  startName?: string;
  endName?: string;
  path?: LatLng[];        // 지도 폴리라인
}

/* ---------- formatting helpers ---------- */
export const fmtMin = (sec: number) => `${Math.round(sec / 60)} mins`;
export const fmtCal = (cal: number) => `${cal} cal`;
export const fmtKm = (m: number, digits = 1) =>
  `${(m / 1000).toFixed(digits)} km`;
export const fmtMeter = (m: number) => `${Math.round(m)} m`;
export const fmtTimeHM = (d: Date) =>
  d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
export const fmtYmdDot = (d: Date) =>
  d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
export const toPaceKmHr = (m: number, sec: number) =>
  m === 0 || sec === 0 ? 0 : (m / 1000) / (sec / 3600);
