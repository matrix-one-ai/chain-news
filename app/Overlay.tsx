"use client";

import { useCallback, useEffect, useState } from "react";
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
  customPromptDefault,
  jokeBreakPrompt,
  nextSegmentPrompt,
  startNewsPrompt,
  // streamPromoPrompt,
} from "./helpers/prompts";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsModal from "./components/SettingsModal";
import NewsList from "./components/NewsList";
import PlayerPanel from "./components/PlayerPanel";
import { useAuthStore } from "./zustand/store";

interface OverlayProps {
  selectedNews: News | null;
  newsItems: News[];
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
  newsItems,
  audioRef,
  progress,
  isAudioLoading,
  currentLineState,
  isPlaying,
  onPromptFinish,
  setSelectedNews,
  setAudioBlob,
  setIsPlaying,
  setScriptLines,
  setCurrentLineState,
}: OverlayProps) => {
  const [prompt, setPrompt] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamStarted, setStreamStarted] = useState<boolean>(false);
  const [segmentDuration, setSegmentDuration] = useState<number>(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSubtitlesVisible, setIsSubtitlesVisible] = useState<boolean>(true);
  const [isPromptUnlocked, setIsPromptUnlocked] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>(
    customPromptDefault()
  );

  const [currentNewsIndex, setCurrentNewsIndex] = useState(-1);
  const [lastSegmentType, setLastSegmentType] = useState<
    "chat" | "news" | "joke" | null
  >(null);

  const { isLoggedIn, isAdmin } = useAuthStore();

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

  // streaming loop
  useEffect(() => {
    const main = async () => {
      const newsItem = newsItems[currentNewsIndex];

      console.log("Getting next news item:", newsItem);
      console.log("Current News Index:", currentNewsIndex);

      let prompt = "";

      const chats = await fetchChats();

      if (
        chats?.length > 0 &&
        lastSegmentType !== "chat" &&
        currentNewsIndex > 0
      ) {
        // Handle Chat Segment
        setSelectedNews(null);
        prompt = chatsResponsePrompt(chats);
        setLastSegmentType("chat");
        setCurrentNewsIndex((prev) => prev + 1);
      } else if (!newsItem) {
        // Handle Conclusion
        setIsPlaying(false);
        setCurrentNewsIndex(-1);
        setSelectedNews(null);
        prompt = concludeNewsPrompt();
        setLastSegmentType(null);
      } else if (currentNewsIndex === 0) {
        // Handle Start of News
        setSelectedNews(newsItem);
        prompt = isPromptUnlocked
          ? customPrompt
          : startNewsPrompt(newsItem, segmentDuration);
        setLastSegmentType("news");
        setCurrentNewsIndex((prev) => prev + 1);
      }
      // else if (currentNewsIndex % 5 === 0) {
      //   setSelectedNews(null);
      //   setCurrentNewsIndex((prev) => prev + 1);
      //   prompt = streamPromoPrompt();
      //   setLastSegmentType('promo');
      // }
      else if (currentNewsIndex % 4 === 0) {
        // Handle Joke Breaks
        setSelectedNews(null);
        setCurrentNewsIndex((prev) => prev + 1);
        prompt = jokeBreakPrompt();
        setLastSegmentType("joke");
      } else {
        // Handle Next News Segment
        setSelectedNews(newsItem);
        prompt = nextSegmentPrompt(newsItem);
        setLastSegmentType("news");
        setCurrentNewsIndex((prev) => prev + 1);
      }

      setIsPlaying(true);
      setPrompt(prompt);
    };

    if (isStreaming && !isPlaying && streamStarted) {
      main();
    }
  }, [
    currentNewsIndex,
    customPrompt,
    fetchChats,
    isPlaying,
    isPromptUnlocked,
    isStreaming,
    newsItems,
    segmentDuration,
    setIsPlaying,
    setSelectedNews,
    streamStarted,
    lastSegmentType,
  ]);

  const handleNewsClick = useCallback(
    (newsItem: News) => {
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
      customPrompt,
      isPromptUnlocked,
      segmentDuration,
      setSelectedNews,
    ]
  );

  const handleStreamStart = useCallback(() => {
    setCurrentNewsIndex(0); // sets -1 to 0
    setStreamStarted(true);
    setIsSettingsOpen(false);
  }, []);

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
  }, [setSelectedNews, setAudioBlob, audioRef]);

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

    const nextNews = newsItems[currentNewsIndex + 1];

    const prompt = nextSegmentPrompt(nextNews);
    setSelectedNews(nextNews);
    setPrompt(prompt);
  }, [
    audioRef,
    currentNewsIndex,
    newsItems,
    setAudioBlob,
    setCurrentLineState,
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
    setScriptLines,
    setSelectedNews,
  ]);

  const onSettingsClick = useCallback(() => {
    if (isLoggedIn && isAdmin) {
      setIsSettingsOpen(true);
    }
  }, [isAdmin, isLoggedIn]);

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
        isOpen={isSettingsOpen && isLoggedIn}
        isStreaming={isStreaming}
        isPlaying={isPlaying}
        segmentDuration={segmentDuration}
        isSubtitlesVisible={isSubtitlesVisible}
        isPromptUnlocked={isPromptUnlocked}
        customPrompt={customPrompt}
        onClose={() => setIsSettingsOpen(false)}
        onToggleStreaming={() => setIsStreaming((prev) => !prev)}
        onStartStream={handleStreamStart}
        onStopStream={handleStreamStop}
        onSegmentDurationChange={setSegmentDuration}
        onToggleSubtitles={() => setIsSubtitlesVisible((prev) => !prev)}
        onTogglePromptUnlock={() => setIsPromptUnlocked((prev) => !prev)}
        setCustomPrompt={setCustomPrompt}
      />

      <ChatInterface
        isStreaming={isStreaming || isPlaying}
        prompt={prompt}
        isAudioLoading={isAudioLoading}
        customPrompt={customPrompt}
        isPromptUnlocked={isPromptUnlocked}
        handleOnFinish={onPromptFinish}
      />

      <NewsList
        newsItems={newsItems}
        onNewsClick={handleNewsClick}
        isVisible={!isStreaming && !isPlaying}
      />

      {(isStreaming || isPlaying) && (
        <>
          <LiveBanner
            currentSpeaker={
              currentLineState.speaker === "HOST1" ? "Sam" : "DogWifHat"
            }
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

      <NewsTickerBanner newsItems={newsItems} />
    </Box>
  );
};

export default Overlay;
