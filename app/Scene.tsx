import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Plane } from "@react-three/drei";
import VrmAvatar from "./components/VrmAvatar";
import React, { Suspense, useEffect, useMemo } from "react";
import { Model as Desk } from "./components/gltf/Desk";
import BentScreen from "./components/BentScreen";
import MatrixTunnel from "./components/MatrixTunnel";
import { useNewsStore, useSceneStore, useSettingsStore } from "./zustand/store";

const CameraSetup: React.FC = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 1.5, 1);
    camera.lookAt(0, 0.5, 0);
  }, [camera]);

  return null;
};

interface SceneProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  audioBlob: Blob | null;
  blendShapes: any[];
  speaker: string;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
}

const Scene = ({
  audioRef,
  audioBlob,
  blendShapes,
  speaker,
  setProgress,
}: SceneProps) => {
  const { selectedNews } = useNewsStore();
  const { showTraderViewWidget } = useSettingsStore();
  const { mainHostAvatar } = useSceneStore();

  const screenUrl = useMemo(
    () =>
      selectedNews
        ? `/api/image?url=${encodeURIComponent(
            selectedNews.imageUrl as string,
          )}`
        : "/videos/cnews-video-v1.mp4",
    [selectedNews],
  );

  return (
    <Canvas
      style={{
        background: "linear-gradient(180deg, #171717 0%, #000000 100%)",
      }}
    >
      <ambientLight intensity={1.25} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={3}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={2} />
      <VrmAvatar
        avatarKey={mainHostAvatar.vrmKey}
        position={[0, 0, -0.65]}
        scale={[1, 1, 1]}
        rotation={mainHostAvatar.rotation}
        audioRef={audioRef}
        onLoadingProgress={setProgress}
        audioBlob={speaker === mainHostAvatar.name ? audioBlob : null}
        blendShapes={speaker === mainHostAvatar.name ? blendShapes : []}
      />
      <VrmAvatar
        avatarKey="dogwifhat-sit"
        position={[-0.5, 0.85, -0.2]}
        scale={[1, 1, 1]}
        rotation={[0, -Math.PI / 1.2, 0]}
        audioRef={audioRef}
        onLoadingProgress={setProgress}
        audioBlob={speaker === "DogWifHat" ? audioBlob : null}
        blendShapes={speaker === "DogWifHat" ? blendShapes : []}
      />
      <Suspense fallback={null}>
        <Plane position={[0, 0.3, -0.35]} rotation={[0, 0, 0]} args={[1.5, 1]}>
          <meshStandardMaterial attach="material" color="black" />
        </Plane>
        <Desk
          position={[0, 0, -0.3]}
          rotation={[0, 0, 0]}
          scale={[0.6, 0.85, 0.3]}
          receiveShadow
          castShadow
        />
      </Suspense>
      <Suspense fallback={null}>
        <BentScreen
          url={screenUrl}
          position={[0, 1.6, -1.25]}
          rotation={[0, 0, 0]}
          isIframe={showTraderViewWidget}
        />
      </Suspense>
      <Suspense fallback={null}>
        <MatrixTunnel />
      </Suspense>
      <CameraSetup />
      <OrbitControls
        target={[0, 1.25, 0]}
        maxDistance={1}
        minDistance={0.5}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={0}
        maxAzimuthAngle={Math.PI / 4}
        minAzimuthAngle={-Math.PI / 4}
      />
    </Canvas>
  );
};

export default Scene;
