// src/components/layout/ScreenWrapper.tsx
import React, { ReactNode } from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  ScrollView,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

type Props = {
  children: ReactNode;
  scrollable?: boolean;
  backgroundColor?: string;
  paddingHorizontal?: number;
  statusBarStyle?: "light" | "dark";
  footer?: ReactNode; // ✅ 하단 고정 네비게이션 등 추가 영역
  footerStyle?: ViewStyle; // footer 스타일도 오버라이드 가능하게
};

export default function ScreenWrapper({
  children,
  scrollable = false,
  backgroundColor = "#fff",
  paddingHorizontal = 24,
  statusBarStyle = "dark",
  footer,
  footerStyle,
}: Props) {
  const Wrapper = scrollable ? ScrollView : View;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={["top", "left", "right"]}
    >
      {/* Expo 상태바 - iOS, Android 공통 */}
      <ExpoStatusBar style={statusBarStyle} />

      <View style={{ flex: 1 }}>
        <Wrapper
          style={[
            styles.wrapper,
            {
              backgroundColor,
              paddingHorizontal,
            },
          ]}
          contentContainerStyle={
            scrollable ? { flexGrow: 1, justifyContent: "center" } : undefined
          }
        >
          {children}
        </Wrapper>

        {/* ✅ 필요 시에만 footer 렌더 */}
        {footer && <View style={footerStyle}>{footer}</View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0,
  },
  wrapper: {
    flex: 1,
  },
});

// 아래는 다양한 사용 예시입니다:

// ---

// ### ✅ 기본 사용

// ```tsx
// import ScreenWrapper from "../components/layout/ScreenWrapper";
// import { Text } from "react-native";

// export default function HomeScreen() {
//   return (
//     <ScreenWrapper>
//       <Text>홈 화면</Text>
//     </ScreenWrapper>
//   );
// }
// ```

// ---

// ### ✅ 스크롤 가능한 화면

// ```tsx
// import ScreenWrapper from "../components/layout/ScreenWrapper";
// import { Text } from "react-native";

// export default function ScrollableScreen() {
//   return (
//     <ScreenWrapper scrollable>
//       {[...Array(50)].map((_, i) => (
//         <Text key={i}>아이템 {i + 1}</Text>
//       ))}
//     </ScreenWrapper>
//   );
// }
// ```

// ---

// ### ✅ 다크 상태바 + 배경색 설정

// ```tsx
// import ScreenWrapper from "../components/layout/ScreenWrapper";
// import { Text } from "react-native";

// export default function DarkScreen() {
//   return (
//     <ScreenWrapper
//       backgroundColor="#000"
//       statusBarStyle="light"
//       paddingHorizontal={16}
//     >
//       <Text style={{ color: "#fff" }}>다크 모드 화면</Text>
//     </ScreenWrapper>
//   );
// }
// ```

// ---

// ### ✅ 하단 네비게이션/Footer 포함

// ```tsx
// import ScreenWrapper from "../components/layout/ScreenWrapper";
// import { Text, View, TouchableOpacity } from "react-native";

// export default function ScreenWithFooter() {
//   const footer = (
//     <View
//       style={{
//         padding: 16,
//         borderTopWidth: 1,
//         borderColor: "#ccc",
//         backgroundColor: "#fafafa",
//       }}
//     >
//       <TouchableOpacity>
//         <Text style={{ textAlign: "center" }}>다음으로</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <ScreenWrapper footer={footer}>
//       <Text>내용 영역</Text>
//     </ScreenWrapper>
//   );
// }
// ```

// ```tsx
// export default function CustomFooterScreen() {
//   return (
//     <ScreenWrapper
//       footer={<Text style={{ textAlign: "center" }}>고정 하단 텍스트</Text>}
//       footerStyle={{ padding: 12, backgroundColor: "#eee" }}
//     >
//       <Text>본문입니다.</Text>
//     </ScreenWrapper>
//   );
// }
// ```
