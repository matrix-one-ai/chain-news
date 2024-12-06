import { create } from "zustand";
import { customPromptDefault } from "../helpers/prompts";
import { News } from "@prisma/client";
import { AtLeast } from "../types/common";

export interface AvatarConfig {
  name: string;
  vrmKey: string;
  rotation: [number, number, number];
}

const avatarConfigs: AvatarConfig[] = [
  {
    name: "Sami",
    vrmKey: "woman-2",
    rotation: [0, Math.PI, 0],
  },
  {
    name: "Haiku",
    vrmKey: "haiku",
    rotation: [0, Math.PI, 0],
  },
];

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
  email: string | null;
  isAdmin: boolean;
  imageUrl: string | null;
  isSubscribed: boolean;
  triggerWeb3AuthModal: boolean;
  subscriptionEndTime: number;
  credits: number;
  setLoggedIn: (loggedIn: boolean) => void;
  setWalletAddress: (address: string) => void;
  setNickname: (nickname: string) => void;
  setEmail: (email: string) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setImageUrl: (url: string) => void;
  setIsSubscribed: (isSubscribed: boolean) => void;
  setTriggerWeb3AuthModal: (triggerWeb3AuthModal: boolean) => void;
  setSubscriptionEndTime: (time: number) => void;
  setCredits: (credits: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  walletAddress: null,
  nickname: null,
  email: null,
  isAdmin: false,
  imageUrl: null,
  isSubscribed: false,
  triggerWeb3AuthModal: false,
  subscriptionEndTime: 0,
  credits: 0,
  setLoggedIn: (loggedIn: boolean) => set({ isLoggedIn: loggedIn }),
  setWalletAddress: (address: string) => set({ walletAddress: address }),
  setNickname: (nickname: string) => set({ nickname: nickname }),
  setEmail: (email: string) => set({ email: email }),
  setIsAdmin: (isAdmin: boolean) => set({ isAdmin: isAdmin }),
  setImageUrl: (url: string) => set({ imageUrl: url }),
  setIsSubscribed: (isSubscribed: boolean) =>
    set({ isSubscribed: isSubscribed }),
  setTriggerWeb3AuthModal: (triggerWeb3AuthModal: boolean) =>
    set({ triggerWeb3AuthModal }),
  setSubscriptionEndTime: (time: number) => set({ subscriptionEndTime: time }),
  setCredits: (credits: number) => set({ credits: credits }),
}));

interface OverlayState {
  isSpinnerOverlayOpen: boolean;
  isPaywallModalOpen: boolean;
  setIsSpinnerOverlayOpen: (isSpinnerOverlayOpen: boolean) => void;
  setIsPaywallModalOpen: (isOpen: boolean) => void;
}

