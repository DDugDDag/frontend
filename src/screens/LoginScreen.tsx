// src/screens/LoginScreen.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { Colors } from "@/constants/Colors";

// ❌ OAuth 관련 import 임시 주석처리
// import {
//   useAuthRequest,
//   makeRedirectUri,
//   ResponseType,
//   exchangeCodeAsync,
// } from "expo-auth-session";
// import * as WebBrowser from "expo-web-browser";
// import { KAKAO_REST_API_KEY } from "@env";

// ❌ Kakao OAuth 설정 주석
// const discovery = {
//   authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
//   tokenEndpoint: "https://kauth.kakao.com/oauth/token",
// };

// ❌ WebBrowser.maybeCompleteAuthSession(); // ✅ Web뷰 완료 처리

export default function LoginScreen() {
  const navigation = useNavigation();

  // ❌ OAuth 관련 코드 주석
  // const redirectUri = makeRedirectUri({
  //   native: "ddudda://oauth",
  //   useProxy: true,
  // } as any);

  // const [request, response, promptAsync] = useAuthRequest(
  //   {
  //     clientId: KAKAO_REST_API_KEY,
  //     responseType: ResponseType.Code,
  //     redirectUri,
  //   },
  //   discovery
  // );

  // useEffect(() => {
  //   if (response?.type === "success" && response.params?.code) {
  //     const fetchTokenAndUser = async () => {
  //       try {
  //         const tokenRes = await fetch(discovery.tokenEndpoint!, {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/x-www-form-urlencoded",
  //           },
  //           body: `grant_type=authorization_code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(
  //             redirectUri
  //           )}&code=${response.params.code}`,
  //         });

  //         const tokenData = await tokenRes.json();

  //         if (tokenData.access_token) {
  //           const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
  //             headers: {
  //               Authorization: `Bearer ${tokenData.access_token}`,
  //             },
  //           });
  //           const userData = await userRes.json();
  //           Alert.alert("환영합니다!", `닉네임: ${userData.kakao_account.profile.nickname}`);
  //         } else {
  //           Alert.alert("로그인 실패", "토큰을 가져오지 못했습니다.");
  //         }
  //       } catch (error) {
  //         Alert.alert("오류", "로그인 중 문제가 발생했습니다.");
  //       }
  //     };

  //     fetchTokenAndUser();
  //   }
  // }, [response]);

  // 로그인 버튼 클릭 시 지도 화면으로 이동
  const handleLogin = () => {
    navigation.navigate("Map" as never);
  };

  return (
    <ScreenWrapper backgroundColor="#fff" statusBarStyle="dark">
      <View style={styles.container}>
        <Text style={styles.title}>카카오 로그인</Text>
        <TouchableOpacity onPress={handleLogin}>
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
