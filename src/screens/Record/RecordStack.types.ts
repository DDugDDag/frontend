// src/screens/Record/RecordStack.types.ts
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RecordStackParamList } from './RecordStack';

export type RecordStackNav<T extends keyof RecordStackParamList = keyof RecordStackParamList> =
  NativeStackNavigationProp<RecordStackParamList, T>;

export type RecordStackScreenProps<T extends keyof RecordStackParamList> =
  NativeStackScreenProps<RecordStackParamList, T>;

export type RecordStackRouteProp<T extends keyof RecordStackParamList> =
  RecordStackScreenProps<T>['route']; // ✅ RouteProp 대체
