import { create } from "zustand";
import { customPromptDefault } from "../helpers/prompts";

interface AppMountedState {
  mounted: boolean;
  setMounted: () => void;
}

export const useAppMountedStore = create<AppMountedState>((set) => ({
  mounted: false,
  setMounted: () => set({ mounted: true }),
}));

interface AuthState {
  isLoggedIn: boolean;
  walletAddress: string | null;
  nickname: string | null;
  isAdmin: boolean;
  imageUrl: string | null;
  setLoggedIn: (loggedIn: boolean) => void;
  setWalletAddress: (address: string) => void;
  setNickname: (nickname: string) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setImageUrl: (url: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  walletAddress: null,
  nickname: null,
  isAdmin: false,
  imageUrl: null,
  setLoggedIn: (loggedIn: boolean) => set({ isLoggedIn: loggedIn }),
  setWalletAddress: (address: string) => set({ walletAddress: address }),
  setNickname: (nickname: string) => set({ nickname: nickname }),
  setIsAdmin: (isAdmin: boolean) => set({ isAdmin: isAdmin }),
  setImageUrl: (url: string) => set({ imageUrl: url }),
}));

interface OverlayState {
  isUserPageOpen: boolean;
  setIsUserPageOpen: (isOpen: boolean) => void;
}

export const useOverlayStore = create<OverlayState>((set) => ({
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

export const useLiveStreamStore = create<LiveStreamState>((set) => ({
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
  showTraderViewWidget: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setIsSubtitlesVisible: (isVisible: boolean) => void;
  setIsPromptUnlocked: (isUnlocked: boolean) => void;
  setCustomPrompt: (prompt: string) => void;
  setShowTraderViewWidget: (show: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isSettingsOpen: false,
  isSubtitlesVisible: true,
  isPromptUnlocked: false,
  customPrompt: customPromptDefault(),
  showTraderViewWidget: false,
  setIsSettingsOpen: (isOpen: boolean) => set({ isSettingsOpen: isOpen }),
  setIsSubtitlesVisible: (isVisible: boolean) =>
    set({ isSubtitlesVisible: isVisible }),
  setIsPromptUnlocked: (isUnlocked: boolean) =>
    set({ isPromptUnlocked: isUnlocked }),
  setCustomPrompt: (prompt: string) => set({ customPrompt: prompt }),
  setShowTraderViewWidget: (show: boolean) =>
    set({ showTraderViewWidget: show }),
}));

interface UserPageState {
  selectedUserTab: number;
  setSelectedUserTab: (index: number) => void;
}

export const useUserPageStore = create<UserPageState>((set) => ({
  selectedUserTab: 0,
  setSelectedUserTab: (index: number) => set({ selectedUserTab: index }),
}));

interface PromptState {
  prompt: string;
  setPrompt: (prompt: string) => void;
}

export const usePromptStore = create<PromptState>((set) => ({
  prompt: "",
  setPrompt: (prompt: string) => set({ prompt: prompt }),
}));
