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
  HOST2: "en-US-AndrewMultilingualNeural",
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

  // State for the current line, including lineIndex
  const [currentLineState, setCurrentLineState] = useState<{
    lineIndex: number;
    speaker: string;
    text: string;
    audioBlob: Blob | null;
    blendShapes: any[];
  }>({
    lineIndex: -1,
    speaker: "",
    text: "",
    audioBlob: null,
    blendShapes: [],
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Cache for fetched audio data
  const [audioCache, setAudioCache] = useState<{
    [index: number]: { blob: Blob; blendShapes: any[] };
  }>({});

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

      let audioData: Blob;
      let blendShapesData: any[];

      if (audioCache[currentIndex]) {
        // Use cached audio data
        audioData = audioCache[currentIndex].blob;
        blendShapesData = audioCache[currentIndex].blendShapes;
      } else {
        setIsAudioLoading(true);
        const result = await fetchAudio(currentLine.text, voiceId);
        setIsAudioLoading(false);
        if (result) {
          audioData = result.blob;
          blendShapesData = result.blendShapes;

          // Cache the audio data
          setAudioCache((prevCache) => ({
            ...prevCache,
            [currentIndex]: { blob: audioData, blendShapes: blendShapesData },
          }));
        } else {
          return;
        }
      }

      setCurrentLineState({
        lineIndex: currentIndex,
        speaker: currentLine.speaker,
        text: currentLine.text,
        audioBlob: audioData,
        blendShapes: blendShapesData,
      });

      // Prefetch next line
      const nextIndex = currentIndex + 1;
      if (nextIndex < scriptLines.length) {
        const nextLine = scriptLines[nextIndex];
        const nextVoiceId =
          speakerVoiceMap[nextLine.speaker as keyof typeof speakerVoiceMap];
        if (!audioCache[nextIndex]) {
          fetchAudio(nextLine.text, nextVoiceId).then((result) => {
            if (result) {
              // Cache the audio data
              setAudioCache((prevCache) => ({
                ...prevCache,
                [nextIndex]: {
                  blob: result.blob,
                  blendShapes: result.blendShapes,
                },
              }));
            }
          });
        }
      }
    }
  }, [scriptLines, audioCache, fetchAudio]);

  // Move to the next line
  const nextLine = useCallback(() => {
    currentLineIndexRef.current += 1;
    if (currentLineIndexRef.current < scriptLines.length) {
      playCurrentLine();
    } else {
      // End of script
      setIsPlaying(false);
      setCurrentLineState({
        lineIndex: -1,
        speaker: "",
        text: "",
        audioBlob: null,
        blendShapes: [],
      });
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

  // Play audio when currentLineState changes
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
  }, [currentLineState.lineIndex]);

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

      // Start fetching all audio data upfront
      const fetchAllAudio = async () => {
        const audioDataArray = await Promise.all(
          parsedLines.map(async (line, index) => {
            const voiceId =
              speakerVoiceMap[line.speaker as keyof typeof speakerVoiceMap];
            const result = await fetchAudio(line.text, voiceId);
            return result ? { ...result, speaker: line.speaker } : null;
          })
        );

        const newAudioCache: {
          [index: number]: { blob: Blob; blendShapes: any[] };
        } = {};
        audioDataArray.forEach((data, index) => {
          if (data) {
            newAudioCache[index] = {
              blob: data.blob,
              blendShapes: data.blendShapes,
            };
          }
        });

        setAudioCache(newAudioCache);

        // Start playing the first line
        if (newAudioCache[0]) {
          setCurrentLineState({
            lineIndex: 0,
            speaker: parsedLines[0].speaker,
            text: parsedLines[0].text,
            audioBlob: newAudioCache[0].blob,
            blendShapes: newAudioCache[0].blendShapes,
          });
          setIsPlaying(true);
        }

        const endTime = performance.now();
        const timeTaken = ((endTime - startTimeRef.current) / 1000).toFixed(2);
        setResponseTime(timeTaken);
        setIsAudioLoading(false);
      };

      fetchAllAudio();
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
        setIsPlaying={setIsPlaying}
        isPlaying={isPlaying}
        currentLineState={currentLineState}
      />

      <audio ref={audioRef} />
    </>
  );
};

export default ClientHome;
