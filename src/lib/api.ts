// src/lib/api.ts
import * as SecureStore from "expo-secure-store";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = await SecureStore.getItemAsync("jwt");
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
};
