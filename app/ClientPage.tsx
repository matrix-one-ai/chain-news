"use client";

import React, { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import VrmAvatar from "./components/VrmAvatar";
import LoadingBar from "./components/LoadingBar";

const CameraSetup = () => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 1.5, 3);
    camera.lookAt(0, 0.5, 0);
  }, [camera]);
  return null;
};

export default function ClientHome() {
  const [progress, setProgress] = useState<number>(0);

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

        <VrmAvatar onLoadingProgress={setProgress} />

        <CameraSetup />
        <OrbitControls target={[0, 1, 0]} maxDistance={1.5} autoRotate />
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
    </>
  );
}
