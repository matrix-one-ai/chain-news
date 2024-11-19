"use client";

import React, { useState, useEffect } from "react";
import Overlay from "./Overlay";
import Scene from "./Scene";
import { useAppMountedStore } from "./zustand/store";
import { useStream } from "./hooks/useStream";

const ClientHome: React.FC = () => {
  const { setMounted } = useAppMountedStore();
  const {
    audioRef,
    isAudioLoading,
    currentLineState,
    onPromptFinish,
    onPromptError,
    onStreamStart,
    onStreamStop,
    onStreamNext,
    onNewsClick,
  } = useStream();
  const [progress, setProgress] = useState<number>(0);

  // * In development env, react component will be mounted 2 times due to react strict mode.
  // * This is a hack to prevent that.
  useEffect(() => {
    setMounted();
  }, [setMounted]);

  return (
    <>
      <Scene
        audioRef={audioRef}
        audioBlob={currentLineState.audioBlob}
        blendShapes={currentLineState.blendShapes}
        speaker={currentLineState.speaker}
        setProgress={setProgress}
      />

      <Overlay
        progress={progress}
        isAudioLoading={isAudioLoading}
        currentLineState={currentLineState}
        onPromptFinish={onPromptFinish}
        onPromptError={onPromptError}
        onStreamStart={onStreamStart}
        onStreamStop={onStreamStop}
        onStreamNext={onStreamNext}
        onNewsClick={onNewsClick}
      />

      <audio ref={audioRef} />
    </>
  );
};

export default ClientHome;
