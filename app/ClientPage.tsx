"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { News } from "@prisma/client";
import Overlay from "./Overlay";
import Scene from "./Scene";
import { azureVoices } from "./helpers/azureVoices";
import { Message } from "ai";

interface ClientHomeProps {
  newsData: News[];
}

const ClientHome: React.FC<ClientHomeProps> = ({ newsData }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [responseTime, setResponseTime] = useState<string>("");

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [blendShapes, setBlendShapes] = useState<any[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  const [selectedVoice, setSelectedVoice] = useState<string>(
    azureVoices[0].value
  );

  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const [scriptLines, setScriptLines] = useState<
    {
      text: string;
    }[]
  >([]);

  const currentLineIndexRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

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

  useEffect(() => {
    const audio = audioRef?.current;
    const nextLine = () => {
      const nextLineIndex = currentLineIndexRef.current + 1;
      currentLineIndexRef.current = nextLineIndex;
      if (nextLineIndex < scriptLines.length) {
        fetchAudio(scriptLines[nextLineIndex].text, selectedVoice);
      }
    };
    if (audio) {
      audio.addEventListener("ended", () => {
        nextLine();
      });
    }
    return () => {
      audio?.removeEventListener("ended", () => {
        nextLine();
      });
    };
  }, [audioRef, fetchAudio, scriptLines, selectedVoice, setIsAudioLoading]);

  const onPromptFinish = useCallback(
    (message: Message, options: any) => {
      console.log(message, options);
      console.log(message.content.split("\n"));
      const parsedLines = message.content
        .split("\n")
        .filter((message) => message.length > 0)
        .map((line) => {
          console.log(line);
          return { text: line };
        });
      console.log(parsedLines);
      setScriptLines(parsedLines);
      setIsAudioLoading(true);
      fetchAudio(parsedLines[0].text, selectedVoice).then(() => {
        const endTime = performance.now();
        const timeTaken = ((endTime - startTimeRef.current) / 1000).toFixed(2);
        setResponseTime(timeTaken);
      });
    },
    [fetchAudio, selectedVoice, setIsAudioLoading]
  );

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
        audioRef={audioRef}
        progress={progress}
        isAudioLoading={isAudioLoading}
        selectedNews={selectedNews}
        selectedVoice={selectedVoice}
        scriptLines={scriptLines}
        startTimeRef={startTimeRef}
        responseTime={responseTime}
        onPromptFinish={onPromptFinish}
        setSelectedVoice={setSelectedVoice}
        fetchAudio={fetchAudio}
        setSelectedNews={setSelectedNews}
        setAudioBlob={setAudioBlob}
      />

      <audio ref={audioRef} />
    </>
  );
};

export default ClientHome;
