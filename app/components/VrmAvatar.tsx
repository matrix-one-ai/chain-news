"use client";

import { useEffect, useState } from "react";
import { GLTF } from "three/addons/loaders/GLTFLoader.js";

export default function VrmAvatar({
  onLoadingProgress,
}: Readonly<{ onLoadingProgress: (progress: number) => void }>) {
  const [gltf, setGltf] = useState<GLTF | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      if (typeof window !== "undefined") {
        const { GLTFLoader } = await import(
          "three/addons/loaders/GLTFLoader.js"
        );
        const { MToonMaterialLoaderPlugin, VRMLoaderPlugin } = await import(
          "@pixiv/three-vrm"
        );
        const { MToonNodeMaterial } = await import("@pixiv/three-vrm/nodes");

        const loader = new GLTFLoader();

        loader.register((parser) => {
          const mtoonMaterialPlugin = new MToonMaterialLoaderPlugin(parser, {
            materialType: MToonNodeMaterial,
          });

          return new VRMLoaderPlugin(parser, {
            mtoonMaterialPlugin,
          });
        });

        loader.load(
          "/vrms/haiku.vrm",
          (gltf) => {
            gltf.scene.rotation.y = Math.PI;
            setGltf(gltf);
          },
          (event) => {
            onLoadingProgress((event.loaded / event.total) * 100);
          }
        );
      }
    };

    loadModel();
  }, [onLoadingProgress]);

  return gltf ? <primitive object={gltf.scene} /> : null;
}
