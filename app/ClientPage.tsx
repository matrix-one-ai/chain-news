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

const speakerVoiceMap = {
  HOST1: "en-US-AvaMultilingualNeural",
  HOST2: "en-US-DavisNeural",
};

const ClientHome: React.FC<ClientHomeProps> = ({ newsData }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [responseTime, setResponseTime] = useState<string>("");

  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  const [selectedVoice, setSelectedVoice] = useState<string>(
    azureVoices[0].value
  );

  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const [scriptLines, setScriptLines] = useState<
    {
      speaker: string;
      text: string;
    }[]
  >([]);

  const currentLineIndexRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // State for current and next line
  const [currentLineState, setCurrentLineState] = useState<{
    speaker: string;
    audioBlob: Blob | null;
    blendShapes: any[];
  }>({ speaker: "", audioBlob: null, blendShapes: [] });

  const [nextLineState, setNextLineState] = useState<{
    speaker: string;
    audioBlob: Blob | null;
    blendShapes: any[];
  }>({ speaker: "", audioBlob: null, blendShapes: [] });

  // Fetch audio and blendShapes for a given text and voice
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

      return { blob, blendShapes };
    } catch (error) {
      console.error("Error fetching audio:", error);
      return null;
    }
  }, []);

  // Play the current line and prefetch the next line
  const playCurrentLine = useCallback(async () => {
    const currentIndex = currentLineIndexRef.current;
    if (currentIndex < scriptLines.length) {
      const currentLine = scriptLines[currentIndex];

      // Determine the voice ID based on the speaker
      const voiceId =
        speakerVoiceMap[currentLine.speaker as keyof typeof speakerVoiceMap];

      let audioData, blendShapesData;
      if (currentIndex === 0 || nextLineState.audioBlob === null) {
        setIsAudioLoading(true);
        const result = await fetchAudio(currentLine.text, voiceId);
        setIsAudioLoading(false);
        if (result) {
          audioData = result.blob;
          blendShapesData = result.blendShapes;
        } else {
          return;
        }
      } else {
        audioData = nextLineState.audioBlob;
        blendShapesData = nextLineState.blendShapes;
      }

      setCurrentLineState({
        speaker: currentLine.speaker,
        audioBlob: audioData,
        blendShapes: blendShapesData,
      });

      // Prefetch next line
      const nextIndex = currentIndex + 1;
      if (nextIndex < scriptLines.length) {
        const nextLine = scriptLines[nextIndex];
        const nextVoiceId =
          speakerVoiceMap[nextLine.speaker as keyof typeof speakerVoiceMap];
        fetchAudio(nextLine.text, nextVoiceId).then((result) => {
          if (result) {
            setNextLineState({
              speaker: nextLine.speaker,
              audioBlob: result.blob,
              blendShapes: result.blendShapes,
            });
          } else {
            setNextLineState({
              speaker: nextLine.speaker,
              audioBlob: null,
              blendShapes: [],
            });
          }
        });
      } else {
        setNextLineState({
          speaker: "",
          audioBlob: null,
          blendShapes: [],
        });
      }
    }
  }, [
    scriptLines,
    nextLineState.audioBlob,
    nextLineState.blendShapes,
    fetchAudio,
  ]);

  // Move to the next line
  const nextLine = useCallback(() => {
    currentLineIndexRef.current += 1;
    if (currentLineIndexRef.current < scriptLines.length) {
      playCurrentLine();
    }
  }, [playCurrentLine, scriptLines.length]);

  // Set up event listener for when audio ends
  useEffect(() => {
    const audio = audioRef?.current;
    if (audio) {
      audio.addEventListener("ended", nextLine);
    }
    return () => {
      if (audio) {
        audio.removeEventListener("ended", nextLine);
      }
    };
  }, [nextLine]);

  // Play audio when currentLineState.audioBlob changes
  useEffect(() => {
    if (currentLineState.audioBlob && audioRef.current) {
      const audioURL = URL.createObjectURL(currentLineState.audioBlob);
      audioRef.current.src = audioURL;
      audioRef.current.play();

      // Cleanup URL after use
      return () => {
        URL.revokeObjectURL(audioURL);
      };
    }
  }, [currentLineState.audioBlob]);

  // Handle prompt finish and start playing script
  const onPromptFinish = useCallback(
    async (message: Message, options: any) => {
      console.log(message, options);
      console.log(message.content.split("\n"));
      const parsedLines = message.content
        .split("\n")
        .filter((message) => message.length > 0)
        .map((line) => {
          const [speaker, text] = line.split("<");
          return { speaker, text };
        });
      console.log(parsedLines);
      setScriptLines(parsedLines);
      currentLineIndexRef.current = 0;
      setIsAudioLoading(true);

      // Start fetching the first line
      const currentLine = parsedLines[0];
      const voiceId =
        speakerVoiceMap[currentLine.speaker as keyof typeof speakerVoiceMap];
      const result = await fetchAudio(currentLine.text, voiceId);
      setIsAudioLoading(false);
      if (result) {
        setCurrentLineState({
          speaker: currentLine.speaker,
          audioBlob: result.blob,
          blendShapes: result.blendShapes,
        });

        // Prefetch the next line if it exists
        if (parsedLines.length > 1) {
          const nextLine = parsedLines[1];
          const nextVoiceId =
            speakerVoiceMap[nextLine.speaker as keyof typeof speakerVoiceMap];
          fetchAudio(nextLine.text, nextVoiceId).then((nextResult) => {
            if (nextResult) {
              setNextLineState({
                speaker: nextLine.speaker,
                audioBlob: nextResult.blob,
                blendShapes: nextResult.blendShapes,
              });
            }
          });
        }

        const endTime = performance.now();
        const timeTaken = ((endTime - startTimeRef.current) / 1000).toFixed(2);
        setResponseTime(timeTaken);
      }
    },
    [fetchAudio]
  );

  return (
    <>
      <Scene
        selectedNews={selectedNews}
        audioRef={audioRef}
        audioBlob={currentLineState.audioBlob}
        blendShapes={currentLineState.blendShapes}
        speaker={currentLineState.speaker}
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
        setAudioBlob={(blob: Blob | null) =>
          setCurrentLineState((prev) => ({ ...prev, audioBlob: blob }))
        }
      />

      <audio ref={audioRef} />
    </>
  );
};

export default ClientHome;
