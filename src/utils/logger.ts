// src/utils/logger.ts
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: any[]) => {
    // 오류는 프로덕션에서도 출력하도록 유지
    console.error(...args);
  },
}; 