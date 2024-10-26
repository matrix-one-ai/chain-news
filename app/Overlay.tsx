"use client";

import { useCallback, useEffect, useState } from "react";
import ChatInterface from "./components/ChatInterface";
import LoadingBar from "./components/LoadingBar";
import { Message } from "ai/react";
import { News } from "@prisma/client";
import LiveBanner from "./components/LiveBanner";
import NewsTickerBanner from "./components/NewsTickerBanner";
import { Box, IconButton } from "@mui/material";
import WaterMark from "./components/WaterMark";
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
import Web3AuthLogin from "./components/Web3AuthLogin";

interface OverlayProps {
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
}

const Overlay = ({
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
      setSelectedNews(newsItem);
      if (isPromptUnlocked) {
        setPrompt(customPrompt);
      } else {
        const prompt = startNewsPrompt(newsItem, segmentDuration);
        setPrompt(prompt);
      }
    },
    [customPrompt, isPromptUnlocked, segmentDuration, setSelectedNews]
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

  const onSettingsClick = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        flexDirection: "column",
        height: "100%",
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

      <IconButton
        aria-label="settings"
        onClick={onSettingsClick}
        sx={{
          touchAction: "all",
          userSelect: "all",
          pointerEvents: "all",
          ...((isPlaying || isStreaming) && {
            position: "fixed",
            top: 0,
            left: 0,
          }),
        }}
      >
        <SettingsIcon />
      </IconButton>

      <SettingsModal
        isOpen={isSettingsOpen}
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

      {!isStreaming && !isPlaying && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            paddingLeft: "1rem",
          }}
        >
          <WaterMark />
        </Box>
      )}

      {(isStreaming || isPlaying) && (
        <LiveBanner
          currentSpeaker={
            currentLineState.speaker === "HOST1" ? "Sam" : "DogWifHat"
          }
          subtitleText={currentLineState.text}
          isSubtitlesVisible={isSubtitlesVisible}
        />
      )}

      <NewsTickerBanner newsItems={newsItems} />

      <Web3AuthLogin />
    </Box>
  );
};

export default Overlay;
