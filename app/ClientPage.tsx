"use client";

import React, { useRef, useState, useCallback } from "react";
import { News } from "@prisma/client";
import Overlay from "./Overlay";
import Scene from "./Scene";

interface ClientHomeProps {
  newsData: News[];
}

const ClientHome: React.FC<ClientHomeProps> = ({ newsData }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [blendShapes, setBlendShapes] = useState<any[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const fetchAudio = useCallback(async (text: string, voiceId: string) => {
    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice: voiceId,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const { audioData, blendShapes } = data;

      const audioBuffer = Uint8Array.from(atob(audioData), (c) =>
        c.charCodeAt(0)
      );
      const blob = new Blob([audioBuffer], { type: "audio/ogg" });

      setAudioBlob(blob);
      setBlendShapes(blendShapes);
    } catch (error) {
      console.error("Error fetching audio:", error);
    } finally {
      setIsAudioLoading(false);
    }
  }, []);

  return (
    <>
      <Scene
        selectedNews={selectedNews}
        audioRef={audioRef}
        audioBlob={audioBlob}
        blendShapes={blendShapes}
        setProgress={setProgress}
      />

      <Overlay
        newsItems={newsData}
        progress={progress}
        isAudioLoading={isAudioLoading}
        fetchAudio={fetchAudio}
        setIsAudioLoading={setIsAudioLoading}
        setSelectedNews={setSelectedNews}
      />

      <audio ref={audioRef} />
    </>
  );
};

export default ClientHome;
