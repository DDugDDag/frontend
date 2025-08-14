// src/screens/Record/RecordStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RecordHomeScreen from "@/screens/Record/RecordHomeScreen";
import RecordStatsScreen from "@/screens/Record/RecordStatsScreen";
import RecordDetailScreen from "@/screens/Record/RecordDetailScreen";

export type RecordStackParamList = {
  RecordHome: undefined;
  RecordStats: undefined;
  RecordDetail: { recordId: string };
};

const Stack = createNativeStackNavigator<RecordStackParamList>();

export default function RecordStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RecordHome" component={RecordHomeScreen} />
      <Stack.Screen name="RecordStats" component={RecordStatsScreen} />
      <Stack.Screen name="RecordDetail" component={RecordDetailScreen} />
    </Stack.Navigator>
  );
}
