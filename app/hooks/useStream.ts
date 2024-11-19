import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Message } from "ai";
import {
  useAuthStore,
  useLiveStreamStore,
  useNewsStore,
  useOverlayStore,
  usePromptStore,
  useSceneStore,
  useSettingsStore,
} from "@/app/zustand/store";
import {
  chatsResponsePrompt,
  concludeNewsPrompt,
  jokeBreakPrompt,
  nextSegmentPrompt,
  startNewsPrompt,
} from "@/app/helpers/prompts";
import { News } from "@prisma/client";
import { useNewsFetchBySlugOnMount } from "./useNewsFetch";
import { AbortableFetch } from "@/app/utils/abortablePromise";

const speakerVoiceMap = {
  Sam: "en-US-AvaMultilingualNeural",
  Haiku: "en-US-JaneNeural",
  DogWifHat: "en-US-AndrewMultilingualNeural",
};

const DEFAULT_LINE_STATE: LineState = {
  lineIndex: -1,
  speaker: "",
  text: "",
  audioBlob: null,
  blendShapes: [],
};

type LineState = {
  lineIndex: number;
  speaker: string;
  text: string;
  audioBlob: Blob | null;
  blendShapes: any[];
};

/**
 * Hooks for streaming news or playing selected news
 * @returns
 */
