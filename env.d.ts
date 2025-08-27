// env.d.ts
declare module 'react-native-config' {
  interface Env {
    KAKAO_REST_API_KEY: string;
    KAKAO_REDIRECT_URI: string;
    KAKAO_MAP_API_KEY: string;
    WEATHER_API_KEY: string;
    BACKEND_API_URL: string;
  }
  const Config: Env;
  export default Config;
}