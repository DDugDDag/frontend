// src/data/records.ts
import { ActivityRecord, toPaceKmHr } from "@/types/activity";

const now = new Date();
const samplePath = [
  { latitude: 37.5665, longitude: 126.9780 },
  { latitude: 37.5658, longitude: 126.9820 },
  { latitude: 37.5648, longitude: 126.9855 },
];

function enrich(r: Omit<ActivityRecord, "paceKmHr" | "co2SavedOz">): ActivityRecord {
  const pace = toPaceKmHr(r.distanceM, r.durationSec);
  // 예시: km당 대략 1.6oz 절감(디자인 값과 맞춤)
  const co2 = (r.distanceM / 1000) * 1.6;
  return { ...r, paceKmHr: Math.round(pace * 10) / 10, co2SavedOz: Math.round(co2) };
}

export const RECORDS: ActivityRecord[] = [
  enrich({
    id: "r1",
    type: "bike",
    dateISO: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 2).toISOString(),
    durationSec: 28 * 60,
    distanceM: 3752,
    calories: 34,
    startName: "네네치킨 동성로점",
    endName: "대구 현대 미술관 제 1관",
    path: samplePath,
  }),
  enrich({
    id: "r2",
    type: "walk",
    dateISO: "2025-11-21T18:10:00+09:00",
    durationSec: 56 * 60,
    distanceM: 10000,
    calories: 210,
    startName: "수성못",
    endName: "만촌네거리",
    path: samplePath,
  }),
  enrich({
    id: "r3",
    type: "walk",
    dateISO: "2025-11-16T09:10:00+09:00",
    durationSec: 30 * 60,
    distanceM: 5000,
    calories: 110,
    startName: "경북대 북문",
    endName: "대구역",
    path: samplePath,
  }),
];

export const getRecordById = (id: string) => RECORDS.find(r => r.id === id);

export const getAggregates = (records = RECORDS) => {
  const totalSec = records.reduce((s, r) => s + r.durationSec, 0);
  const totalCal = records.reduce((s, r) => s + r.calories, 0);
  const totalM = records.reduce((s, r) => s + r.distanceM, 0);
  const totalOz = records.reduce((s, r) => s + (r.co2SavedOz ?? 0), 0);
  return { totalSec, totalCal, totalM, totalOz };
};
