package com.ddudda.ddudda

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.kakao.sdk.common.util.Utility

class KakaoKeyHashModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName(): String {
        return "KakaoKeyHashModule"
    }

    @ReactMethod
    fun getKeyHash(promise: Promise) {
        try {
            val keyHash = Utility.getKeyHash(reactApplicationContext)
            promise.resolve(keyHash)
        } catch (e: Exception) {
            promise.reject("KEY_HASH_ERROR", "키 해시를 가져오는 중 오류 발생", e)
        }
    }
}
