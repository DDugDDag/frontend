// src/components/map/RideInputModal.tsx
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

interface RideInputModalProps {
  visible: boolean;
  type: "time" | "distance";
  onClose: () => void;
  onSubmit: (value: number) => void;
}

export default function RideInputModal({
  visible,
  type,
  onClose,
  onSubmit,
}: RideInputModalProps) {
  const [inputValue, setInputValue] = useState("");

  const isTimeMode = type === "time";
  const title = isTimeMode
    ? "원하시는 주행 시간을 입력해줘유"
    : "원하시는 주행 거리를 입력해줘유";
  const unit = isTimeMode ? "분" : "km";
  const placeholder = isTimeMode ? "30" : "2.5";
  const maxValue = isTimeMode ? 180 : 8.0;
  const minValue = isTimeMode ? 5 : 0.2;

  const handleSubmit = () => {
    const value = parseFloat(inputValue);

    if (isNaN(value) || value < minValue || value > maxValue) {
      Alert.alert(
        "입력 오류",
        `${minValue}${unit} ~ ${maxValue}${unit} 사이의 값을 입력해주세요.`
      );
      return;
    }

    onSubmit(value);
    setInputValue("");
    onClose();
  };

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  const quickValues = isTimeMode
    ? [10, 20, 30, 45, 60, 90]
    : [0.5, 1.0, 2.0, 3.0, 5.0, 8.0];

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
              <Text style={styles.title}>{title}</Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* 입력 영역 */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder={placeholder}
                  keyboardType="numeric"
                  autoFocus
                />
                <Text style={styles.unit}>{unit}</Text>
              </View>
            </View>

            {/* 빠른 선택 버튼들 */}
            <View style={styles.quickSelectContainer}>
              <Text style={styles.quickSelectTitle}>빠른 선택</Text>
              <View style={styles.quickButtonsContainer}>
                {quickValues.map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={styles.quickButton}
                    onPress={() => setInputValue(value.toString())}
                  >
                    <Text style={styles.quickButtonText}>
                      {value}
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 액션 버튼 */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>확인</Text>
              </TouchableOpacity>
            </View>

            {/* 하단 일러스트 영역 */}
            <View style={styles.illustrationContainer}>
              <Text style={styles.illustration}>🚲</Text>
              <Text style={styles.illustrationText}>
                {isTimeMode ? "즐거운 주행 되세요!" : "안전한 주행 되세요!"}
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
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
  },
  headerSpacer: {
    width: 28,
  },
  inputContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
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
  quickSelectContainer: {
    marginBottom: 24,
  },
  quickSelectTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    textAlign: "center",
  },
  quickButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  quickButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  illustrationContainer: {
    alignItems: "center",
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
