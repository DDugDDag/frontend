// android/app/src/main/java/com/ddudda/ddudda/KakaoMapViewManager.java
package com.ddudda.ddudda;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;

import com.kakao.vectormap.KakaoMap;
import com.kakao.vectormap.KakaoMapReadyCallback;
import com.kakao.vectormap.MapLifeCycleCallback;
import com.kakao.vectormap.MapView;

import java.util.Map;
import java.util.WeakHashMap;

public class KakaoMapViewManager extends SimpleViewManager<MapView> {
    public static final String REACT_CLASS = "KakaoMapView";

    // view별로 등록한 LifecycleEventListener를 기억해 두었다가 정리
    private static final Map<MapView, LifecycleEventListener> sLifecycleListeners = new WeakHashMap<>();

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    protected MapView createViewInstance(@NonNull ThemedReactContext context) {
        MapView mapView = new MapView(context);

        // 지도 시작
        mapView.start(new MapLifeCycleCallback() {
            @Override
            public void onMapDestroy() {
                // 지도 API 정상 종료 시
            }

            @Override
            public void onMapError(Exception error) {
                // 인증 실패/에러 시 - 필요하면 Log로 확인
                // Log.e("KakaoMap", "onMapError: " + error.getMessage(), error);
            }
        }, new KakaoMapReadyCallback() {
            @Override
            public void onMapReady(KakaoMap kakaoMap) {
                // 인증 OK 후 콜백
                // Log.i("KakaoMap", "onMapReady");
            }
        });

        // RN 호스트 라이프사이클을 MapView에 연결
        LifecycleEventListener listener = new LifecycleEventListener() {
            @Override
            public void onHostResume() {
                mapView.resume();
            }

            @Override
            public void onHostPause() {
                mapView.pause();
            }

            @Override
            public void onHostDestroy() {
                // 필요 시 정리 로직
                // mapView.pause(); // 안전 차원
            }
        };

        context.addLifecycleEventListener(listener);
        sLifecycleListeners.put(mapView, listener);

        return mapView;
    }

    @Override
    public void onDropViewInstance(@NonNull MapView view) {
        // 뷰가 RN 계층에서 제거될 때 리스너 해제 + 정리
        ThemedReactContext ctx = (ThemedReactContext) view.getContext();
        LifecycleEventListener l = sLifecycleListeners.remove(view);
        if (l != null) {
            ctx.removeLifecycleEventListener(l);
        }
        // 라이프사이클 정리 (SDK에 stop()이 있다면 호출, 없으면 pause 정도로 마무리)
        try {
            view.pause();
        } catch (Throwable ignore) {}
        super.onDropViewInstance(view);
    }
}
