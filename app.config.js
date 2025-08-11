import "dotenv/config";

const backendUrl =
  process.env.EXPO_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

const KAKAO_NATIVE_APP_KEY = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY || "";
const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY || "";
const KAKAO_ADMIN_KEY = process.env.EXPO_PUBLIC_KAKAO_ADMIN_KEY || "";
const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY || "";

export default {
  expo: {
    name: "ddudda",
    slug: "ddudda",
    scheme: "ddudda",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    extra: {
      KAKAO_MAP_API_KEY: KAKAO_REST_API_KEY,
      KAKAO_REST_API_KEY: KAKAO_REST_API_KEY,
      KAKAO_NATIVE_APP_KEY: KAKAO_NATIVE_APP_KEY,
      KAKAO_ADMIN_KEY: KAKAO_ADMIN_KEY,
      BACKEND_API_URL: backendUrl,
      WEATHER_API_KEY: WEATHER_API_KEY,
      eas: {
        projectId: "95a7097f-38a0-4814-848d-430a25366eca",
      },
    },
    splash: {
      image: "./assets/logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    jsEngine: "hermes",
    ios: {
      supportsTablet: true,
      jsEngine: "hermes",
      bundleIdentifier: "com.ddudda.app",
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "뚜따 앱이 자전거 내비게이션을 위해 위치 정보를 사용합니다.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "뚜따 앱이 자전거 내비게이션을 위해 위치 정보를 사용합니다.",
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      jsEngine: "hermes",
      package: "com.ddudda.app",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "INTERNET",
      ],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "뚜따 앱이 자전거 내비게이션을 위해 위치 정보를 사용합니다.",
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            extraMavenRepos: [
              "https://devrepo.kakao.com/nexus/content/groups/public/",
            ],
          },
          ios: {
            useFrameworks: "dynamic",
          },
        },
      ],
      [
        "@react-native-kakao/core",
        {
          nativeAppKey: KAKAO_NATIVE_APP_KEY,
        },
      ],
    ],
  },
};
