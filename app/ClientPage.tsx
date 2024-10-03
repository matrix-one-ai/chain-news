"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Image } from "@react-three/drei";
import VrmAvatar from "./components/VrmAvatar";
import LoadingBar from "./components/LoadingBar";
import { useChat } from "ai/react";
import { azureVoices } from "./helpers/azureVoices";
import { News } from "@prisma/client";

const CameraSetup = () => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 1.5, 1);
    camera.lookAt(0, 0.5, 0);
  }, [camera]);
  return null;
};

const NewsCard = ({
  newsItem,
  onClick,
}: {
  newsItem: News;
  onClick: (newsItem: News) => void;
}) => {
  return (
    <div onClick={() => onClick(newsItem)} className="news-card">
      {newsItem.imageUrl && (
        <img
          src={newsItem.imageUrl}
          alt={newsItem.title}
          style={{ height: "200px" }}
        />
      )}
      <h3>{newsItem.title}</h3>
      <p>{newsItem.providerTitle}</p>
    </div>
  );
};

export default function ClientHome({ newsData }: { newsData: News[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [blendShapes, setBlendShapes] = useState<any[]>([]);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [responseTime, setResponseTime] = useState<string>("");
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  let startTime: number;

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
  } = useChat({
    onFinish(message, options) {
      console.log(message, options);
      setIsAudioLoading(true);
      fetchAudio(message.content).then(() => {
        const endTime = performance.now();
        const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
        setResponseTime(timeTaken);
      });
    },
  });

  const [selectedVoice, setSelectedVoice] = useState<string>(
    azureVoices[0].value
  );

  const fetchAudio = async (text: string) => {
    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      const audioData = data.audioData;
      const blendShapes = data.blendShapes;

      const audioBuffer = Uint8Array.from(atob(audioData), (c) =>
        c.charCodeAt(0)
      );
      const audioBlob = new Blob([audioBuffer], { type: "audio/ogg" });

      setAudioBlob(audioBlob);
      setBlendShapes(blendShapes);
    } catch (error) {
      console.error("Error fetching audio:", error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleSubmitWithTimer = (event: React.FormEvent) => {
    startTime = performance.now();
    handleSubmit(event);
  };

  const [randomNewsItems, setRandomNewsItems] = useState<News[]>([]);

  useEffect(() => {
    if (newsData && newsData.length > 0) {
      const shuffled = [...newsData].sort(() => 0.5 - Math.random());
      setRandomNewsItems(shuffled.slice(0, 10));
    }
  }, [newsData]);

  const handleNewsClick = (newsItem: News) => {
    startTime = performance.now();

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

      Keep it under 30 seconds.
      Don't add weird characters or sounds. Pure text for speech.
`;

    append({
      role: "user",
      content: prompt,
    });
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

        <VrmAvatar
          audioRef={audioRef}
          onLoadingProgress={setProgress}
          audioBlob={audioBlob}
          blendShapes={blendShapes}
        />

        {selectedNews && (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Suspense fallback={null}>
            <Image
              url={`/api/image?url=${encodeURIComponent(
                selectedNews.imageUrl as string
              )}`}
              transparent
              opacity={1}
              position={[-0.3, 1.8, -1]}
              rotation={[0, Math.PI / 20, 0]}
            />
          </Suspense>
        )}

        <CameraSetup />
        <OrbitControls
          target={[0, 1.25, 0]}
          maxDistance={1.5}
          minDistance={0.5}
        />
      </Canvas>

      {progress < 100 && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
        >
          <LoadingBar progress={progress} />
        </div>
      )}

      {/* Chat UI */}
      <div
        style={{
          position: "fixed",
          bottom: 10,
          left: 0,
          zIndex: 1000,
          width: "25%",
          color: "black",
        }}
      >
        <div
          ref={chatContainerRef}
          style={{
            maxHeight: "500px",
            overflowY: "auto",
            backgroundColor: "#f0f0f0",
            padding: "10px",
          }}
        >
          {messages.map((message, index) => (
            <div key={index}>
              <strong>{message.role === "user" ? "User" : "AI"}:</strong>{" "}
              {message.content}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmitWithTimer}>
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Enter your message"
            rows={4}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
            }}
          />
          <div>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              style={{
                padding: "10px",
                fontSize: "16px",
                width: "100%",
              }}
            >
              {azureVoices.map((voice) => (
                <option key={voice.value} value={voice.value}>
                  {voice.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading || isAudioLoading}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              fontSize: "16px",
              width: "100%",
            }}
          >
            {isLoading || isAudioLoading ? "Loading..." : "Send"}
          </button>

          <div
            style={{ whiteSpace: "nowrap", color: "white", paddingTop: "5px" }}
          >
            Latency: {responseTime ? `${responseTime}s` : ""}
          </div>
        </form>
      </div>

      {/* News Cards UI */}
      <div
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          zIndex: 1000,
          width: "25%",
          maxHeight: "100%",
          overflowY: "auto",
        }}
      >
        {randomNewsItems.map((newsItem) => (
          <NewsCard
            key={newsItem.id}
            newsItem={newsItem}
            onClick={handleNewsClick}
          />
        ))}
      </div>

      <audio ref={audioRef} />
    </>
  );
}
