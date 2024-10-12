"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ChatInterface from "./components/ChatInterface";
import LoadingBar from "./components/LoadingBar";
import NewsCard from "./components/NewsCard";
import { Message } from "ai/react";
import { News } from "@prisma/client";
import LiveBanner from "./components/LiveBanner";

interface OverlayProps {
  newsItems: News[];
  audioRef: React.RefObject<HTMLAudioElement>;
  progress: number;
  isAudioLoading: boolean;
  selectedNews: News | null;
  selectedVoice: string;
  scriptLines: { text: string }[];
  startTimeRef: React.MutableRefObject<number>;
  responseTime: string;
  isPlaying: boolean;
  onPromptFinish: (message: Message, options: any) => void;
  setSelectedVoice: React.Dispatch<React.SetStateAction<string>>;
  fetchAudio: (
    text: string,
    voice: string
  ) => Promise<{ blob: Blob; blendShapes: any } | null>;
  setSelectedNews: React.Dispatch<React.SetStateAction<News | null>>;
  setAudioBlob: (blob: Blob | null) => void;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

const Overlay = ({
  newsItems,
  audioRef,
  progress,
  isAudioLoading,
  selectedNews,
  selectedVoice,
  scriptLines,
  startTimeRef,
  responseTime,
  isPlaying,
  onPromptFinish,
  setSelectedVoice,
  fetchAudio,
  setSelectedNews,
  setAudioBlob,
  setIsPlaying,
}: OverlayProps) => {
  const [prompt, setPrompt] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [segmentDuration, setSegmentDuration] = useState<number>(30);

  const handleNewsClick = useCallback(
    (newsItem: News) => {
      startTimeRef.current = performance.now();
      setSelectedNews(newsItem);

      const prompt = `
        Your job is to deliver the latest news in the world of cryptocurrency on our platform ChainNews.One.
        Your audience is watching on live stream.

        There are 2 hosts: Haiku and DogWifHat.

        HOST1: Haiku is a young female news reporter, educated and classy. She is the main host of the show.
        HOST2: DogWifHat is a crypto memecoin pumper small dog with a hat. He is the co-host of the show, and he is a bit of a clown.

        The news item you have selected is:
        Title: ${newsItem.title}
        Description: ${newsItem.description}
        Source: ${newsItem.source}

        The content of the news source is:
        ${newsItem.content}

        At the end of the news, you can ask your audience for their thoughts.
        Shout out to your audience and ask them to subscribe to your channel.
        Promo the news provider and the source.
        The provider of the news is ${newsItem.providerTitle}.

        Keep it under ${segmentDuration} seconds of text.
        Don't add weird characters or sounds.

        ONLY output in this script format:

        Use "<" to separate the speaker from the text.

        SPEAKER<TEXT\n
        SPEAKER<TEXT\n
        SPEAKER<TEXT\n
        ... etc

        The only speakers you can use are:
        HOST1, HOST2

        HOST1 should have more script lines then HOST2.

        This text is used to generate the audio for the show.
        This is the first news item in the stream. Welcome your audience.
     `;

      setPrompt(prompt);
    },
    [segmentDuration, setSelectedNews, startTimeRef]
  );

  const [currentNewsIndex, setCurrentNewsIndex] = useState(-1);

  const switchNextNewsItem = useCallback(() => {
    setCurrentNewsIndex((prevIndex) => prevIndex + 1);
  }, []);

  useEffect(() => {
    if (isStreaming && isPlaying) {
      const newsItem = newsItems[currentNewsIndex];
      setSelectedNews(newsItem);

      console.log("getting next news item", newsItem);

      const prompt0 = `
        Your job is to deliver the latest news in the world of cryptocurrency on our platform ChainNews.One.
        Your audience is watching on live stream.

        There are 2 hosts: Haiku and DogWifHat.

        HOST1: Haiku is a young female news reporter, educated and classy. She is the main host of the show.
        HOST2: DogWifHat is a crypto memecoin pumper small dog with a hat. He is the co-host of the show, and he is a bit of a clown.

        The news item you have selected is:
        Title: ${newsItem.title}
        Description: ${newsItem.description}
        Source: ${newsItem.source}

        The content of the news source is:
        ${newsItem.content}

        Please deliver the news to your audience.
        At the end of the news, you can ask your audience for their thoughts.
        Shout out to your audience and ask them to subscribe to your channel.
        Promo the news provider and the source.
        The provider of the news is ${newsItem.providerTitle}.

        Keep it under ${segmentDuration} seconds of text.
        Don't add weird characters or sounds.

        ONLY output in this script format:

        Use "<" to separate the speaker from the text.

        SPEAKER<TEXT\n
        SPEAKER<TEXT\n
        SPEAKER<TEXT\n
        ... etc

        The only speakers you can use are:
        HOST1, HOST2

        HOST1 should have more script lines then HOST2.

        This text is used to generate the audio for the show.
        This is the first news item in the stream. Welcome your audience.
      `;

      const prompt1 = `
        The next news item is:
        Title: ${newsItem.title}
        Description: ${newsItem.description}
        Source: ${newsItem.source}

        The content of the news source is:
        ${newsItem.content}

        Deliver the news to your audience.
        Transition smoothly from the previous news item.
       `;

      setPrompt(currentNewsIndex === 0 ? prompt0 : prompt1);
    }
  }, [
    currentNewsIndex,
    newsItems,
    setSelectedNews,
    isStreaming,
    isPlaying,
    segmentDuration,
  ]);

  const handleStreamStart = useCallback(() => {
    setIsPlaying(true);
    switchNextNewsItem();
  }, [switchNextNewsItem]);

  const handleStreamStop = useCallback(() => {
    setIsPlaying(false);
    setPrompt("");
    setCurrentNewsIndex(-1);
    setSelectedNews(null);
    setAudioBlob(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const prompt = `
        Conclude the ChainNews.One Stream.
        Thank your audience for watching.
        Ask them to subscribe to your channel.
        Say goodbye and see you next time.
    `;

    setPrompt(prompt);
  }, [setSelectedNews, setAudioBlob, audioRef, switchNextNewsItem]);

  const prevIsPlayingRef = useRef<boolean>(isPlaying);

  useEffect(() => {
    const prevIsPlaying = prevIsPlayingRef.current;

    if (prevIsPlaying && !isPlaying && isStreaming) {
      // isPlaying changed from true to false, and streaming is active
      setIsPlaying(true);
      switchNextNewsItem();
    }

    prevIsPlayingRef.current = isPlaying;
  }, [isPlaying, isStreaming, switchNextNewsItem]);

  useEffect(() => {
    const broadcast = new BroadcastChannel("stream-control");

    broadcast.onmessage = (event) => {
      const { type, ...data } = event.data;

      switch (type) {
        case "START_STREAM":
          handleStreamStart();
          break;
        case "STOP_STREAM":
          handleStreamStop();
          break;
        case "SET_STREAMING":
          setIsStreaming(data.isStreaming);
          break;
        case "SET_SEGMENT_DURATION":
          setSegmentDuration(data.segmentDuration);
          break;
        default:
          break;
      }
    };

    return () => {
      broadcast.close();
    };
  }, [fetchAudio, handleStreamStart, handleStreamStop]);

  return (
    <div>
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

      <ChatInterface
        isStreaming={isStreaming || isPlaying}
        prompt={prompt}
        startTimeRef={startTimeRef}
        isAudioLoading={isAudioLoading}
        responseTime={responseTime}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
        handleOnFinish={onPromptFinish}
      />

      {!isStreaming && !isPlaying && (
        <div
          style={{
            position: "fixed",
            top: 10,
            right: 10,
            zIndex: 1000,
            width: "25%",
            maxWidth: "400px",
            maxHeight: "100%",
            overflowY: "auto",
          }}
        >
          {newsItems.map((newsItem, index) => (
            <NewsCard
              key={newsItem.title + index}
              newsItem={newsItem}
              onClick={handleNewsClick}
            />
          ))}
        </div>
      )}

      {(isStreaming || isPlaying) && (
        <>
          <LiveBanner />
        </>
      )}
    </div>
  );
};

export default Overlay;