export function useStream(): {
  audioRef: React.RefObject<HTMLAudioElement>;
  isAudioLoading: boolean;
  currentLineState: LineState;
  onPromptFinish: (message: Message, options: any) => void;
  onPromptError: (error: any) => void;
  onStreamStart: () => void;
  onStreamStop: () => void;
  onStreamNext: () => void;
  onNewsClick: (newsItem: News | null) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, isAdmin, credits, setTriggerWeb3AuthModal, setCredits } =
    useAuthStore();
  const {
    isStreaming,
    streamStarted,
    segmentDuration,
    currentSegmentIndex,
    lastSegmentType,
    setIsStreaming,
    setStreamStarted,
    setCurrentSegmentIndex,
    setLastSegmentType,
  } = useLiveStreamStore();
  const { news, setSelectedNews } = useNewsStore();
  const { setPrompt, addSystemMessage } = usePromptStore();
  const { isPromptUnlocked, customPrompt, setIsSettingsOpen } =
    useSettingsStore();
  const { isPlaying, isPaused, mainHostAvatar, setIsPlaying, setIsPaused } =
    useSceneStore();
  const { isPaywallModalOpen, setIsPaywallModalOpen } = useOverlayStore();

  const initialNews = useNewsFetchBySlugOnMount();

  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [scriptLines, setScriptLines] = useState<
    {
      speaker: string;
      text: string;
    }[]
  >([]);
  const [audioCache, setAudioCache] = useState<{
    [index: number]: { blob: Blob; blendShapes: any[] };
  }>({});
  const [currentLineState, setCurrentLineState] =
    useState<LineState>(DEFAULT_LINE_STATE);

  const audioRef = useRef<HTMLAudioElement>(null);
  const abortableAudioFetch = useRef<AbortableFetch | null>(null);
  const abortableChatsFetch = useRef<AbortableFetch | null>(null);

  // Fetch audio and blendShapes for a given text and voice
  const fetchAudio = useCallback(async (text: string, voiceId: string) => {
    const maxRetries = 3;
    let attempt = 0;

    // Abort previous audio fetching, if any
    abortableAudioFetch.current?.abort();

    while (attempt < maxRetries) {
      try {
        abortableAudioFetch.current = new AbortableFetch("/api/speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            voice: voiceId,
          }),
        });
        const response = await abortableAudioFetch.current.fetch;
        abortableAudioFetch.current = null;

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        const { audioData, blendShapes } = data;

        const audioBuffer = Uint8Array.from(atob(audioData), (c) =>
          c.charCodeAt(0),
        );
        const blob = new Blob([audioBuffer], { type: "audio/ogg" });

        return { blob, blendShapes };
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          console.error(
            `Error fetching audio (attempt ${attempt + 1}):`,
            error,
          );
          attempt += 1;
          if (attempt >= maxRetries) {
            console.error("Max retries reached. Giving up.");
            nextLine();
            return null;
          }
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
      setCurrentLineState(DEFAULT_LINE_STATE);
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

  // TODO: Not sure how this effect works, the logic of playing audio exists in VrmAvatar too
  // // Play audio when currentLineState changes
  // useEffect(() => {
  //   if (currentLineState.audioBlob && audioRef.current) {
  //     console.log(currentLineState);

  //     const audioURL = URL.createObjectURL(currentLineState.audioBlob);
  //     audioRef.current.src = audioURL;
  //     audioRef.current.play();

  //     // Cleanup URL after use
  //     return () => {
  //       URL.revokeObjectURL(audioURL);
  //     };
  //   }
  // }, [currentLineState.audioBlob]);

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
            parsedLine?.speaker?.length > 0 && parsedLine?.text?.length > 0,
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
    [credits, fetchAudio, isAdmin, setCredits, setIsPlaying],
  );

  const onPromptError = useCallback((error: any) => {
    console.log("Error in prompt:", error);
  }, []);

  const fetchChats = useCallback(async () => {
    // Abort previous fetching, if any
    abortableChatsFetch.current?.abort();

    try {
      abortableChatsFetch.current = new AbortableFetch("/api/youtube/chats", {
        cache: "no-cache",
      });
      const resp = await abortableChatsFetch.current.fetch;
      abortableChatsFetch.current = null;
      if (resp.ok) {
        const data = await resp.json();
        console.log("got chats", data.chats);
        return data.chats;
      }
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        console.error(error);
      }
    }
  }, []);

  const streamLoop = useCallback(async () => {
    const newsItem = news[currentSegmentIndex];

    console.log("Getting next news item:", newsItem);
    console.log("Current News Index:", currentSegmentIndex);

    let prompt = "";

    const chats = await fetchChats();

    if (
      chats?.length > 0 &&
      lastSegmentType !== "chat" &&
      currentSegmentIndex > 0
    ) {
      // Handle Chat Segment
      setSelectedNews(null);
      prompt = chatsResponsePrompt(chats);
      setLastSegmentType("chat");
      setCurrentSegmentIndex(currentSegmentIndex + 1);
      addSystemMessage(`TERMINAL: Playing Youtube chat segment with ${
        chats.length
      } messages.\nChats:\n
          ${chats
            .map((chat: any) => `${chat.displayName}: ${chat.displayMessage}`)
            .join("\n")}
          `);
    } else if (!newsItem) {
      // Handle Conclusion
      setSelectedNews(null);
      prompt = concludeNewsPrompt();
      setLastSegmentType("chat");
      setCurrentSegmentIndex(0); // infinite loop replay stream
      addSystemMessage(
        `TERMINAL: Stream concluded. Starting from the beginning...`,
      );
    } else if (currentSegmentIndex === 0) {
      // Handle Start of News
      setSelectedNews(newsItem);
      prompt = isPromptUnlocked
        ? customPrompt
        : startNewsPrompt(newsItem, segmentDuration, mainHostAvatar);

      setLastSegmentType("news");
      setCurrentSegmentIndex(currentSegmentIndex + 1);
      addSystemMessage(
        `TERMINAL: Welcome! Starting the news...\n${newsItem.title}`,
      );
    } else if (currentSegmentIndex % 5 === 0) {
      // Handle Joke Breaks
      setSelectedNews(null);
      setCurrentSegmentIndex(currentSegmentIndex + 1);
      prompt = jokeBreakPrompt();
      setLastSegmentType("joke");
      addSystemMessage(
        `TERMINAL: Joke break time! Entertaining the audience...`,
      );
    } else {
      // Handle Next News Segment
      setSelectedNews(newsItem);
      prompt = nextSegmentPrompt(newsItem, mainHostAvatar, segmentDuration);
      setLastSegmentType("news");
      setCurrentSegmentIndex(currentSegmentIndex + 1);

      addSystemMessage(
        `TERMINAL: Moving to next article...\n${newsItem.title}`,
      );
    }

    setIsPlaying(true);
    setPrompt(prompt);
  }, [
    news,
    currentSegmentIndex,
    fetchChats,
    lastSegmentType,
    setIsPlaying,
    setPrompt,
    setSelectedNews,
    addSystemMessage,
    setLastSegmentType,
    setCurrentSegmentIndex,
    isPromptUnlocked,
    customPrompt,
    segmentDuration,
    mainHostAvatar,
  ]);

  // streaming loop
  useEffect(() => {
    if (isStreaming && !isPlaying && streamStarted) {
      streamLoop();
    }
  }, [currentSegmentIndex, isPlaying, isStreaming, streamLoop, streamStarted]);

  // Nullify current playing
  const stopCurrentPlaying = useCallback(() => {
    setSelectedNews(null);
    setLastSegmentType(null);
    setScriptLines([]);
    setCurrentLineState(DEFAULT_LINE_STATE);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  }, [setIsPlaying, setLastSegmentType, setSelectedNews]);

  const onStreamStart = useCallback(() => {
    setCurrentSegmentIndex(0); // sets -1 to 0
    setStreamStarted(true);
    setIsSettingsOpen(false);
  }, [setCurrentSegmentIndex, setIsSettingsOpen, setStreamStarted]);

  const onStreamStop = useCallback(() => {
    // Stop previous playin, if any
    stopCurrentPlaying();

    setStreamStarted(false);
    setIsStreaming(false);

    const prompt = concludeNewsPrompt();

    setPrompt(prompt);
    addSystemMessage(`TERMINAL: Stream concluded. Thank you for watching!`);
  }, [
    stopCurrentPlaying,
    setStreamStarted,
    setIsStreaming,
    setPrompt,
    addSystemMessage,
  ]);

  const onStreamNext = useCallback(() => {
    // Stop previous playin, if any
    stopCurrentPlaying();

    const nextNews = news[currentSegmentIndex + 1];

    const prompt = nextSegmentPrompt(nextNews, mainHostAvatar, segmentDuration);
    setSelectedNews(nextNews);
    setPrompt(prompt);

    addSystemMessage(`TERMINAL: Moving to next article...\n${nextNews.title}`);
  }, [
    addSystemMessage,
    currentSegmentIndex,
    mainHostAvatar,
    news,
    segmentDuration,
    setPrompt,
    setSelectedNews,
    stopCurrentPlaying,
  ]);

  const onNewsClick = useCallback(
    (newsItem: News | null) => {
      if (newsItem === null) return;

      // Stop previous playing, if any
      stopCurrentPlaying();

      if (isLoggedIn) {
        if (credits <= 0 && !isAdmin) {
          setIsPaywallModalOpen(true);
          return;
        }
        // Add/remove query param based on selected news' slug
        if (newsItem?.slug) {
          router.replace(`${pathname}?article=${newsItem.slug}`);
        } else {
          router.replace(pathname);
        }

        setSelectedNews(newsItem);
        // Reset paused state, so that new news can be played
        setIsPaused(false);

        if (isPromptUnlocked) {
          setPrompt(customPrompt);
        } else {
          const prompt = startNewsPrompt(
            newsItem,
            segmentDuration,
            mainHostAvatar,
          );
          setPrompt(prompt);
        }
        addSystemMessage(
          `TERMINAL: Starting news segment...\n${newsItem.title}`,
        );
      } else {
        console.log("User not logged in");
        setTriggerWeb3AuthModal(true);
      }
    },
    [
      stopCurrentPlaying,
      isLoggedIn,
      credits,
      isAdmin,
      setSelectedNews,
      isPromptUnlocked,
      addSystemMessage,
      setIsPaywallModalOpen,
      router,
      pathname,
      setPrompt,
      customPrompt,
      segmentDuration,
      mainHostAvatar,
      setTriggerWeb3AuthModal,
      setIsPaused,
    ],
  );

  // If search param has slug info initially, then the news corresponding to the slug should be played
  useEffect(() => {
    // ! Closing paywall modal is necessary to confirm that user interacted with the page
    // Should be logged in, and also paywall modal should be closed (because closing paywall modal needs user interaction, and audio can be played after user interaction)
    if (!isLoggedIn || isPaywallModalOpen) return;

    onNewsClick(initialNews);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNews, isLoggedIn, isPaywallModalOpen]);

  // Play/pause audio
  useEffect(() => {
    if (audioRef.current?.src === "") return;

    if (isPaused) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
  }, [isPaused]);

  return {
    audioRef,
    isAudioLoading,
    currentLineState,
    onPromptFinish,
    onPromptError,
    onStreamStart,
    onStreamStop,
    onStreamNext,
    onNewsClick,
  };
}
