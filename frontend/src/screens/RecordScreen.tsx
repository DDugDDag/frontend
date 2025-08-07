// screens/RecordScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import ScreenWrapper from "@/components/layout/ScreenWrapper";

export default function RecordScreen() {
  return (
    <ScreenWrapper
      scrollable
      backgroundColor="#FFCF50"
    >
        <Text>기록 화면입니다</Text>
    </ScreenWrapper>
  );
}

