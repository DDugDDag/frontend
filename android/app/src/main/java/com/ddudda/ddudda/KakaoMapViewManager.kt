package com.ddudda.ddudda

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.bridge.LifecycleEventListener
import java.util.WeakHashMap

class KakaoMapViewManager : SimpleViewManager<KakaoMapView>() {

    companion object {
        const val REACT_CLASS = "KakaoMapView"
        private val lifecycleListeners: MutableMap<KakaoMapView, LifecycleEventListener> = WeakHashMap()
    }

    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(context: ThemedReactContext): KakaoMapView {
        val mapView = KakaoMapView(context)
        mapView.resume()
        // React Native 생명주기 연결
        val listener = object : LifecycleEventListener {
            override fun onHostResume() {
                mapView.resume()
            }

            override fun onHostPause() {
                mapView.pause()
            }

            override fun onHostDestroy() {
                mapView.destroy()
            }
        }

        context.addLifecycleEventListener(listener)
        lifecycleListeners[mapView] = listener

        return mapView
    }

    override fun onDropViewInstance(view: KakaoMapView) {
        val ctx = view.context as? ThemedReactContext
        lifecycleListeners.remove(view)?.let { ctx?.removeLifecycleEventListener(it) }

        view.pause()
        view.destroy()

        super.onDropViewInstance(view)
    }
}
