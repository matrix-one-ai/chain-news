// ClientHome.tsx

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

  const fetchAudio = async () => {
    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "Short stories have no set length. In terms of word count, there is no official demarcation between an anecdote, a short story, and a novel. Rather, the form's parameters are given by the rhetorical and practical context in which a given story is produced and considered so that what constitutes a short story may differ between genres, countries, eras, and commentators.",
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
    }
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
          bottom: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <button onClick={fetchAudio}>Fetch Audio</button>
      </div>
      <audio ref={audioRef} />
    </>
  );
}
