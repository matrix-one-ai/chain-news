"use client";

import React, {
  Suspense,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Image } from "@react-three/drei";
import VrmAvatar from "./components/VrmAvatar";
import LoadingBar from "./components/LoadingBar";
import { useChat } from "ai/react";
import { azureVoices } from "./helpers/azureVoices";
import { hexStringToArrayBuffer } from "./helpers/crypto";
import { News } from "@prisma/client";
import { fetchWithProgress } from "./helpers/fetchWithProgress";
import { throttle } from "./helpers/throttle";
import { cacheVRM, getCachedVRM } from "./helpers/indexedDb";
import CryptoCandlestickChart from "./components/CryptoCandlestickChart";
import { GridHelper } from "three";
import {
  EmojiEvents,
  AccessAlarm,
  AttachMoney,
  MonetizationOn,
  NewspaperOutlined,
  ComputerOutlined,
  TokenOutlined,
  GamesOutlined,
} from "@mui/icons-material";
import { Chip } from "@mui/material";

type NewsCategory =
  | "Memes"
  | "Ethereum"
  | "Solana"
  | "Bitcoin"
  | "AI"
  | "DePIN"
  | "NFTs"
  | "DeFi"
  | "General"
  | "Gaming";

const categoryIcons: Record<NewsCategory, JSX.Element> = {
  Memes: <EmojiEvents />,
  Bitcoin: <TokenOutlined />,
  Ethereum: <TokenOutlined />,
  Solana: <TokenOutlined />,
  AI: <ComputerOutlined />,
  DePIN: <AccessAlarm />,
  NFTs: <AttachMoney />,
  DeFi: <MonetizationOn />,
  General: <NewspaperOutlined />,
  Gaming: <GamesOutlined />,
};

// Constants
const VRM_KEY = "haiku";
const VRM_KEY_HEX = process.env.NEXT_PUBLIC_VRM_KEY as string;
const VRM_IV_HEX = process.env.NEXT_PUBLIC_VRM_IV as string;

// Types
interface ClientHomeProps {
  newsData: News[];
}

interface NewsCardProps {
  newsItem: News;
  onClick: (newsItem: News) => void;
}

interface DecryptedVRM {
  url: string;
  blob: Blob;
}

// Camera Setup Component
const CameraSetup: React.FC = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 1.5, 1);
    camera.lookAt(0, 0.5, 0);
  }, [camera]);

  return null;
};

// NewsCard Component
const NewsCard: React.FC<NewsCardProps> = ({ newsItem, onClick }) => (
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

    <div style={{ marginTop: "10px" }}>
      {newsItem.category && (
        <Chip
          label={newsItem.category}
          icon={categoryIcons[newsItem.category as NewsCategory]}
          style={{ marginRight: "5px", padding: "2px 10px" }}
        />
      )}
    </div>
  </div>
);

// ChatInterface Component
interface ChatInterfaceProps {
  messages: any[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isAudioLoading: boolean;
  responseTime: string;
  selectedVoice: string;
  setSelectedVoice: React.Dispatch<React.SetStateAction<string>>;
  chatContainerRef: React.RefObject<HTMLDivElement>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  isAudioLoading,
  responseTime,
  selectedVoice,
  setSelectedVoice,
  chatContainerRef,
}) => (
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
        maxHeight: "300px",
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
    <form onSubmit={handleSubmit}>
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

      <div style={{ whiteSpace: "nowrap", color: "white", paddingTop: "5px" }}>
        Latency: {responseTime ? `${responseTime}s` : ""}
      </div>
    </form>
  </div>
);

const GridFloor: React.FC = () => {
  const gridHelper = new GridHelper(20, 40, 0x888888, 0x444444); // Grid of 10x10 units, 20 divisions
  gridHelper.position.set(0, 0, 0); // Adjust position to be under the avatar
  return <primitive object={gridHelper} />;
};

