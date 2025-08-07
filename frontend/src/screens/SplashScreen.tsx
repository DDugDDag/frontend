// src/screens/SplashScreen.tsx
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "@/constants/Colors";
import ScreenWrapper from "@/components/layout/ScreenWrapper";

export default function SplashScreen() {
  const navigation = useNavigation();

  return (
    <ScreenWrapper backgroundColor={Colors.primary}>
      <View style={styles.container}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
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
  logo: { width: 100, height: undefined, aspectRatio: 1, marginBottom: 50 },
  button: {
    backgroundColor: "white",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: { fontSize: 16, fontWeight: "bold" },
});
