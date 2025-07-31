// src/stores/useAuthStore.ts
import { create } from "zustand";

type User = {
  id: number;
  nickname: string;
  email: string;
};

type AuthStore = {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  setToken: (token: string) => set({ token }),
  setUser: (user: User) => set({ user }),
  clear: () => set({ token: null, user: null }),
}));