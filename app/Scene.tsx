import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Image } from "@react-three/drei";
import VrmAvatar from "./components/VrmAvatar";
import React, { Suspense, useEffect } from "react";
import { GridHelper } from "three";
import { News } from "@prisma/client";

const CameraSetup: React.FC = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 1.5, 1);
    camera.lookAt(0, 0.5, 0);
  }, [camera]);

  return null;
};

const GridFloor: React.FC = () => {
  const gridHelper = new GridHelper(20, 40, 0x888888, 0x444444);
  gridHelper.position.set(0, 0, 0);
  return <primitive object={gridHelper} />;
};

interface SceneProps {
  selectedNews: News | null;
  audioRef: React.RefObject<HTMLAudioElement>;
  audioBlob: Blob | null;
  blendShapes: any[];
  setProgress: React.Dispatch<React.SetStateAction<number>>;
}

const Scene = ({
  selectedNews,
  audioRef,
  audioBlob,
  blendShapes,
  setProgress,
}: SceneProps) => {
  return (
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

      <VrmAvatar
        avatarKey="haiku"
        position={[0, 0, 0]}
        scale={[1, 1, 1]}
        audioRef={audioRef}
        onLoadingProgress={setProgress}
        audioBlob={audioBlob}
        blendShapes={blendShapes}
      />

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
  );
};

export default Scene;
