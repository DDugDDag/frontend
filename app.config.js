// app.config.js
import "dotenv/config";

export default {
  expo: {
    name: "뚜따",
    slug: "ddudda",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      BACKEND_API_URL: process.env.BACKEND_API_URL || "http://localhost:8000",
      KAKAO_MAP_API_KEY: process.env.KAKAO_MAP_API_KEY,
      KAKAO_REST_API_KEY: process.env.KAKAO_REST_API_KEY,
      eas: {
        projectId: "your-project-id",
      },
    },
  },
};
