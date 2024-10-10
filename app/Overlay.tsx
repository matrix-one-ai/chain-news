"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ChatInterface from "./components/ChatInterface";
import LoadingBar from "./components/LoadingBar";
import NewsCard from "./components/NewsCard";
import { Message } from "ai/react";
import { News } from "@prisma/client";
import { azureVoices } from "./helpers/azureVoices";
import {
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  Switch,
  Typography,
} from "@mui/material";
import Marquee from "react-fast-marquee";

interface OverlayProps {
  newsItems: News[];
  audioRef: React.RefObject<HTMLAudioElement>;
  progress: number;
  isAudioLoading: boolean;
  selectedNews: News | null;
  fetchAudio: (text: string, voice: string) => Promise<void>;
  setIsAudioLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedNews: React.Dispatch<React.SetStateAction<News | null>>;
  setAudioBlob: React.Dispatch<React.SetStateAction<Blob | null>>;
}

const Overlay = ({
  newsItems,
  audioRef,
  progress,
  isAudioLoading,
  selectedNews,
  fetchAudio,
  setIsAudioLoading,
  setSelectedNews,
  setAudioBlob,
}: OverlayProps) => {
  const [responseTime, setResponseTime] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<string>(
    azureVoices[0].value
  );
  const [prompt, setPrompt] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

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

  const [currentNewsIndex, setCurrentNewsIndex] = useState(-1);

  const switchNextNewsItem = () => {
    setCurrentNewsIndex((prevIndex) => prevIndex + 1);
  };

  useEffect(() => {
    if (isStreaming && isPlaying) {
      const newsItem = newsItems[currentNewsIndex];
      setSelectedNews(newsItem);

      console.log("getting next news item", newsItem);

      const prompt0 = `
        Your name is Haiku, host of CryptoNews.One.
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

        Keep it under 20 seconds of text.
        Don't add weird characters or sounds. Pure text for speech.
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

      audioRef.current?.addEventListener("ended", switchNextNewsItem);

      return () => {
        audioRef.current?.removeEventListener("ended", switchNextNewsItem);
      };
    }
  }, [currentNewsIndex, newsItems, setSelectedNews, isStreaming, isPlaying]);

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
      audioRef.current?.removeEventListener("ended", switchNextNewsItem);
    }
  }, [audioRef, setSelectedNews, setAudioBlob]);

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
        isStreaming={isStreaming}
        prompt={prompt}
        startTimeRef={startTimeRef}
        isAudioLoading={isAudioLoading}
        responseTime={responseTime}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
        handleOnFinish={handleOnFinish}
      />

      {!isStreaming && (
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

      <Box
        sx={{
          position: "fixed",
          top: 10,
          left: 10,
          zIndex: 1005,
        }}
      >
        <FormGroup>
          <FormControlLabel
            control={<Switch value={isStreaming} />}
            onChange={() => {
              setIsStreaming((prev) => !prev);
              setIsPlaying(false);
            }}
            label="Streamer Mode"
          />
        </FormGroup>
      </Box>

      {isStreaming && (
        <>
          <Box
            sx={{
              position: "fixed",
              top: 10,
              right: 10,
              zIndex: 1002,
            }}
          >
            <Button
              variant={isPlaying ? "outlined" : "contained"}
              color="primary"
              onClick={isPlaying ? handleStreamStop : handleStreamStart}
            >
              {isPlaying ? "Stop Stream" : "Start Stream"}
            </Button>
          </Box>

          {selectedNews && (
            <>
              <Box
                sx={{
                  zIndex: 1000,
                  position: "absolute",
                  bottom: {
                    xs: 70,
                  },
                  left: 0,
                  minWidth: {
                    xs: "15rem",
                    md: "22rem",
                  },
                  pointerEvents: "none",
                  backgroundColor: "#FE3132",
                  padding: "0.5rem 1rem",
                  textTransform: "uppercase",
                  clipPath: "polygon(0 0, 95% 0, 100% 100%, 0% 100%)",
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    transform: "skewX(-20deg)",
                    fontSize: {
                      xs: "1rem",
                      md: "1.75rem",
                    },
                  }}
                >
                  Breaking News
                </Typography>
              </Box>
              <Box
                sx={{
                  zIndex: 1000,
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "85%",
                  pointerEvents: "none",
                  backdropFilter: "blur(10px)",
                  backgroundColor: "white",
                  color: "black",
                  py: "0.5rem",
                }}
              >
                <Marquee speed={50}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textTransform: "uppercase",
                      fontSize: {
                        xs: "1.5rem",
                        md: "3rem",
                      },
                    }}
                  >
                    {selectedNews.title + selectedNews.description ||
                      "No news yet..."}
                  </Typography>
                </Marquee>
              </Box>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Overlay;
