// src/screens/SplashScreen.tsx
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "@/constants/Colors";
import ScreenWrapper from "@/components/layout/ScreenWrapper";

export default function SplashScreen() {
  const navigation = useNavigation();

  return (
    <ScreenWrapper backgroundColor={Colors.accent}>
      <View style={styles.container}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Onboarding" as never)}
        >
          <Text style={styles.buttonText}>시작하기</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: { width: 100, height: 100, marginBottom: 50 },
  button: {
    backgroundColor: "white",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: { fontSize: 16, fontWeight: "bold" },
});
