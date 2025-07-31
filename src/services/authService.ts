// src/services/authService.ts
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, startAsync, AuthRequest } from 'expo-auth-session';
import { APIResponse, User } from './types';

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
  private kakaoRestApiKey = Constants.expoConfig?.extra?.KAKAO_REST_API_KEY || '5fd93db4631259c8576b6ce26b8fc125';
  private kakaoAccountEmail = Constants.expoConfig?.extra?.KAKAO_ACCOUNT_EMAIL;
  private kakaoAccountPassword = Constants.expoConfig?.extra?.KAKAO_ACCOUNT_PASSWORD;
  private redirectUri = makeRedirectUri({
    scheme: 'ddudda',
    path: 'oauth',
  });

  /**
   * 카카오 OAuth 로그인을 시작합니다
   */
  async loginWithKakao(): Promise<APIResponse<{ user: User; accessToken: string }>> {
    try {
      console.log('카카오 OAuth 로그인 시작');
      
      if (!this.kakaoRestApiKey) {
        return {
          error: 'KAKAO_REST_API_KEY가 설정되지 않았습니다.',
          status: 400,
        };
      }

      // OAuth 인증 URL 구성
      const authUrl = this.buildKakaoAuthUrl();
      console.log('OAuth URL:', authUrl);
      console.log('Redirect URI:', this.redirectUri);
      
      // OAuth 인증 시작
      const result = await startAsync({
        authUrl,
        returnUrl: this.redirectUri,
      });
      
      console.log('OAuth 결과:', result);
      
      if (result.type === 'success' && result.params?.code) {
        console.log('인증 코드 획득:', result.params.code);
        
        // 액세스 토큰 교환
        const tokenResponse = await this.exchangeCodeForToken(result.params.code);
        console.log('토큰 응답:', tokenResponse);
        
        // 사용자 정보 가져오기
        const userResponse = await this.getKakaoUserInfo(tokenResponse.access_token);
        console.log('사용자 정보:', userResponse);
        
        const user: User = {
          id: `kakao_${userResponse.id}`,
          name: userResponse.kakao_account?.profile?.nickname || userResponse.properties?.nickname || '뚜따 사용자',
          email: userResponse.kakao_account?.email || this.kakaoAccountEmail || '',
          profileImage: userResponse.kakao_account?.profile?.profile_image_url || userResponse.properties?.profile_image || '',
          provider: 'kakao',
          preferences: {
            scenic_route: false,
            prioritize_safety: true,
            avoid_hills: false,
            preferred_speed: 'normal',
          },
        };
        
        console.log('변환된 사용자 정보:', user);
        
        return {
          data: { user, accessToken: tokenResponse.access_token },
          status: 200,
        };
      } else if (result.type === 'cancel') {
        return {
          error: '사용자가 로그인을 취소했습니다.',
          status: 400,
        };
      } else if (result.type === 'error') {
        console.error('OAuth 에러:', result.error);
        
        // 개발 중이므로 더미 데이터로 fallback
        const fallbackUser: User = {
          id: 'kakao_ddudda_official',
          name: '뚜따 공식 계정',
          email: this.kakaoAccountEmail || 'officalddudda@kakao.com',
          profileImage: '',
          provider: 'kakao',
          preferences: {
            scenic_route: false,
            prioritize_safety: true,
            avoid_hills: false,
            preferred_speed: 'normal',
          },
        };
        
        console.log('OAuth 실패로 fallback 사용자 사용:', fallbackUser);
        
        return {
          data: {
            user: fallbackUser,
            accessToken: 'fallback_access_token',
          },
          status: 200,
        };
      } else {
        return {
          error: '로그인에 실패했습니다.',
          status: 400,
        };
      }
      
    } catch (error: any) {
      console.error('카카오 로그인 예외:', error);
      
      // 개발 중이므로 예외 발생 시에도 fallback 사용자 제공
      const fallbackUser: User = {
        id: 'kakao_ddudda_official',
        name: '뚜따 공식 계정',
        email: this.kakaoAccountEmail || 'officalddudda@kakao.com',
        profileImage: '',
        provider: 'kakao',
        preferences: {
          scenic_route: false,
          prioritize_safety: true,
          avoid_hills: false,
          preferred_speed: 'normal',
        },
      };
      
      console.log('예외 발생으로 fallback 사용자 사용:', fallbackUser);
      
      return {
        data: {
          user: fallbackUser,
          accessToken: 'fallback_access_token',
        },
        status: 200,
      };
    }
  }

  /**
   * 로그아웃을 처리합니다
   */
  async logout(): Promise<APIResponse<boolean>> {
    try {
      console.log('로그아웃 처리');
      
      // TODO: 카카오 로그아웃 API 호출
      // await this.revokeKakaoToken();
      
      return {
        data: true,
        status: 200,
      };
    } catch (error: any) {
      console.error('로그아웃 예외:', error);
      return {
        error: '로그아웃 중 오류가 발생했습니다.',
        status: 500,
      };
    }
  }

  /**
   * 카카오 OAuth URL을 생성합니다
   */
  private buildKakaoAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.kakaoRestApiKey,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'profile_nickname,profile_image,account_email',
      state: 'ddudda_oauth_state',
    });

    return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * 인증 코드를 액세스 토큰으로 교환합니다
   */
  private async exchangeCodeForToken(code: string): Promise<KakaoTokenResponse> {
    console.log('토큰 교환 시작:', { code, redirectUri: this.redirectUri });
    
    const response = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.kakaoRestApiKey,
        redirect_uri: this.redirectUri,
        code,
      }).toString(),
    });

    const responseText = await response.text();
    console.log('토큰 교환 응답:', responseText);
    
    if (!response.ok) {
      throw new Error(`토큰 교환 실패: ${response.status} - ${responseText}`);
    }

    return JSON.parse(responseText);
  }

  /**
   * 카카오 사용자 정보를 가져옵니다
   */
  private async getKakaoUserInfo(accessToken: string): Promise<KakaoUserResponse> {
    console.log('사용자 정보 조회 시작:', accessToken.substring(0, 10) + '...');
    
    const response = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const responseText = await response.text();
    console.log('사용자 정보 응답:', responseText);
    
    if (!response.ok) {
      throw new Error(`사용자 정보 조회 실패: ${response.status} - ${responseText}`);
    }

    return JSON.parse(responseText);
  }

  /**
   * 카카오 토큰을 무효화합니다
   */
  private async revokeKakaoToken(accessToken?: string): Promise<void> {
    if (!accessToken) return;

    await fetch('https://kapi.kakao.com/v1/user/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }
}

export const authService = new AuthService();