export const useOverlayStore = create<OverlayState>((set) => ({
  isSpinnerOverlayOpen: true,
  isPaywallModalOpen: false,
  setIsSpinnerOverlayOpen: (isSpinnerOverlayOpen: boolean) =>
    set({ isSpinnerOverlayOpen }),
  setIsPaywallModalOpen: (isOpen: boolean) =>
    set({ isPaywallModalOpen: isOpen }),
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
  isOverlayHidden: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setIsSubtitlesVisible: (isVisible: boolean) => void;
  setIsPromptUnlocked: (isUnlocked: boolean) => void;
  setCustomPrompt: (prompt: string) => void;
  setShowTraderViewWidget: (show: boolean) => void;
  setIsOverlayHidden: (hide: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isSettingsOpen: false,
  isSubtitlesVisible: true,
  isPromptUnlocked: false,
  customPrompt: customPromptDefault(avatarConfigs[0]),
  showTraderViewWidget: false,
  isOverlayHidden: false,
  setIsSettingsOpen: (isOpen: boolean) => set({ isSettingsOpen: isOpen }),
  setIsSubtitlesVisible: (isVisible: boolean) =>
    set({ isSubtitlesVisible: isVisible }),
  setIsPromptUnlocked: (isUnlocked: boolean) =>
    set({ isPromptUnlocked: isUnlocked }),
  setCustomPrompt: (prompt: string) => set({ customPrompt: prompt }),
  setShowTraderViewWidget: (show: boolean) =>
    set({ showTraderViewWidget: show }),
  setIsOverlayHidden: (hide: boolean) => set({ isOverlayHidden: hide }),
}));

interface SystemMessage {
  content: string;
  role: "user";
  createdAt: Date;
}

interface PromptState {
  prompt: string;
  systemMessages: SystemMessage[];
  setPrompt: (prompt: string) => void;
  setSystemMessages: (messages: string[]) => void;
  addSystemMessage: (message: string) => void;
}

export const usePromptStore = create<PromptState>((set) => ({
  prompt: "",
  systemMessages: [],
  setPrompt: (prompt: string) => set({ prompt: prompt }),
  setSystemMessages: (messages: string[]) =>
    set(() => ({
      systemMessages: messages.map((content) => ({
        content,
        role: "user",
        createdAt: new Date(),
      })),
    })),
  addSystemMessage: (message: string) =>
    set((state) => ({
      systemMessages: [
        ...state.systemMessages,
        { content: message, role: "user", createdAt: new Date() },
      ],
    })),
}));

interface NewsState {
  news: News[];
  newsSearchOptions: AtLeast<News, "category" | "title">[];
  page: number;
  pageSize: number;
  totalPage: number;
  fetching: boolean;
  fetchingSearchOptions: boolean;
  selectedNews: News | null;
  setNews: (news: News[]) => void;
  addNews: (newNews: News[]) => void;
  setNewsSearchOptions: (
    newsSearchOptions: AtLeast<News, "category" | "title">[],
  ) => void;
  setPage: (page: number) => void;
  setTotalPage: (totalPage: number) => void;
  incrementPage: () => void;
  setFetching: (fetching: boolean) => void;
  setFetchingSearchOptions: (fetchingSearchOptions: boolean) => void;
  setSelectedNews: (selectedNews: News | null) => void;
}

export const useNewsStore = create<NewsState>((set) => ({
  news: [],
  newsSearchOptions: [],
  page: 1,
  pageSize: 20,
  totalPage: 1,
  fetching: false,
  fetchingSearchOptions: false,
  selectedNews: null,
  setNews: (news) => set(() => ({ news })),
  addNews: (newNews) => set((state) => ({ news: [...state.news, ...newNews] })),
  setNewsSearchOptions: (newsSearchOptions) =>
    set(() => ({ newsSearchOptions })),
  setPage: (page) => set(() => ({ page })),
  setTotalPage: (totalPage) => set(() => ({ totalPage })),
  incrementPage: () =>
    set((state) => {
      if (state.fetching || state.page >= state.totalPage) return state;

      return { page: state.page + 1 };
    }),
  setFetching: (fetching) => set(() => ({ fetching })),
  setFetchingSearchOptions: (fetchingSearchOptions) =>
    set(() => ({ fetchingSearchOptions })),
  setSelectedNews: (selectedNews) => set(() => ({ selectedNews })),
}));

interface SceneState {
  isPlaying: boolean;
  isPaused: boolean;
  mainHostAvatar: AvatarConfig;
  avatarConfigs: AvatarConfig[];
  setIsPlaying: (isPlaying: boolean) => void;
  setIsPaused: (isPaused: boolean) => void;
  setMainHostAvatar: (avatar: AvatarConfig) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  isPlaying: false,
  isPaused: false,
  mainHostAvatar: avatarConfigs[0],
  avatarConfigs: avatarConfigs,
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  setIsPaused: (isPaused: boolean) => set({ isPaused }),
  setMainHostAvatar: (avatar: AvatarConfig) => set({ mainHostAvatar: avatar }),
}));

interface NavbarState {
  isUserTabsOpen: boolean;
  setIsUserTabsOpen: (isUserTabsOpen: boolean) => void;
  toggleIsUserTabsOpen: () => void;
}

export const useNavbarState = create<NavbarState>((set) => ({
  isUserTabsOpen: false,
  setIsUserTabsOpen: (isUserTabsOpen: boolean) => set({ isUserTabsOpen }),
  toggleIsUserTabsOpen: () =>
    set((state) => ({ isUserTabsOpen: !state.isUserTabsOpen })),
}));
