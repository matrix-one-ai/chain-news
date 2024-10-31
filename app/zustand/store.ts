import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;
  walletAddress: string | null;
  isAdmin: boolean;
  setLoggedIn: (loggedIn: boolean) => void;
  setWalletAddress: (address: string) => void;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  walletAddress: null,
  isAdmin: false,
  setLoggedIn: (loggedIn: boolean) => set({ isLoggedIn: loggedIn }),
  setWalletAddress: (address: string) => set({ walletAddress: address }),
  setIsAdmin: (isAdmin: boolean) => set({ isAdmin: isAdmin }),
}));
