// src/services/authService.ts

import { authorize, type AuthorizeResult, type AuthConfiguration } from 'react-native-app-auth';
import Config from 'react-native-config';
import { APIResponse, User } from './types';

interface KakaoUserResponse {
  id: number;
  connected_at: string;
  properties?: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account?: {
    profile?: {
      nickname?: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
      is_default_image?: boolean;
    };
    has_email?: boolean;
    email?: string;
  };
}

class AuthService {
  private kakaoRestApiKey = Config.KAKAO_REST_API_KEY;
  private redirectUri = Config.KAKAO_REDIRECT_URI || 'ddudda://oauth';

  /**
   * 카카오 OAuth 로그인을 시작합니다 (react-native-app-auth 이용, PKCE)
   */
  async loginWithKakao(): Promise<APIResponse<{ user: User; accessToken: string }>> {
    try {
      if (!this.kakaoRestApiKey) {
        return { error: 'KAKAO_REST_API_KEY가 설정되지 않았습니다.', status: 400 };
      }
      if (!this.redirectUri) {
        return { error: 'KAKAO_REDIRECT_URI가 설정되지 않았습니다.', status: 400 };
      }

      const config = this.buildKakaoAppAuthConfig();

      // 시스템 브라우저로 인증 → 등록된 스킴(ddudda://oauth)으로 앱 복귀
      const result: AuthorizeResult = await authorize(config);
      // result: { accessToken, accessTokenExpirationDate, refreshToken, ... }

      // 사용자 정보 요청
      const userResponse = await this.getKakaoUserInfo(result.accessToken);

      const user: User = {
        id: `kakao_${userResponse.id}`,
        name:
          userResponse?.kakao_account?.profile?.nickname ||
          userResponse?.properties?.nickname ||
          '뚜따 사용자',
        email: userResponse?.kakao_account?.email || '',
        profileImage:
          userResponse?.kakao_account?.profile?.profile_image_url ||
          userResponse?.properties?.profile_image ||
          '',
        provider: 'kakao',
        preferences: {
          scenic_route: false,
          prioritize_safety: true,
          avoid_hills: false,
          preferred_speed: 'normal',
        },
      };

      return {
        data: { user, accessToken: result.accessToken },
        status: 200,
      };
    } catch (error: any) {
      console.error('카카오 로그인 예외:', error);

      // 개발 중 fallback (원래 코드 유지)
      const fallbackUser: User = {
        id: 'kakao_ddudda_official',
        name: '뚜따 공식 계정',
        email: 'officalddudda@kakao.com',
        profileImage: '',
        provider: 'kakao',
        preferences: {
          scenic_route: false,
          prioritize_safety: true,
          avoid_hills: false,
          preferred_speed: 'normal',
        },
      };

      return {
        data: { user: fallbackUser, accessToken: 'fallback_access_token' },
        status: 200,
      };
    }
  }

  /**
   * 로그아웃(토큰 무효화는 카카오 REST에 별도 호출 필요)
   */
  async logout(): Promise<APIResponse<boolean>> {
    try {
      // 필요 시 액세스 토큰 보유시 아래 REST 호출
      // await this.revokeKakaoToken(accessToken);
      return { data: true, status: 200 };
    } catch (e) {
      return { error: '로그아웃 중 오류가 발생했습니다.', status: 500 };
    }
  }

  /**
   * react-native-app-auth 설정 생성
   */
private buildKakaoAppAuthConfig(): AuthConfiguration {
  return {
    issuer: 'https://kauth.kakao.com', // ✅ 필수
    clientId: this.kakaoRestApiKey!,   // 위에서 존재 체크했으므로 단언
    redirectUrl: this.redirectUri!,    // 위에서 존재 체크했으므로 단언
    scopes: ['profile_nickname', 'profile_image', 'account_email'], // ✅ 일반 배열
    serviceConfiguration: {
      authorizationEndpoint: 'https://kauth.kakao.com/oauth/authorize',
      tokenEndpoint: 'https://kauth.kakao.com/oauth/token',
    },
  };
}

  /**
   * 카카오 사용자 정보
   */
  private async getKakaoUserInfo(accessToken: string): Promise<KakaoUserResponse> {
    const res = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`사용자 정보 조회 실패: ${res.status} - ${text}`);
    return JSON.parse(text);
  }

  /**
   * 카카오 토큰 무효화(선택)
   */
  private async revokeKakaoToken(accessToken: string): Promise<void> {
    if (!accessToken) return;
    await fetch('https://kapi.kakao.com/v1/user/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}

export const authService = new AuthService();
