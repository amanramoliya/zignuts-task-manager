"use client";

import { create } from "zustand";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));

const auth = getAuth(firebaseApp);

onAuthStateChanged(auth, (user) => {
  const { setUser, setLoading } = useAuthStore.getState();
  setUser(user);
  setLoading(false);
});
