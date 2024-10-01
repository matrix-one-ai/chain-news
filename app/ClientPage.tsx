"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import VrmAvatar from "./components/VrmAvatar";
import LoadingBar from "./components/LoadingBar";

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
  const [inputText, setInputText] = useState<string>(
    "Hello World! Welcome to CryptoNews.One, stay tuned for the latest news in the blockchain world. Powered by Matrix One."
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAudio = async (text: string) => {
    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
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
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    fetchAudio(inputText);
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
      <div
        style={{
          position: "fixed",
          bottom: 10,
          left: 0,
          zIndex: 1000,
        }}
      >
        <form onSubmit={handleSubmit}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text for voice demo"
            rows={6}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              fontSize: "16px",
            }}
          >
            {isLoading ? "Loading..." : "Talk"}
          </button>
        </form>
      </div>
      <audio ref={audioRef} />
    </>
  );
}
