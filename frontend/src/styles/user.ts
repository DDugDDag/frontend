// src/styles/user.ts
import { StyleSheet } from 'react-native';

export const homeHeaderStyles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginVertical: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 12,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3B1E1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#3B1E1E',
    marginTop: 4,
  },
  weatherCard: {
    backgroundColor: '#FFF4D6',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  weatherTemp: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B1E1E',
  },
  weatherLocation: {
    fontSize: 14,
    color: '#3B1E1E',
    marginBottom: 12,
  },
  weatherButton: {
    backgroundColor: '#5B913B',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  weatherButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
