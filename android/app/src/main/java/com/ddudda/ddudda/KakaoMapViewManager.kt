package com.ddudda.ddudda

import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.kakao.vectormap.KakaoMap
import com.kakao.vectormap.KakaoMapReadyCallback
import com.kakao.vectormap.MapLifeCycleCallback
import com.kakao.vectormap.MapView
import java.util.WeakHashMap

class KakaoMapViewManager : SimpleViewManager<MapView>() {

    companion object {
        const val REACT_CLASS = "KakaoMapView"
        // view별로 등록한 LifecycleEventListener를 기억해 두었다가 정리
        private val lifecycleListeners = WeakHashMap<MapView, LifecycleEventListener>()
    }

    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(context: ThemedReactContext): MapView {
        val mapView = MapView(context)

        // 지도 시작
        mapView.start(object : MapLifeCycleCallback {
            override fun onMapDestroy() {
                // 지도 API 정상 종료 시
            }

            override fun onMapError(error: Exception) {
                // 인증 실패/에러 시 - 필요하면 Log로 확인
                // Log.e("KakaoMap", "onMapError: ${error.message}", error)
            }
        }, object : KakaoMapReadyCallback {
            override fun onMapReady(kakaoMap: KakaoMap) {
                // 인증 OK 후 콜백
                // Log.i("KakaoMap", "onMapReady")
            }
        })

        // RN 호스트 라이프사이클을 MapView에 연결
        val listener = object : LifecycleEventListener {
            override fun onHostResume() {
                mapView.resume()
            }

            override fun onHostPause() {
                mapView.pause()
            }

            override fun onHostDestroy() {
                // 필요 시 추가 정리 로직
                // mapView.pause()
            }
        }

        context.addLifecycleEventListener(listener)
        lifecycleListeners[mapView] = listener

        return mapView
    }

    override fun onDropViewInstance(view: MapView) {
        // 뷰가 RN 계층에서 제거될 때 리스너 해제 + 정리
        val ctx = view.context as? ThemedReactContext
        val listener = lifecycleListeners.remove(view)
        if (ctx != null && listener != null) {
            ctx.removeLifecycleEventListener(listener)
        }

        // 라이프사이클 정리 (SDK에 stop()이 있다면 호출, 없으면 pause 정도로 마무리)
        runCatching { view.pause() }

        super.onDropViewInstance(view)
    }
}
