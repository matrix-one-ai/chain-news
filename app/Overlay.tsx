"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import ChatInterface from "./components/ChatInterface";
import LoadingBar from "./components/LoadingBar";
import { Message } from "ai/react";
import { News } from "@prisma/client";
import LiveBanner from "./components/LiveBanner";
import NewsTickerBanner from "./components/NewsTickerBanner";
import { Box, IconButton, Stack } from "@mui/material";
import {
  chatsResponsePrompt,
  concludeNewsPrompt,
  jokeBreakPrompt,
  nextSegmentPrompt,
  startNewsPrompt,
} from "./helpers/prompts";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsModal from "./components/SettingsModal";
import NewsList from "./components/NewsList";
import PlayerPanel from "./components/PlayerPanel";
import {
  useAuthStore,
  useLiveStreamStore,
  useNewsStore,
  useOverlayStore,
  usePromptStore,
  useSceneStore,
  useSettingsStore,
} from "./zustand/store";
import PaywallModal from "./components/PaywallModal";
import { useNewsFetchBySlugOnMount } from "./hooks/useNewsFetch";

interface OverlayProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  progress: number;
  isAudioLoading: boolean;
  currentLineState: {
    lineIndex: number;
    speaker: string;
    text: string;
    audioBlob: Blob | null;
    blendShapes: any[];
  };
  onPromptFinish: (message: Message, options: any) => void;
  onPromptError: (error: any) => void;
  setAudioBlob: (blob: Blob | null) => void;
  setScriptLines: React.Dispatch<
    React.SetStateAction<{ speaker: string; text: string }[]>
  >;
  setCurrentLineState: React.Dispatch<
    React.SetStateAction<{
      lineIndex: number;
      speaker: string;
      text: string;
      audioBlob: Blob | null;
      blendShapes: any[];
    }>
  >;
}

