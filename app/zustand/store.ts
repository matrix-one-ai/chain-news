import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;
  walletAddress: string | null;
  setLoggedIn: (loggedIn: boolean) => void;
  setWalletAddress: (address: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  walletAddress: null,
  setLoggedIn: (loggedIn: boolean) => set({ isLoggedIn: loggedIn }),
  setWalletAddress: (address: string) => set({ walletAddress: address }),
}));
