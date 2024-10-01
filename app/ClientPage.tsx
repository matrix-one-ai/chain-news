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
  
  const voices = [
    { value: "en-US-AvaMultilingualNeural", label: "Ava Multilingual Neural (Female)" },
    { value: "en-US-AndrewMultilingualNeural", label: "Andrew Multilingual Neural (Male)" },
    { value: "en-US-EmmaMultilingualNeural4", label: "Emma Multilingual Neural (Female)" },
    { value: "en-US-BrianMultilingualNeural", label: "Brian Multilingual Neural (Male)" },
    { value: "en-US-AvaNeural", label: "Ava Neural (Female)" },
    { value: "en-US-AndrewNeural", label: "Andrew Neural (Male)" },
    { value: "en-US-EmmaNeural", label: "Emma Neural (Female)" },
    { value: "en-US-BrianNeural", label: "Brian Neural (Male)" },
    { value: "en-US-JennyNeural", label: "Jenny Neural (Female)" },
    { value: "en-US-GuyNeural", label: "Guy Neural (Male)" },
    { value: "en-US-AriaNeural", label: "Aria Neural (Female)" },
    { value: "en-US-DavisNeural", label: "Davis Neural (Male)" },
    { value: "en-US-JaneNeural", label: "Jane Neural (Female)" },
    { value: "en-US-JasonNeural", label: "Jason Neural (Male)" },
    { value: "en-US-SaraNeural", label: "Sara Neural (Female)" },
    { value: "en-US-TonyNeural", label: "Tony Neural (Male)" },
    { value: "en-US-NancyNeural", label: "Nancy Neural (Female)" },
    { value: "en-US-AmberNeural", label: "Amber Neural (Female)" },
    { value: "en-US-AnaNeural", label: "Ana Neural (Female, Child)" },
    { value: "en-US-AshleyNeural", label: "Ashley Neural (Female)" },
    { value: "en-US-BrandonNeural", label: "Brandon Neural (Male)" },
    { value: "en-US-ChristopherNeural", label: "Christopher Neural (Male)" },
    { value: "en-US-CoraNeural", label: "Cora Neural (Female)" },
    { value: "en-US-ElizabethNeural", label: "Elizabeth Neural (Female)" },
    { value: "en-US-EricNeural", label: "Eric Neural (Male)" },
    { value: "en-US-JacobNeural", label: "Jacob Neural (Male)" },
    { value: "en-US-JennyMultilingualNeural", label: "Jenny Multilingual Neural 4 (Female)" },
    { value: "en-US-MichelleNeural", label: "Michelle Neural (Female)" },
    { value: "en-US-MonicaNeural", label: "Monica Neural (Female)" },
    { value: "en-US-RogerNeural", label: "Roger Neural (Male)" },
    { value: "en-US-RyanMultilingualNeural", label: "Ryan Multilingual Neural (Male)" },
    { value: "en-US-SteffanNeural", label: "Steffan Neural (Male)" },
    { value: "en-US-AdamMultilingualNeural", label: "Adam Multilingual Neural (Male)" },
    { value: "en-US-AIGenerate1Neural", label: "AIGenerate1 Neural (Male)" },
    { value: "en-US-AIGenerate2Neural", label: "AIGenerate2 Neural (Female)" },
    { value: "en-US-AlloyTurboMultilingualNeural", label: "Alloy Turbo Multilingual Neural (Male)" },
    { value: "en-US-AmandaMultilingualNeural", label: "Amanda Multilingual Neural (Female)" },
    { value: "en-US-BlueNeural", label: "Blue Neural (Neutral)" },
    { value: "en-US-BrandonMultilingualNeural", label: "Brandon Multilingual Neural (Male)" },
    { value: "en-US-ChristopherMultilingualNeural", label: "Christopher Multilingual Neural (Male)" },
    { value: "en-US-CoraMultilingualNeural", label: "Cora Multilingual Neural (Female)" },
    { value: "en-US-DavisMultilingualNeural", label: "Davis Multilingual Neural (Male)" },
    { value: "en-US-DerekMultilingualNeural", label: "Derek Multilingual Neural (Male)" },
    { value: "en-US-DustinMultilingualNeural", label: "Dustin Multilingual Neural (Male)" },
    { value: "en-US-EvelynMultilingualNeural", label: "Evelyn Multilingual Neural (Female)" },
    { value: "en-US-KaiNeural", label: "Kai Neural (Male)" },
    { value: "en-US-LewisMultilingualNeural", label: "Lewis Multilingual Neural (Male)" },
    { value: "en-US-LolaMultilingualNeural", label: "Lola Multilingual Neural (Female)" },
    { value: "en-US-LunaNeural", label: "Luna Neural (Female)" },
    { value: "en-US-NancyMultilingualNeural", label: "Nancy Multilingual Neural (Female)" },
    { value: "en-US-NovaTurboMultilingualNeural", label: "Nova Turbo Multilingual Neural (Female)" },
    { value: "en-US-PhoebeMultilingualNeural", label: "Phoebe Multilingual Neural (Female)" },
    { value: "en-US-SamuelMultilingualNeural", label: "Samuel Multilingual Neural (Male)" },
    { value: "en-US-SerenaMultilingualNeural", label: "Serena Multilingual Neural (Female)" },
    { value: "en-US-SteffanMultilingualNeural", label: "Steffan Multilingual Neural (Male)" },
    { value: "en-US-AlloyMultilingualNeural", label: "Alloy Multilingual Neural (Male)" },
    { value: "en-US-EchoMultilingualNeural", label: "Echo Multilingual Neural (Male)" },
    { value: "en-US-FableMultilingualNeural", label: "Fable Multilingual Neural (Neutral)" },
    { value: "en-US-OnyxMultilingualNeural", label: "Onyx Multilingual Neural (Male)" },
    { value: "en-US-NovaMultilingualNeural", label: "Nova Multilingual Neural (Female)" },
    { value: "en-US-ShimmerMultilingualNeural", label: "Shimmer Multilingual Neural (Female)" },
    { value: "en-US-AlloyMultilingualNeuralHD", label: "Alloy Multilingual Neural HD (Male)" },
    { value: "en-US-EchoMultilingualNeuralHD", label: "Echo Multilingual Neural HD (Male)" },
    { value: "en-US-FableMultilingualNeuralHD", label: "Fable Multilingual Neural HD (Neutral)" },
    { value: "en-US-OnyxMultilingualNeuralHD", label: "Onyx Multilingual Neural HD (Male)" },
    { value: "en-US-NovaMultilingualNeuralHD", label: "Nova Multilingual Neural HD (Female)" },
    { value: "en-US-ShimmerMultilingualNeuralHD", label: "Shimmer Multilingual Neural HD (Female)" },
  ];

  const [selectedVoice, setSelectedVoice] = useState<string>(voices[0].value);

  const fetchAudio = async (text: string) => {
    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice, // 4. Include Voice in API Request
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
            rows={4}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            style={{
              marginTop: "10px",
              padding: "10px",
              fontSize: "16px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {voices.map((voice) => (
              <option key={voice.value} value={voice.value}>
                {voice.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              fontSize: "16px",
              width: "100%",
              boxSizing: "border-box",
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
