// src/styles/nearby.ts

import { StyleSheet } from 'react-native';

export const nearbyStyles = StyleSheet.create({
  section: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B1E1E',
  },
  sectionAction: {
    fontSize: 14,
    color: '#3B1E1E',
  },
nearbyCard: {
  backgroundColor: '#FFFDEB',
  borderRadius: 16,
  padding: 12,
  alignItems: 'center',
  marginRight: 12, // 옵션
  width: 240,      // ✅ 가로 카드 크기 고정
},
  nearbyImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 8,
  },
  distance: {
    fontSize: 14,
    color: '#3B1E1E',
  },
});
