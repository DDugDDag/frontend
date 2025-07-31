// src/components/map/SmartRouteModal.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Colors } from "@/constants/Colors";

interface SmartRouteModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    mode: 'bike' | 'walk';
    time?: number;
    distance?: number;
  }) => void;
}

export default function SmartRouteModal({
  visible,
  onClose,
  onSubmit,
}: SmartRouteModalProps) {
  const [selectedMode, setSelectedMode] = useState<'bike' | 'walk'>('bike');
  const [timeValue, setTimeValue] = useState("");
  const [distanceValue, setDistanceValue] = useState("");

  const handleSubmit = () => {
    const time = timeValue ? parseFloat(timeValue) : undefined;
    const distance = distanceValue ? parseFloat(distanceValue) : undefined;

    if (!time && !distance) {
      Alert.alert("입력 오류", "주행 시간 또는 거리 중 하나는 입력해주세요.");
      return;
    }

    if (time && (isNaN(time) || time < 5 || time > 180)) {
      Alert.alert("입력 오류", "5분 ~ 180분 사이의 시간을 입력해주세요.");
      return;
    }

    if (distance && (isNaN(distance) || distance < 0.2 || distance > 8.0)) {
      Alert.alert("입력 오류", "0.2km ~ 8.0km 사이의 거리를 입력해주세요.");
      return;
    }

    onSubmit({
      mode: selectedMode,
      time,
      distance,
    });
    
    // 입력값 초기화
    setTimeValue("");
    setDistanceValue("");
    onClose();
  };

  const handleClose = () => {
    setTimeValue("");
    setDistanceValue("");
    onClose();
  };

  const quickTimeValues = [10, 20, 30, 45, 60, 90];
  const quickDistanceValues = [0.5, 1.0, 2.0, 3.0, 5.0, 8.0];

  // 모든 필수 정보가 입력되었는지 확인
  const isComplete = selectedMode && (timeValue || distanceValue);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            {/* 헤더 */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.title}>자전거 탈거유 말거유</Text>
              <TouchableOpacity 
                style={[styles.checkButton, !isComplete && styles.checkButtonDisabled]}
                onPress={isComplete ? handleSubmit : undefined}
              >
                <Text style={[styles.checkButtonText, !isComplete && styles.checkButtonTextDisabled]}>✓</Text>
              </TouchableOpacity>
            </View>

            {/* 모드 선택 탭 */}
            <View style={styles.modeSelector}>
              <TouchableOpacity
                style={[
                  styles.modeTab,
                  selectedMode === 'bike' && styles.modeTabActive
                ]}
                onPress={() => setSelectedMode('bike')}
              >
                <Text style={[
                  styles.modeTabText,
                  selectedMode === 'bike' && styles.modeTabTextActive
                ]}>
                  자전거
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeTab,
                  selectedMode === 'walk' && styles.modeTabActive
                ]}
                onPress={() => setSelectedMode('walk')}
              >
                <Text style={[
                  styles.modeTabText,
                  selectedMode === 'walk' && styles.modeTabTextActive
                ]}>
                  걷기
                </Text>
              </TouchableOpacity>
            </View>

            {/* 주행 시간 입력 */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>
                원하시는 주행 시간을 입력해줘유
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={timeValue}
                  onChangeText={setTimeValue}
                  placeholder="30"
                  placeholderTextColor="#ccc"
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>분</Text>
              </View>
              
              {/* 빠른 선택 버튼들 */}
              <View style={styles.quickButtonsContainer}>
                {quickTimeValues.map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={styles.quickButton}
                    onPress={() => setTimeValue(value.toString())}
                  >
                    <Text style={styles.quickButtonText}>
                      {value}분
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 주행 거리 입력 */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>
                원하시는 주행 거리를 입력해줘유
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={distanceValue}
                  onChangeText={setDistanceValue}
                  placeholder="2.8"
                  placeholderTextColor="#ccc"
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>km</Text>
              </View>
              
              {/* 빠른 선택 버튼들 */}
              <View style={styles.quickButtonsContainer}>
                {quickDistanceValues.map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={styles.quickButton}
                    onPress={() => setDistanceValue(value.toString())}
                  >
                    <Text style={styles.quickButtonText}>
                      {value}km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 하단 일러스트 영역 */}
            <View style={styles.illustrationContainer}>
              <Text style={styles.illustration}>
                {selectedMode === 'bike' ? '🚲' : '🚶‍♂️'}
              </Text>
              <Text style={styles.illustrationText}>
                {isComplete 
                  ? (selectedMode === 'bike' ? 'AI가 따릉이 코스를 추천해드릴게유!' : 'AI가 뚜벅이 코스를 추천해드릴게유!')
                  : '정보를 입력하고 상단 ✓ 버튼을 눌러주세요'
                }
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  closeButton: {
    fontSize: 20,
    color: "#666",
    padding: 4,
    width: 28,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
  },
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkButtonDisabled: {
    backgroundColor: "#ccc",
  },
  checkButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  checkButtonTextDisabled: {
    color: "#999",
  },
  modeSelector: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    padding: 4,
    marginBottom: 24,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  modeTabActive: {
    backgroundColor: Colors.primary,
  },
  modeTabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  modeTabTextActive: {
    color: "#fff",
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    marginBottom: 16,
  },
  input: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    minWidth: 80,
    paddingVertical: 16,
  },
  unit: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
    marginLeft: 8,
  },
  quickButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  quickButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 2,
    marginVertical: 2,
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },
  illustrationContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  illustration: {
    fontSize: 32,
    marginBottom: 8,
  },
  illustrationText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});