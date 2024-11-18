"use client";

import { useCallback } from "react";
import ChatInterface from "./components/ChatInterface";
import LoadingBar from "./components/LoadingBar";
import { Message } from "ai/react";
import { News } from "@prisma/client";
import LiveBanner from "./components/LiveBanner";
import NewsTickerBanner from "./components/NewsTickerBanner";
import { Box, Chip, IconButton, Stack } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsModal from "./components/SettingsModal";
import NewsList from "./components/NewsList";
import {
  useAuthStore,
  useLiveStreamStore,
  useNewsStore,
  usePromptStore,
  useSceneStore,
  useSettingsStore,
} from "./zustand/store";
import PaywallModal from "./components/PaywallModal";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CallToAction from "./components/CallToAction";

interface OverlayProps {
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
  onStreamStart: () => void;
  onStreamStop: () => void;
  onStreamNext: () => void;
  onNewsClick: (newsItem: News | null) => void;
}

const Overlay = ({
  progress,
  isAudioLoading,
  currentLineState,
  onPromptFinish,
  onPromptError,
  onStreamStart,
  onStreamStop,
  onStreamNext,
  onNewsClick,
}: OverlayProps) => {
  const { prompt } = usePromptStore();
  const { isLoggedIn, isAdmin, credits, isSubscribed } = useAuthStore();
  const { news } = useNewsStore();
  const { isStreaming } = useLiveStreamStore();
  const {
    isSubtitlesVisible,
    isPromptUnlocked,
    customPrompt,
    isOverlayHidden,
    setIsSettingsOpen,
  } = useSettingsStore();
  const { isPlaying } = useSceneStore();

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
      {!isSubscribed && !isAdmin && <CallToAction />}

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

        {isLoggedIn && !isAdmin && (
          <Chip
            icon={<MonetizationOnIcon />}
            label={`Credits: ${credits}`}
            sx={{
              backgroundColor: "#2A223C",
            }}
          />
        )}

        <ChatInterface
          isVisible={!isStreaming && !isPlaying && !isOverlayHidden}
          prompt={prompt}
          isAudioLoading={isAudioLoading}
          customPrompt={customPrompt}
          isPromptUnlocked={isPromptUnlocked}
          handleOnFinish={onPromptFinish}
          handleOnError={onStreamNext}
        />

        <NewsList onNewsClick={onNewsClick} isVisible={!isOverlayHidden} />
      </Stack>

      <NewsTickerBanner newsItems={news} />

      {(isStreaming || isPlaying) && (
        <LiveBanner
          currentSpeaker={currentLineState.speaker}
          subtitleText={currentLineState.text}
          isSubtitlesVisible={isSubtitlesVisible}
        />
      )}

      <SettingsModal
        isPlaying={isPlaying}
        onStartStream={onStreamStart}
        onStopStream={onStreamStop}
      />
      <PaywallModal />
    </Box>
  );
};

export default Overlay;
