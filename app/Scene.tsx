import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Image } from "@react-three/drei";
import VrmAvatar from "./components/VrmAvatar";
import React, { Suspense, useEffect } from "react";
import { GridHelper } from "three";
import { News } from "@prisma/client";
import { Model as BarStool } from "./components/gltf/BarStool";

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
  speaker: string;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
}

const Scene = ({
  selectedNews,
  audioRef,
  audioBlob,
  blendShapes,
  speaker,
  setProgress,
}: SceneProps) => {
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

      <GridFloor />

      <VrmAvatar
        avatarKey="haiku"
        position={[0, 0, 0]}
        scale={[1, 1, 1]}
        rotation={[0, Math.PI, 0]}
        audioRef={audioRef}
        onLoadingProgress={setProgress}
        audioBlob={speaker === "HOST1" ? audioBlob : null}
        blendShapes={speaker === "HOST1" ? blendShapes : []}
      />

      <VrmAvatar
        avatarKey="skippy"
        position={[0.75, 0.8, 0]}
        scale={[0.5, 0.5, 0.5]}
        rotation={[0, Math.PI / 1.3, 0]}
        audioRef={audioRef}
        onLoadingProgress={setProgress}
        audioBlob={speaker === "HOST2" ? audioBlob : null}
        blendShapes={speaker === "HOST2" ? blendShapes : []}
      />

      <BarStool
        position={[0.75, 0.58, 0]}
        rotation={[0, -Math.PI / 4, 0]}
        scale={[0.01, 0.01, 0.01]}
        receiveShadow
        castShadow
      />

      {selectedNews && (
        <Suspense fallback={null}>
          <Image
            url={`/api/image?url=${encodeURIComponent(
              selectedNews.imageUrl as string
            )}`}
            transparent
            opacity={1}
            position={[-0.3, 1.4, -1]}
            rotation={[0, Math.PI / 20, 0]}
          >
            <planeGeometry args={[3.25, 1.75]} />
          </Image>
        </Suspense>
      )}

      <CameraSetup />
      <OrbitControls target={[0, 1.25, 0]} maxDistance={1} minDistance={0.5} />
    </Canvas>
  );
};

export default Scene;
