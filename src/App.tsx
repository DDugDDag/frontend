// src/App.tsx
import React from "react";
import RootNavigator from "@/navigation/RootNavigator";
import { AppProvider } from "@/stores/AppContext";

export default function App() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}