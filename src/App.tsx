// --- Intl polyfills (Hermes/Android용) ---
import '@formatjs/intl-getcanonicallocales/polyfill';
import '@formatjs/intl-locale/polyfill';

import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-pluralrules/locale-data/ko';   // 필요 언어

import '@formatjs/intl-numberformat/polyfill';
import '@formatjs/intl-numberformat/locale-data/ko';  // 필요 언어

import '@formatjs/intl-datetimeformat/polyfill';
import '@formatjs/intl-datetimeformat/add-all-tz';    // 타임존 지원
import '@formatjs/intl-datetimeformat/locale-data/ko';// 필요 언어

import React from "react";
import { View, StyleSheet } from "react-native";
import RootNavigator from "@/navigation/RootNavigator";
import { AppProvider } from "@/stores/AppContext";
import { NavigationContainer } from "@react-navigation/native"; // ✅ 추가
export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <View style={styles.container}>
          <RootNavigator />
        </View>
      </NavigationContainer>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
