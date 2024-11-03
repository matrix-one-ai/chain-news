import { create } from "zustand";
import { customPromptDefault } from "../helpers/prompts";

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

interface OverlayState {
  isUserPageOpen: boolean;
  setIsUserPageOpen: (isOpen: boolean) => void;
}

export const useOverlayState = create<OverlayState>((set) => ({
  isUserPageOpen: false,
  setIsUserPageOpen: (isOpen: boolean) => set({ isUserPageOpen: isOpen }),
}));

interface LiveStreamState {
  isStreaming: boolean;
  streamStarted: boolean;
  segmentDuration: number;
  currentSegmentIndex: number;
  lastSegmentType: "chat" | "news" | "joke" | null;
  setIsStreaming: (isStreaming: boolean) => void;
  setStreamStarted: (streamStarted: boolean) => void;
  setSegmentDuration: (duration: number) => void;
  setCurrentSegmentIndex: (index: number) => void;
  setLastSegmentType: (type: "chat" | "news" | "joke" | null) => void;
}

export const useLiveStreamState = create<LiveStreamState>((set) => ({
  isStreaming: false,
  streamStarted: false,
  segmentDuration: 1,
  currentSegmentIndex: -1,
  lastSegmentType: null,
  setIsStreaming: (isStreaming: boolean) => set({ isStreaming: isStreaming }),
  setStreamStarted: (streamStarted: boolean) =>
    set({ streamStarted: streamStarted }),
  setSegmentDuration: (duration: number) => set({ segmentDuration: duration }),
  setCurrentSegmentIndex: (index: number) =>
    set({ currentSegmentIndex: index }),
  setLastSegmentType: (type: "chat" | "news" | "joke" | null) =>
    set({ lastSegmentType: type }),
}));

interface SettingsState {
  isSettingsOpen: boolean;
  isSubtitlesVisible: boolean;
  isPromptUnlocked: boolean;
  customPrompt: string;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setIsSubtitlesVisible: (isVisible: boolean) => void;
  setIsPromptUnlocked: (isUnlocked: boolean) => void;
  setCustomPrompt: (prompt: string) => void;
}

export const useSettingsState = create<SettingsState>((set) => ({
  isSettingsOpen: false,
  isSubtitlesVisible: false,
  isPromptUnlocked: false,
  customPrompt: customPromptDefault(),
  setIsSettingsOpen: (isOpen: boolean) => set({ isSettingsOpen: isOpen }),
  setIsSubtitlesVisible: (isVisible: boolean) =>
    set({ isSubtitlesVisible: isVisible }),
  setIsPromptUnlocked: (isUnlocked: boolean) =>
    set({ isPromptUnlocked: isUnlocked }),
  setCustomPrompt: (prompt: string) => set({ customPrompt: prompt }),
}));
