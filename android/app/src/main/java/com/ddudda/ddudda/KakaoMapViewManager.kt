package com.ddudda.ddudda

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.bridge.LifecycleEventListener
import java.util.WeakHashMap

// ===== Kakao Vector Map SDK =====
import com.kakao.vectormap.KakaoMap
import com.kakao.vectormap.KakaoMapReadyCallback
import com.kakao.vectormap.MapLifeCycleCallback
import com.kakao.vectormap.MapView

class KakaoMapViewManager : SimpleViewManager<MapView>() {

    companion object {
        const val REACT_CLASS = "KakaoMapView"
        // ✅ 반드시 즉시 초기화 (여기 빠지면 "must be initialized" 에러 납니다)
        private val lifecycleListeners: MutableMap<MapView, LifecycleEventListener> = WeakHashMap()
    }

    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(context: ThemedReactContext): MapView {
        // ✅ MapView 즉시 생성 (선언만 하지 말고 바로 만들기)
        val mapView = MapView(context)

        // ✅ SDK 가이드 그대로: start + onMapReady, onMapError
        mapView.start(
            object : MapLifeCycleCallback() {
                override fun onMapDestroy() {
                    // 지도 API 정상 종료
                }
                override fun onMapError(error: Exception) {
                    // 인증/통신 등 오류
                    // Log.e("KakaoMap", "onMapError: ${error.message}", error)
                }
            },
            object : KakaoMapReadyCallback() {
                override fun onMapReady(kakaoMap: KakaoMap) {
                    // 인증 OK 후 호출. 필요 시 카메라 이동/마커 추가 등 처리
                    // 예: kakaoMap.moveCamera(CameraUpdateFactory.newCenterPosition(...))  // (API에 맞춰 사용)
                }
            }
        )

        // ✅ RN 호스트 라이프사이클과 연결 (resume/pause 필수)
        val listener: LifecycleEventListener = object : LifecycleEventListener {
            override fun onHostResume() {
                runCatching { mapView.resume() }
                    .recoverCatching {
                        // 구 SDK 대응 (메서드명이 onResume인 경우)
                        mapView.javaClass.methods
                            .firstOrNull { it.name == "onResume" && it.parameterCount == 0 }
                            ?.invoke(mapView)
                    }
            }

            override fun onHostPause() {
                runCatching { mapView.pause() }
                    .recoverCatching {
                        mapView.javaClass.methods
                            .firstOrNull { it.name == "onPause" && it.parameterCount == 0 }
                            ?.invoke(mapView)
                    }
            }

            override fun onHostDestroy() {
                // 필요 시 추가 정리 (SDK에 stop/finish/onDestroy가 있으면 안전 호출)
                runCatching {
                    val stopLike = listOf("finish", "stop", "onDestroy")
                    mapView.javaClass.methods
                        .firstOrNull { it.name in stopLike && it.parameterCount == 0 }
                        ?.invoke(mapView)
                }
            }
        }

        context.addLifecycleEventListener(listener)
        lifecycleListeners[mapView] = listener

        // ✅ 생성한 객체 그대로 반환 (mapView(...)처럼 함수 호출 형태 금지)
        return mapView
    }

    override fun onDropViewInstance(view: MapView) {
        val ctx = view.context as? ThemedReactContext

        // 등록했던 LifecycleEventListener 해제
        lifecycleListeners.remove(view)?.let { listener ->
            ctx?.removeLifecycleEventListener(listener)
        }

        // 정리 (가능한 메서드만 안전 호출)
        runCatching { view.pause() }
            .recoverCatching {
                view.javaClass.methods
                    .firstOrNull { it.name == "onPause" && it.parameterCount == 0 }
                    ?.invoke(view)
            }
        runCatching {
            val stopLike = listOf("finish", "stop", "onDestroy")
            view.javaClass.methods
                .firstOrNull { it.name in stopLike && it.parameterCount == 0 }
                ?.invoke(view)
        }

        super.onDropViewInstance(view)
    }
}
