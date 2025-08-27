package com.ddudda.ddudda

import android.content.Context
import android.widget.FrameLayout
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.kakao.vectormap.KakaoMap
import com.kakao.vectormap.KakaoMapReadyCallback
import com.kakao.vectormap.LatLng
import com.kakao.vectormap.MapView
import com.kakao.vectormap.camera.CameraUpdateFactory
import com.kakao.vectormap.MapLifeCycleCallback

class KakaoMapView(context: Context) : FrameLayout(context) {
    private var kakaoMap: KakaoMap? = null
    private var mapView: MapView? = null
    private var latitude: Double = 37.566826
    private var longitude: Double = 126.9786567
    private var level: Int = 3

    init {
        mapView = MapView(context)
        addView(mapView)
        
        mapView?.start(object : MapLifeCycleCallback() {
            override fun onMapDestroy() {
                // 지도 뷰 해제
            }

            override fun onMapError(exception: Exception) {
                // 에러 처리
            }
        }, object : KakaoMapReadyCallback() {
            override fun onMapReady(map: KakaoMap) {
                kakaoMap = map
                updateMapLocation()
            }
        })
    }

    fun setLatitude(lat: Double) {
        latitude = lat
        updateMapLocation()
    }

    fun setLongitude(lng: Double) {
        longitude = lng
        updateMapLocation()
    }

    fun setLevel(lvl: Int) {
        level = lvl
        updateMapLocation()
    }

    private fun updateMapLocation() {
        kakaoMap?.let { map ->
            val cameraUpdate = CameraUpdateFactory.newCenterPosition(
                LatLng.from(latitude, longitude),
                level
            )
            map.moveCamera(cameraUpdate)
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        mapView?.finish()
    }
}

class KakaoMapViewManager(reactContext: ReactApplicationContext) : SimpleViewManager<KakaoMapView>() {
    
    override fun getName(): String {
        return "KakaoMapView"
    }

    override fun createViewInstance(reactContext: ThemedReactContext): KakaoMapView {
        return KakaoMapView(reactContext)
    }

    @ReactProp(name = "latitude")
    fun setLatitude(view: KakaoMapView, latitude: Double) {
        view.setLatitude(latitude)
    }

    @ReactProp(name = "longitude")
    fun setLongitude(view: KakaoMapView, longitude: Double) {
        view.setLongitude(longitude)
    }

    @ReactProp(name = "level")
    fun setLevel(view: KakaoMapView, level: Int) {
        view.setLevel(level)
    }
}
