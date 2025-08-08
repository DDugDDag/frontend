// src/services/authService.ts
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri, AuthRequest } from "expo-auth-session";
import { APIResponse, User } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthToken } from "./api";

// OAuth 완료를 위한 설정
WebBrowser.maybeCompleteAuthSession();

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
}

interface KakaoUserResponse {
  id: number;
  connected_at: string;
  properties: {
    nickname: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account: {
    profile_nickname_needs_agreement: boolean;
    profile_image_needs_agreement: boolean;
    profile: {
      nickname: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
      is_default_image: boolean;
    };
    has_email: boolean;
    email_needs_agreement: boolean;
    is_email_valid: boolean;
    is_email_verified: boolean;
    email?: string;
  };
}

class AuthService {
  private kakaoRestApiKey = Constants.expoConfig?.extra?.KAKAO_REST_API_KEY || "";
  private kakaoAccountEmail = Constants.expoConfig?.extra?.KAKAO_ACCOUNT_EMAIL;
  private kakaoAccountPassword = Constants.expoConfig?.extra?.KAKAO_ACCOUNT_PASSWORD;
  private redirectUri = makeRedirectUri({ scheme: "ddudda", path: "oauth" });
  private static TOKEN_KEY = "@ddudda/token";

  /** 카카오 OAuth 로그인을 시작합니다 */
  async loginWithKakao(): Promise<APIResponse<{ user: User; accessToken: string }>> {
    try {
      if (!this.kakaoRestApiKey) {
        return { error: "KAKAO_REST_API_KEY가 설정되지 않았습니다.", status: 400 };
      }

      const authUrl = this.buildKakaoAuthUrl();
      const result = await WebBrowser.openAuthSessionAsync(authUrl, this.redirectUri);

      if (result.type === "success" && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get("code");
        if (!code) return { error: "인증 코드를 받을 수 없습니다.", status: 400 };

        const tokenResponse = await this.exchangeCodeForToken(code);
        const userResponse = await this.getKakaoUserInfo(tokenResponse.access_token);

        const user: User = {
          id: `kakao_${userResponse.id}`,
          name: userResponse.kakao_account?.profile?.nickname || userResponse.properties?.nickname || "뚜따 사용자",
          email: userResponse.kakao_account?.email || this.kakaoAccountEmail || "",
          profileImage:
            userResponse.kakao_account?.profile?.profile_image_url ||
            userResponse.properties?.profile_image ||
            "",
          provider: "kakao",
          preferences: {
            scenic_route: false,
            prioritize_safety: true,
            avoid_hills: false,
            preferred_speed: "normal",
          },
        };

        // 토큰 저장 및 API 클라이언트에 주입
        await AsyncStorage.setItem(AuthService.TOKEN_KEY, tokenResponse.access_token);
        await setAuthToken(tokenResponse.access_token);

        return { data: { user, accessToken: tokenResponse.access_token }, status: 200 };
      } else if (result.type === "dismiss") {
        return { error: "사용자가 로그인을 취소했습니다.", status: 400 };
      } else {
        if (__DEV__) {
          const fallbackUser: User = {
            id: "kakao_ddudda_official",
            name: "뚜따 공식 계정",
            email: this.kakaoAccountEmail || "officalddudda@kakao.com",
            profileImage: "",
            provider: "kakao",
            preferences: {
              scenic_route: false,
              prioritize_safety: true,
              avoid_hills: false,
              preferred_speed: "normal",
            },
          };
          await setAuthToken("fallback_access_token");
          await AsyncStorage.setItem(AuthService.TOKEN_KEY, "fallback_access_token");
          return { data: { user: fallbackUser, accessToken: "fallback_access_token" }, status: 200 };
        }
        return { error: "로그인에 실패했습니다.", status: 500 };
      }
    } catch (error: any) {
      if (__DEV__) {
        const fallbackUser: User = {
          id: "kakao_ddudda_official",
          name: "뚜따 공식 계정",
          email: this.kakaoAccountEmail || "officalddudda@kakao.com",
          profileImage: "",
          provider: "kakao",
          preferences: {
            scenic_route: false,
            prioritize_safety: true,
            avoid_hills: false,
            preferred_speed: "normal",
          },
        };
        await setAuthToken("fallback_access_token");
        await AsyncStorage.setItem(AuthService.TOKEN_KEY, "fallback_access_token");
        return { data: { user: fallbackUser, accessToken: "fallback_access_token" }, status: 200 };
      }
      return { error: "로그인 중 오류가 발생했습니다.", status: 500 };
    }
  }

  /** 로그아웃 처리 */
  async logout(): Promise<APIResponse<boolean>> {
    try {
      await AsyncStorage.removeItem(AuthService.TOKEN_KEY);
      await setAuthToken(null);
      return { data: true, status: 200 };
    } catch (error: any) {
      return { error: "로그아웃 중 오류가 발생했습니다.", status: 500 };
    }
  }

  /** 카카오 OAuth URL 생성 */
  private buildKakaoAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.kakaoRestApiKey,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: "profile_nickname,profile_image,account_email",
      state: "ddudda_oauth_state",
    });
    return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  }

  /** 토큰 교환 */
  private async exchangeCodeForToken(code: string): Promise<KakaoTokenResponse> {
    const response = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: this.kakaoRestApiKey,
        redirect_uri: this.redirectUri,
        code,
      }).toString(),
    });
    const responseText = await response.text();
    if (!response.ok) throw new Error(`토큰 교환 실패: ${response.status} - ${responseText}`);
    return JSON.parse(responseText);
  }

  /** 사용자 정보 */
  private async getKakaoUserInfo(accessToken: string): Promise<KakaoUserResponse> {
    const response = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const responseText = await response.text();
    if (!response.ok) throw new Error(`사용자 정보 조회 실패: ${response.status} - ${responseText}`);
    return JSON.parse(responseText);
  }
}

export const authService = new AuthService();
