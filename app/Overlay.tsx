"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ChatInterface from "./components/ChatInterface";
import LoadingBar from "./components/LoadingBar";
import { Message } from "ai/react";
import { News } from "@prisma/client";
import LiveBanner from "./components/LiveBanner";
import NewsTickerBanner from "./components/NewsTickerBanner";
import { Box, IconButton } from "@mui/material";
import WaterMark from "./components/WaterMark";
import {
  concludeNewsPrompt,
  jokeBreakPrompt,
  nextSegmentPrompt,
  startNewsPrompt,
  streamPromoPrompt,
} from "./helpers/prompts";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsModal from "./components/SettingsModal";
import NewsList from "./components/NewsList";

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
  const [segmentDuration, setSegmentDuration] = useState<number>(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSubtitlesVisible, setIsSubtitlesVisible] = useState<boolean>(true);

  const handleNewsClick = useCallback(
    (newsItem: News) => {
      setSelectedNews(newsItem);
      const prompt = startNewsPrompt(newsItem, segmentDuration);
      setPrompt(prompt);
    },
    [segmentDuration, setSelectedNews]
  );

  const [currentNewsIndex, setCurrentNewsIndex] = useState(-1);

  const switchNextNewsItem = useCallback(() => {
    setCurrentNewsIndex((prevIndex) => prevIndex + 1);
  }, []);

  useEffect(() => {
    if (isStreaming && isPlaying) {
      const newsItem = newsItems[currentNewsIndex];

      console.log("getting next news item", newsItem);

      let prompt = "";

      if (!newsItem) {
        setIsPlaying(false);
        setCurrentNewsIndex(-1);
        setSelectedNews(null);
        prompt = concludeNewsPrompt();
      } else if (currentNewsIndex === 0) {
        setSelectedNews(newsItem);
        prompt = startNewsPrompt(newsItem, segmentDuration);
      } else if (currentNewsIndex % 3 === 0) {
        setSelectedNews(null);
        prompt = streamPromoPrompt();
      } else if (currentNewsIndex % 10 === 0) {
        setSelectedNews(null);
        prompt = jokeBreakPrompt();
      } else {
        setSelectedNews(newsItem);
        prompt = nextSegmentPrompt(newsItem);
      }

      setPrompt(prompt);
    }
  }, [
    currentNewsIndex,
    newsItems,
    setSelectedNews,
    setIsPlaying,
    isStreaming,
    isPlaying,
    segmentDuration,
  ]);

  const handleStreamStart = useCallback(() => {
    setIsPlaying(true);
    setIsSettingsOpen(false);
    switchNextNewsItem();
  }, [setIsPlaying, switchNextNewsItem]);

  const handleStreamStop = useCallback(() => {
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

  const prevIsPlayingRef = useRef<boolean>(isPlaying);

  useEffect(() => {
    const prevIsPlaying = prevIsPlayingRef.current;

    if (prevIsPlaying && !isPlaying && isStreaming) {
      // isPlaying changed from true to false, and streaming is active
      setIsPlaying(true);
      switchNextNewsItem();
    }

    prevIsPlayingRef.current = isPlaying;
  }, [isPlaying, isStreaming, setIsPlaying, switchNextNewsItem]);

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
        onClose={() => setIsSettingsOpen(false)}
        onToggleStreaming={() => setIsStreaming((prev) => !prev)}
        onStartStream={handleStreamStart}
        onStopStream={handleStreamStop}
        onSegmentDurationChange={setSegmentDuration}
        onToggleSubtitles={() => setIsSubtitlesVisible((prev) => !prev)}
      />

      <ChatInterface
        isStreaming={isStreaming || isPlaying}
        prompt={prompt}
        isAudioLoading={isAudioLoading}
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
    </Box>
  );
};

export default Overlay;
