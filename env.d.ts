// env.d.ts
declare module "@env" {
  export const WEATHER_API_KEY: string;
}

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_BACKEND_API_URL?: string;
    EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY?: string;
    EXPO_PUBLIC_KAKAO_REST_API_KEY?: string;
    EXPO_PUBLIC_KAKAO_ADMIN_KEY?: string;
  }
}
