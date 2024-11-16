"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import Overlay from "./Overlay";
import Scene from "./Scene";
import { Message } from "ai";
import {
  useAppMountedStore,
  useAuthStore,
  useSceneStore,
} from "./zustand/store";

const speakerVoiceMap = {
  Sam: "en-US-AvaMultilingualNeural",
  Haiku: "en-US-JaneNeural",
  DogWifHat: "en-US-AndrewMultilingualNeural",
};

const ClientHome: React.FC = () => {
  const { setMounted } = useAppMountedStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [scriptLines, setScriptLines] = useState<
    {
      speaker: string;
      text: string;
    }[]
  >([]);
  const [audioCache, setAudioCache] = useState<{
    [index: number]: { blob: Blob; blendShapes: any[] };
  }>({});

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

  const { setIsPlaying } = useSceneStore();
  const { credits, isAdmin, setCredits } = useAuthStore();

  // Fetch audio and blendShapes for a given text and voice
  const fetchAudio = useCallback(async (text: string, voiceId: string) => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
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
        console.error(`Error fetching audio (attempt ${attempt + 1}):`, error);
        attempt += 1;
        if (attempt >= maxRetries) {
          console.error("Max retries reached. Giving up.");
          nextLine();
          return null;
        }
      }
    }
  }, []);

  // Play the current line and prefetch the next line
  const playCurrentLine = useCallback(async () => {
    const currentIndex = currentLineState.lineIndex;
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
  }, [currentLineState.lineIndex, scriptLines, audioCache, fetchAudio]);

  // Move to the next line
  const nextLine = useCallback(() => {
    currentLineState.lineIndex += 1;
    if (currentLineState.lineIndex < scriptLines.length) {
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
  }, [currentLineState, playCurrentLine, scriptLines.length, setIsPlaying]);

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
      console.log(currentLineState);

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
          const [speaker, text] = line.split(">");
          return {
            speaker: speaker.trim(),
            text: text.trim(),
          };
        })
        .filter(
          (parsedLine) =>
            parsedLine?.speaker?.length > 0 && parsedLine?.text?.length > 0
        );
      console.log(parsedLines);
      setScriptLines(parsedLines);
      setIsAudioLoading(true);

      const firstLine = parsedLines[0];

      const voiceId =
        speakerVoiceMap[firstLine.speaker as keyof typeof speakerVoiceMap];

      const result = await fetchAudio(firstLine.text, voiceId);

      if (!result) {
        return console.log("Error fetching audio", result);
      }

      setAudioCache({
        0: {
          blob: result.blob,
          blendShapes: result.blendShapes,
        },
      });

      setCurrentLineState({
        lineIndex: 0,
        speaker: parsedLines[0].speaker,
        text: parsedLines[0].text,
        audioBlob: result.blob,
        blendShapes: result.blendShapes,
      });

      setIsPlaying(true);
      setIsAudioLoading(false);

      if (!isAdmin) {
        setCredits(credits - 1);
      }
    },
    [credits, fetchAudio, isAdmin, setCredits, setIsPlaying]
  );

  const onPromptError = useCallback((error: any) => {
    console.log("Error in prompt:", error);
  }, []);

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
        audioRef={audioRef}
        progress={progress}
        isAudioLoading={isAudioLoading}
        currentLineState={currentLineState}
        onPromptFinish={onPromptFinish}
        onPromptError={onPromptError}
        setAudioBlob={(blob: Blob | null) =>
          setCurrentLineState((prev) => ({ ...prev, audioBlob: blob }))
        }
        setScriptLines={setScriptLines}
        setCurrentLineState={setCurrentLineState}
      />

      <audio ref={audioRef} />
    </>
  );
};

export default ClientHome;