const Overlay = ({
  audioRef,
  progress,
  isAudioLoading,
  currentLineState,
  onPromptFinish,
  onPromptError,
  setAudioBlob,
  setScriptLines,
  setCurrentLineState,
}: OverlayProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { prompt, setPrompt, addSystemMessage } = usePromptStore();
  const { isLoggedIn, isAdmin } = useAuthStore();
  const { news, selectedNews, setSelectedNews } = useNewsStore();
  const initialNews = useNewsFetchBySlugOnMount();

  const {
    isStreaming,
    streamStarted,
    segmentDuration,
    currentSegmentIndex,
    lastSegmentType,
    setIsStreaming,
    setStreamStarted,
    setCurrentSegmentIndex,
    setLastSegmentType,
  } = useLiveStreamStore();

  const {
    isSubtitlesVisible,
    isPromptUnlocked,
    customPrompt,
    setIsSettingsOpen,
  } = useSettingsStore();

  const { isPaywallModalOpen } = useOverlayStore();
  const { isPlaying, mainHostAvatar, setIsPlaying } = useSceneStore();

  const fetchChats = useCallback(async () => {
    try {
      const resp = await fetch("/api/youtube/chats", {
        cache: "no-cache",
      });
      if (resp.ok) {
        const data = await resp.json();
        console.log("got chats", data.chats);
        return data.chats;
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const streamLoop = useCallback(async () => {
    const newsItem = news[currentSegmentIndex];

    console.log("Getting next news item:", newsItem);
    console.log("Current News Index:", currentSegmentIndex);

    let prompt = "";

    const chats = await fetchChats();

    if (
      chats?.length > 0 &&
      lastSegmentType !== "chat" &&
      currentSegmentIndex > 0
    ) {
      // Handle Chat Segment
      setSelectedNews(null);
      prompt = chatsResponsePrompt(chats);
      setLastSegmentType("chat");
      setCurrentSegmentIndex(currentSegmentIndex + 1);
      addSystemMessage(`TERMINAL: Playing Youtube chat segment with ${
        chats.length
      } messages.\nChats:\n
        ${chats
          .map((chat: any) => `${chat.displayName}: ${chat.displayMessage}`)
          .join("\n")}
        `);
    } else if (!newsItem) {
      // Handle Conclusion
      setSelectedNews(null);
      prompt = concludeNewsPrompt();
      setLastSegmentType("chat");
      setCurrentSegmentIndex(0); // infinite loop replay stream
      addSystemMessage(
        `TERMINAL: Stream concluded. Starting from the beginning...`
      );
    } else if (currentSegmentIndex === 0) {
      // Handle Start of News
      setSelectedNews(newsItem);
      prompt = isPromptUnlocked
        ? customPrompt
        : startNewsPrompt(newsItem, segmentDuration, mainHostAvatar);

      setLastSegmentType("news");
      setCurrentSegmentIndex(currentSegmentIndex + 1);
      addSystemMessage(
        `TERMINAL: Welcome! Starting the news...\n${newsItem.title}`
      );
    } else if (currentSegmentIndex % 5 === 0) {
      // Handle Joke Breaks
      setSelectedNews(null);
      setCurrentSegmentIndex(currentSegmentIndex + 1);
      prompt = jokeBreakPrompt();
      setLastSegmentType("joke");
      addSystemMessage(
        `TERMINAL: Joke break time! Entertaining the audience...`
      );
    } else {
      // Handle Next News Segment
      setSelectedNews(newsItem);
      prompt = nextSegmentPrompt(newsItem);
      setLastSegmentType("news");
      setCurrentSegmentIndex(currentSegmentIndex + 1);

      addSystemMessage(
        `TERMINAL: Moving to next article...\n${newsItem.title}`
      );
    }

    setIsPlaying(true);
    setPrompt(prompt);
  }, [
    news,
    currentSegmentIndex,
    fetchChats,
    lastSegmentType,
    setIsPlaying,
    setPrompt,
    setSelectedNews,
    addSystemMessage,
    setLastSegmentType,
    setCurrentSegmentIndex,
    isPromptUnlocked,
    customPrompt,
    segmentDuration,
    mainHostAvatar,
  ]);

  // streaming loop
  useEffect(() => {
    if (isStreaming && !isPlaying && streamStarted) {
      streamLoop();
    }
  }, [currentSegmentIndex, isPlaying, isStreaming, streamLoop, streamStarted]);

  const handleNewsClick = useCallback(
    (newsItem: News | null) => {
      if (newsItem === null) return;

      if (isLoggedIn) {
        // Add/remove query param based on selected news' slug
        if (newsItem?.slug) {
          router.replace(`${pathname}?article=${newsItem.slug}`);
        } else {
          router.replace(pathname);
        }

        setSelectedNews(newsItem);
        if (isPromptUnlocked) {
          setPrompt(customPrompt);
        } else {
          const prompt = startNewsPrompt(
            newsItem,
            segmentDuration,
            mainHostAvatar
          );
          setPrompt(prompt);
        }
        addSystemMessage(
          `TERMINAL: Starting news segment...\n${newsItem.title}`
        );
      } else {
        console.log("User not logged in");
      }
    },
    [
      isLoggedIn,
      setSelectedNews,
      isPromptUnlocked,
      router,
      pathname,
      setPrompt,
      customPrompt,
      segmentDuration,
      mainHostAvatar,
      addSystemMessage,
    ]
  );

  // If search param has slug info initially, then the news corresponding to the slug should be played
  useEffect(() => {
    // ! Closing paywall modal is necessary to confirm that user interacted with the page
    // Should be logged in, and also paywall modal should be closed (because closing paywall modal needs user interaction, and audio can be played after user interaction)
    if (!isLoggedIn || isPaywallModalOpen) return;

    handleNewsClick(initialNews);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNews, isLoggedIn, isPaywallModalOpen]);

  const handleStreamStart = useCallback(() => {
    setCurrentSegmentIndex(0); // sets -1 to 0
    setStreamStarted(true);
    setIsSettingsOpen(false);
  }, [setCurrentSegmentIndex, setIsSettingsOpen, setStreamStarted]);

  const handleStreamStop = useCallback(() => {
    setStreamStarted(false);
    setSelectedNews(null);
    setIsStreaming(false);

    setAudioBlob(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const prompt = concludeNewsPrompt();

    setPrompt(prompt);
    addSystemMessage(`TERMINAL: Stream concluded. Thank you for watching!`);
  }, [
    setStreamStarted,
    setSelectedNews,
    setIsStreaming,
    setAudioBlob,
    audioRef,
    setPrompt,
    addSystemMessage,
  ]);

  const handleNext = useCallback(() => {
    setAudioBlob(null);
    setSelectedNews(null);
    setLastSegmentType(null);
    setScriptLines([]);
    setCurrentLineState({
      lineIndex: 0,
      speaker: "",
      text: "",
      audioBlob: null,
      blendShapes: [],
    });
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const nextNews = news[currentSegmentIndex + 1];

    const prompt = nextSegmentPrompt(nextNews);
    setSelectedNews(nextNews);
    setPrompt(prompt);

    addSystemMessage(`TERMINAL: Moving to next article...\n${nextNews.title}`);
  }, [
    addSystemMessage,
    audioRef,
    currentSegmentIndex,
    news,
    setAudioBlob,
    setCurrentLineState,
    setLastSegmentType,
    setPrompt,
    setScriptLines,
    setSelectedNews,
  ]);

  const handleStop = useCallback(() => {
    setAudioBlob(null);
    setSelectedNews(null);
    setLastSegmentType(null);
    setScriptLines([]);
    setCurrentLineState({
      lineIndex: 0,
      speaker: "",
      text: "",
      audioBlob: null,
      blendShapes: [],
    });
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);
    setIsStreaming(false);
  }, [
    audioRef,
    setAudioBlob,
    setCurrentLineState,
    setIsPlaying,
    setIsStreaming,
    setLastSegmentType,
    setScriptLines,
    setSelectedNews,
  ]);

  const onSettingsClick = useCallback(() => {
    if (isLoggedIn && isAdmin) {
      setIsSettingsOpen(true);
    }
  }, [isAdmin, isLoggedIn, setIsSettingsOpen]);

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        touchAction: "none",
        userSelect: "none",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {progress < 100 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1002,
          }}
        >
          <LoadingBar progress={progress} />
        </div>
      )}

      <Stack
        position="relative"
        flexGrow={1}
        width="100%"
        height={0}
        alignItems="flex-start"
        justifyContent="flex-end"
      >
        {isLoggedIn && isAdmin && (
          <IconButton
            aria-label="settings"
            onClick={onSettingsClick}
            sx={{
              touchAction: "all",
              userSelect: "all",
              pointerEvents: "all",
              ...((isPlaying || isStreaming) && {
                position: "absolute",
                top: 0,
                left: 0,
              }),
            }}
          >
            <SettingsIcon />
          </IconButton>
        )}

        <ChatInterface
          isStreaming={isStreaming || isPlaying}
          prompt={prompt}
          isAudioLoading={isAudioLoading}
          customPrompt={customPrompt}
          isPromptUnlocked={isPromptUnlocked}
          handleOnFinish={onPromptFinish}
          handleOnError={handleNext}
        />

        <NewsList
          onNewsClick={handleNewsClick}
          isVisible={!isStreaming && !isPlaying}
        />
      </Stack>

      <NewsTickerBanner newsItems={news} />

      {(isStreaming || isPlaying) && (
        <>
          <LiveBanner
            currentSpeaker={currentLineState.speaker}
            subtitleText={currentLineState.text}
            isSubtitlesVisible={isSubtitlesVisible}
          />
          <PlayerPanel
            title={selectedNews?.title || "..."}
            isPlaying={isPlaying}
            onPlay={() => console.log("play")}
            onPause={() => console.log("pause")}
            onNext={handleNext}
            onStop={handleStop}
          />
        </>
      )}

      <SettingsModal
        isPlaying={isPlaying}
        onStartStream={handleStreamStart}
        onStopStream={handleStreamStop}
      />
      <PaywallModal />
    </Box>
  );
};

export default Overlay;
