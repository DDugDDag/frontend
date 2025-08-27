package com.ddudda.ddudda
import android.util.Log
import android.content.Context
import android.util.AttributeSet
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.kakao.vectormap.*

class KakaoMapView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : FrameLayout(context, attrs) {

    private val mapView: MapView = MapView(context)
    private var kakaoMap: KakaoMap? = null

    init {
        // View에 Kakao MapView 붙이기
        addView(mapView)
        Log.d("KakaoMapView", "🟢 mapView.start() called")
        mapView.start(
            object : MapLifeCycleCallback() {
                override fun onMapDestroy() {
                    // 지도 종료 시 처리
                }

                override fun onMapError(error: Exception) {
                    // 인증 실패, 통신 오류 등 처리
                    Log.e("KakaoMapView", "🛑 onMapError: ${error::class.java.simpleName} - ${error.message}", error)
                    error.printStackTrace()
                }
            },
            object : KakaoMapReadyCallback() {
                override fun onMapReady(readyMap: KakaoMap) {
                    kakaoMap = readyMap
                    Log.d("KakaoMapView", "🗺️ KakaoMap is ready")
                    // 인증 성공 시점에 지도 객체가 준비됨
                    // 여기서 마커 추가 등 가능
                }
            }
        )

    }

    fun resume() {
        mapView.resume()
    }

    fun pause() {
        mapView.pause()
    }

    fun destroy(){
        mapView.pause()
    }

    // 예시: JS → Android 통신 (prop 설정)
    fun setStationList(stationList: List<Map<String, Any>>) {
        // stationList 받아서 마커 추가 등 처리 (예정)
    }

    // 예시: Android → JS 이벤트 전송
    fun sendMapClickEvent(lat: Double, lng: Double) {
        val event = Arguments.createMap().apply {
            putDouble("lat", lat)
            putDouble("lng", lng)
        }

        (context as? ReactContext)?.getJSModule(RCTEventEmitter::class.java)
            ?.receiveEvent(id, "onMapClick", event)
    }
    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        Log.d("KakaoMapView", "✅ onAttachedToWindow -> resume()")
        mapView.resume()
    }

    override fun onDetachedFromWindow() {
        Log.d("KakaoMapView", "✅ onDetachedFromWindow -> pause()")
        mapView.pause()
        super.onDetachedFromWindow()
    }

}
