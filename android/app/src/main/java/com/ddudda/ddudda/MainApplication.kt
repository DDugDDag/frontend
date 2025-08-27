package com.ddudda.ddudda

import android.app.Application
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.kakao.vectormap.KakaoMapSdk
import com.kakao.sdk.common.util.Utility

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
              add(KakaoMapPackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    
    // 카카오맵 SDK 초기화
    KakaoMapSdk.init(this, BuildConfig.KAKAO_NATIVE_APP_KEY)
    
    // 키 해시 확인 (디버그 모드에서만)
    if (BuildConfig.DEBUG) {
        try {
            val keyHash = Utility.getKeyHash(this)
            Log.d("KakaoKeyHash", "Key Hash: $keyHash")
            println("===== 카카오 키 해시 =====")
            println("Key Hash: $keyHash")
            println("=======================")
        } catch (e: Exception) {
            Log.e("KakaoKeyHash", "키 해시를 가져오는 중 오류 발생", e)
        }
    }
    
    loadReactNative(this)
  }
}
