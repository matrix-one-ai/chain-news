"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import VrmAvatar from "./components/VrmAvatar";
import LoadingBar from "./components/LoadingBar";
import { useChat } from "ai/react";
import { azureVoices } from "./helpers/azureVoices";

const CameraSetup = () => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 1.5, 1);
    camera.lookAt(0, 0.5, 0);
  }, [camera]);
  return null;
};

export default function ClientHome() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [blendShapes, setBlendShapes] = useState<any[]>([]);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [responseTime, setResponseTime] = useState<string>("");

  let startTime: number;

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
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

      // Decode audio data from base64
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
      <audio ref={audioRef} />
    </>
  );
}
