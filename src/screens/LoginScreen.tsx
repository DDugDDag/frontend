// src/screens/LoginScreen.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthRequest, makeRedirectUri, ResponseType } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { KAKAO_REST_API_KEY } from "@env";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/stores/useAuthStore"; // ✅ Zustand 상태 연동

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
  tokenEndpoint: "https://kauth.kakao.com/oauth/token",
};

export default function LoginScreen() {
  const navigation = useNavigation();
  const { setToken, setUser } = useAuthStore();

  const redirectUri = makeRedirectUri({
    native: "ddudda://oauth",
    useProxy: true,
  } as any);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: KAKAO_REST_API_KEY,
      responseType: ResponseType.Code,
      redirectUri,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success" && response.params?.code) {
      const fetchTokenAndLogin = async () => {
        try {
          const tokenRes = await fetch(discovery.tokenEndpoint!, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `grant_type=authorization_code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(
              redirectUri
            )}&code=${response.params.code}`,
          });

          const tokenData = await tokenRes.json();
          if (!tokenData.access_token) return Alert.alert("실패", "액세스 토큰 없음");

          const backendRes = await fetch("http://<YOUR_BACKEND>/api/core/auth/kakao-login", {
            method: "POST",
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });

          const backendData = await backendRes.json();
          if (backendData.access_token) {
            await SecureStore.setItemAsync("jwt", backendData.access_token);
            setToken(backendData.access_token); // ✅ Zustand에 저장
            setUser(backendData.user); // ✅ 사용자 정보도 저장
            navigation.navigate("Home");
          } else {
            Alert.alert("실패", "JWT를 받지 못했습니다");
          }
        } catch (err) {
          console.error(err);
          Alert.alert("오류", "로그인 중 문제 발생");
        }
      };

      fetchTokenAndLogin();
    }
  }, [response]);

  return (
    <ScreenWrapper backgroundColor="#fff" statusBarStyle="dark">
      <View style={styles.container}>
        <Text style={styles.title}>카카오 로그인</Text>
        <TouchableOpacity onPress={() => promptAsync()}>
          <Image
            source={require("@/assets/images/kakao_login_large_wide.png")}
            style={styles.loginBtn}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 50,
    color: Colors.text,
  },
  loginBtn: {
    width: 222,
    height: 49,
  },
});
