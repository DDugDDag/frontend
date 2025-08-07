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
