import React from "react";
import { View } from "react-native";
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";

import HomeScreen from "@/screens/HomeScreen";
import MapScreen from "@/screens/MapScreen";
import RecordStack from "@/screens/Record/RecordStack"; // ✅ 스택으로 교체

import { HomeIcon, MapIcon, RecordIcon } from "@/components/ui/Icons";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }: any): BottomTabNavigationOptions => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: 70,
        },
        tabBarIcon: ({
          focused,
        }: any) => {
          const iconProps = {
            size: 24,
            color: focused ? "#3B1E1E" : "#999",
          };

          switch (route.name) {
            case "Home":
              return (
                <View style={{ alignItems: "center" }}>
                  <HomeIcon {...iconProps} />
                  {focused && <IndicatorDot />}
                </View>
              );
            case "Map":
              return (
                <View style={{ alignItems: "center" }}>
                  <MapIcon {...iconProps} />
                  {focused && <IndicatorDot />}
                </View>
              );
            case "Record":
              return (
                <View style={{ alignItems: "center" }}>
                  <RecordIcon {...iconProps} />
                  {focused && <IndicatorDot />}
                </View>
              );
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Record" component={RecordStack} />
    </Tab.Navigator>
  );
}

function IndicatorDot() {
  return (
    <View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#FFCF50",
        marginTop: 4,
      }}
    />
  );
}
