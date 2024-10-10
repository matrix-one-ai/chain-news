"use client";

import { useCallback, useRef, useState } from "react";
import ChatInterface from "./components/ChatInterface";
import LoadingBar from "./components/LoadingBar";
import NewsCard from "./components/NewsCard";
import { Message } from "ai/react";
import { News } from "@prisma/client";
import { azureVoices } from "./helpers/azureVoices";

interface OverlayProps {
  newsItems: News[];
  progress: number;
  isAudioLoading: boolean;
  fetchAudio: (text: string, voice: string) => Promise<void>;
  setIsAudioLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedNews: React.Dispatch<React.SetStateAction<News | null>>;
}

const Overlay = ({
  newsItems,
  progress,
  isAudioLoading,
  fetchAudio,
  setIsAudioLoading,
  setSelectedNews,
}: OverlayProps) => {
  const [responseTime, setResponseTime] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<string>(
    azureVoices[0].value
  );
  const [prompt, setPrompt] = useState<string>("");

  const startTimeRef = useRef<number>(0);

  const handleOnFinish = useCallback(
    (message: Message, options: any) => {
      console.log(message, options);
      setIsAudioLoading(true);
      fetchAudio(message.content, selectedVoice).then(() => {
        const endTime = performance.now();
        const timeTaken = ((endTime - startTimeRef.current) / 1000).toFixed(2);
        setResponseTime(timeTaken);
      });
    },
    [fetchAudio, selectedVoice, setIsAudioLoading]
  );

  const handleNewsClick = useCallback(
    (newsItem: News) => {
      startTimeRef.current = performance.now();
      setSelectedNews(newsItem);

      const prompt = `
            You name is Haiku, host of CryptoNews.One.
            Your job is to deliver the latest news in the world of cryptocurrency.
            Your audience is watching on live stream.
    
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
    
            Keep it under 1 minute of text.
            Don't add weird characters or sounds. Pure text for speech.
          `;

      setPrompt(prompt);
    },
    [setSelectedNews]
  );

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
        prompt={prompt}
        startTimeRef={startTimeRef}
        isAudioLoading={isAudioLoading}
        responseTime={responseTime}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
        handleOnFinish={handleOnFinish}
      />

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
    </div>
  );
};

export default Overlay;
