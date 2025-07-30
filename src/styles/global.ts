// src/styles/global.ts
import { StyleSheet } from "react-native";

export const GlobalStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitleText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#6B4EFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});