// Main ClientHome Component
const ClientHome: React.FC<ClientHomeProps> = ({ newsData }) => {
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [progress, setProgress] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [blendShapes, setBlendShapes] = useState<any[]>([]);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [responseTime, setResponseTime] = useState<string>("");
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [decryptedVrm, setDecryptedVrm] = useState<DecryptedVRM | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>(
    azureVoices[0].value
  );
  const [randomNewsItems, setRandomNewsItems] = useState<News[]>([]);

  // Timer Ref
  const startTimeRef = useRef<number>(0);

  // Chat Hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
  } = useChat({
    onFinish: (message, options) => {
      console.log(message, options);
      setIsAudioLoading(true);
      fetchAudio(message.content).then(() => {
        const endTime = performance.now();
        const timeTaken = ((endTime - startTimeRef.current) / 1000).toFixed(2);
        setResponseTime(timeTaken);
      });
    },
  });

  // Decrypt VRM Function
  const decryptVRM = useCallback(
    async (
      encryptedData: ArrayBuffer,
      key: ArrayBuffer,
      iv: ArrayBuffer
    ): Promise<Uint8Array> => {
      try {
        const algorithm = { name: "AES-CBC", iv };
        const cryptoKey = await window.crypto.subtle.importKey(
          "raw",
          key,
          algorithm,
          false,
          ["decrypt"]
        );
        const decrypted = await window.crypto.subtle.decrypt(
          algorithm,
          cryptoKey,
          encryptedData
        );
        return new Uint8Array(decrypted);
      } catch (error) {
        console.error("Error during decryption:", error);
        throw error;
      }
    },
    []
  );

  // Fetch and Decrypt VRM
  const fetchAndDecryptVRM = useCallback(async () => {
    try {
      setProgress(0);

      // Retrieve encrypted VRM from cache or fetch it
      let encryptedData = await getCachedVRM(VRM_KEY);
      if (!encryptedData) {
        encryptedData = await fetchWithProgress(
          `/api/vrm/decrypt?file=${VRM_KEY}`,
          throttle((prog: number) => setProgress(prog), 250)
        );
        await cacheVRM(VRM_KEY, encryptedData);
      } else {
        console.log("Loaded VRM from cache");
      }

      // Convert hex to ArrayBuffer
      const key = hexStringToArrayBuffer(VRM_KEY_HEX);
      const iv = hexStringToArrayBuffer(VRM_IV_HEX);

      // Decrypt VRM
      const decryptedData = await decryptVRM(encryptedData, key, iv);
      const blob = new Blob([decryptedData.buffer], {
        type: "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);

      setDecryptedVrm({ url, blob });
      setProgress(100);
    } catch (error) {
      console.error("Error decrypting VRM:", error);
      setProgress(0);
    }
  }, [decryptVRM]);

  useEffect(() => {
    fetchAndDecryptVRM();
  }, [fetchAndDecryptVRM]);

  // Fetch Audio Function
  const fetchAudio = useCallback(
    async (text: string) => {
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
    },
    [selectedVoice]
  );

  // Handle Submit with Timer
  const handleSubmitWithTimer = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      startTimeRef.current = performance.now();
      handleSubmit(event);
    },
    [handleSubmit]
  );

  // Initialize Random News Items
  useEffect(() => {
    if (newsData && newsData.length > 0) {
      const shuffled = [...newsData].sort(() => 0.5 - Math.random());
      setRandomNewsItems(shuffled);
    }
  }, [newsData]);

  // Handle News Click
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

      append({
        role: "user",
        content: prompt,
      });
    },
    [append]
  );

  // Scroll Chat to Bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Memoize Random News Items
  const memoizedRandomNewsItems = useMemo(
    () => randomNewsItems,
    [randomNewsItems]
  );

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

        <GridFloor />

        {!selectedNews && (
          <Suspense fallback={null}>
            <CryptoCandlestickChart
              spacing={0.5}
              position={[-2, -1.75, -4]} // Move back by 5 units on the Z-axis
              scaleY={5} // This will exaggerate the candle height by 10x
              scaleX={0.7}
            />
          </Suspense>
        )}

        {decryptedVrm && (
          <VrmAvatar
            position={[0, 0, 0]}
            scale={[1, 1, 1]}
            vrmUrl={decryptedVrm.url}
            audioRef={audioRef}
            onLoadingProgress={setProgress}
            audioBlob={audioBlob}
            blendShapes={blendShapes}
          />
        )}

        {selectedNews && (
          <Suspense fallback={null}>
            <Image
              url={`/api/image?url=${encodeURIComponent(
                selectedNews.imageUrl as string
              )}`}
              transparent
              opacity={1}
              position={[-0.3, 1.8, -1]}
              rotation={[0, Math.PI / 20, 0]}
            >
              <planeGeometry args={[3, 1.5]} />
            </Image>
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
            zIndex: 1002,
          }}
        >
          <LoadingBar progress={progress} />
        </div>
      )}

      {/* Chat UI */}
      <ChatInterface
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmitWithTimer}
        isLoading={isLoading}
        isAudioLoading={isAudioLoading}
        responseTime={responseTime}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
        chatContainerRef={chatContainerRef}
      />

      {/* News Cards UI */}
      {decryptedVrm && (
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
          {memoizedRandomNewsItems.map((newsItem) => (
            <NewsCard
              key={newsItem.id}
              newsItem={newsItem}
              onClick={handleNewsClick}
            />
          ))}
        </div>
      )}

      <audio ref={audioRef} />
    </>
  );
};

export default ClientHome;
