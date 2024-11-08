"use client";

import { useCallback, useEffect } from "react";
import ChatInterface from "./components/ChatInterface";
import LoadingBar from "./components/LoadingBar";
import { Message } from "ai/react";
import { News } from "@prisma/client";
import LiveBanner from "./components/LiveBanner";
import NewsTickerBanner from "./components/NewsTickerBanner";
import { Box, IconButton, Tooltip } from "@mui/material";
import {
  chatsResponsePrompt,
  concludeNewsPrompt,
  jokeBreakPrompt,
  nextSegmentPrompt,
  startNewsPrompt,
  // streamPromoPrompt,
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
  useSettingsStore,
} from "./zustand/store";
import UserPage from "./components/UserPage/UserPage";
import PaywallModal from "./components/PaywallModal";

interface OverlayProps {
  selectedNews: News | null;
  audioRef: React.RefObject<HTMLAudioElement>;
  progress: number;
  isAudioLoading: boolean;
  isPlaying: boolean;
  currentLineState: {
    lineIndex: number;
    speaker: string;
    text: string;
    audioBlob: Blob | null;
    blendShapes: any[];
  };
  onPromptFinish: (message: Message, options: any) => void;
  onPromptError: (error: any) => void;
  setSelectedNews: React.Dispatch<React.SetStateAction<News | null>>;
  setAudioBlob: (blob: Blob | null) => void;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
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
  selectedNews,
  audioRef,
  progress,
  isAudioLoading,
  currentLineState,
  isPlaying,
  onPromptFinish,
  onPromptError,
  setSelectedNews,
  setAudioBlob,
  setIsPlaying,
  setScriptLines,
  setCurrentLineState,
}: OverlayProps) => {
  const { prompt, setPrompt } = usePromptStore();
  const { isLoggedIn, isAdmin } = useAuthStore();
  const { news } = useNewsStore();

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

  const { setIsPaywallModalOpen } = useOverlayStore();

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
    } else if (!newsItem) {
      // Handle Conclusion
      setSelectedNews(null);
      prompt = concludeNewsPrompt();
      setLastSegmentType("chat");
      setCurrentSegmentIndex(0); // infinite loop replay stream
    } else if (currentSegmentIndex === 0) {
      // Handle Start of News
      setSelectedNews(newsItem);
      prompt = isPromptUnlocked
        ? customPrompt
        : startNewsPrompt(newsItem, segmentDuration);
      setLastSegmentType("news");
      setCurrentSegmentIndex(currentSegmentIndex + 1);
    }
    // else if (currentSegmentIndex % 5 === 0) {
    //   setSelectedNews(null);
    //   setCurrentSegmentIndex(currentSegmentIndex + 1);
    //   prompt = streamPromoPrompt();
    //   setLastSegmentType('promo');
    // }
    else if (currentSegmentIndex % 4 === 0) {
      // Handle Joke Breaks
      setSelectedNews(null);
      setCurrentSegmentIndex(currentSegmentIndex + 1);
      prompt = jokeBreakPrompt();
      setLastSegmentType("joke");
    } else {
      // Handle Next News Segment
      setSelectedNews(newsItem);
      prompt = nextSegmentPrompt(newsItem);
      setLastSegmentType("news");
      setCurrentSegmentIndex(currentSegmentIndex + 1);
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
    setLastSegmentType,
    setCurrentSegmentIndex,
    isPromptUnlocked,
    customPrompt,
    segmentDuration,
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
        setSelectedNews(newsItem);
        if (isPromptUnlocked) {
          setPrompt(customPrompt);
        } else {
          const prompt = startNewsPrompt(newsItem, segmentDuration);
          setPrompt(prompt);
        }
      } else {
        console.log("User not logged in");
      }
    },
    [
      isLoggedIn,
      setSelectedNews,
      isPromptUnlocked,
      setPrompt,
      customPrompt,
      segmentDuration,
    ]
  );

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
  }, [
    setStreamStarted,
    setSelectedNews,
    setIsStreaming,
    setAudioBlob,
    audioRef,
    setPrompt,
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
  }, [
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

  useEffect(() => {
    setIsPaywallModalOpen(true);
  }, [setIsPaywallModalOpen]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 40,
        left: 0,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        flexDirection: "column",
        height: "calc(100vh - 40px)",
        touchAction: "none",
        userSelect: "none",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {progress < 100 && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1002,
          }}
        >
          <LoadingBar progress={progress} />
        </div>
      )}

      <Tooltip
        title={
          !isLoggedIn
            ? "You need to login to use settings"
            : isAdmin
            ? ""
            : "You need to be an admin to use settings"
        }
        disableFocusListener={isLoggedIn && isAdmin}
        disableHoverListener={isLoggedIn && isAdmin}
        disableTouchListener={isLoggedIn && isAdmin}
        disableInteractive={isLoggedIn && isAdmin}
        placement="right"
      >
        <span>
          <IconButton
            aria-label="settings"
            onClick={onSettingsClick}
            sx={{
              touchAction: "all",
              userSelect: "all",
              pointerEvents: "all",
              ...((isPlaying || isStreaming) && {
                position: "fixed",
                top: 60,
                left: 0,
              }),
            }}
          >
            <SettingsIcon />
          </IconButton>
        </span>
      </Tooltip>

      <SettingsModal
        isPlaying={isPlaying}
        onStartStream={handleStreamStart}
        onStopStream={handleStreamStop}
      />

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

      <NewsTickerBanner newsItems={news} />

      <UserPage />

      <PaywallModal />
    </Box>
  );
};

export default Overlay;
