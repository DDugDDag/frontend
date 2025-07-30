// src/components/layout/ScreenWrapper.tsx
import React, { ReactNode } from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

type Props = {
  children: ReactNode;
  scrollable?: boolean;
  backgroundColor?: string;
  paddingHorizontal?: number;
  statusBarStyle?: "light" | "dark";
};

export default function ScreenWrapper({
  children,
  scrollable = false,
  backgroundColor = "#fff",
  paddingHorizontal = 24,
  statusBarStyle = "dark",
}: Props) {
  const Wrapper = scrollable ? ScrollView : View;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={["top", "left", "right"]}
    >
      {/* Expo 상태바 - iOS, Android 공통 */}
      <ExpoStatusBar style={statusBarStyle} />
      
      <Wrapper
        style={[
          styles.wrapper,
          {
            backgroundColor,
            paddingHorizontal,
          },
        ]}
        contentContainerStyle={
          scrollable
            ? { flexGrow: 1, justifyContent: "center" }
            : undefined
        }
      >
        {children}
      </Wrapper>
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


// 사용 예시
// <ScreenWrapper>
//   <Text>정적인 화면</Text>
// </ScreenWrapper>

// <ScreenWrapper scrollable backgroundColor="#F9F9F9">
//   <LongList />
// </ScreenWrapper>

// <ScreenWrapper statusBarStyle="light" backgroundColor="#000">
//   <DarkThemedScreen />
// </ScreenWrapper>