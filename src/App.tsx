// src/App.tsx
import React, { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import RootNavigator from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/useAuthStore";

export default function App() {
  const setToken = useAuthStore((state) => state.setToken);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("jwt");
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.warn("JWT 로딩 실패:", error);
      } finally {
        setIsReady(true);
      }
    };

    loadToken();
  }, []);

  if (!isReady) {
    return null; // 또는 SplashScreen 컴포넌트
  }

  return <RootNavigator />;
}