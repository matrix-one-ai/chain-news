"use client";

import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MToonMaterialLoaderPlugin, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { MToonNodeMaterial } from "@pixiv/three-vrm/nodes";
import { useEffect, useState } from "react";

const VrmAvatar = () => {
  const [gltf, setGltf] = useState<GLTF | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();

    loader.register((parser) => {
      const mtoonMaterialPlugin = new MToonMaterialLoaderPlugin(parser, {
        materialType: MToonNodeMaterial,
      });

      return new VRMLoaderPlugin(parser, {
        mtoonMaterialPlugin,
      });
    });

    loader.load("/vrms/haiku.vrm", (gltf) => {
      gltf.scene.rotation.y = Math.PI;
      setGltf(gltf);
    });
  }, []);

  return gltf ? <primitive object={gltf.scene} /> : null;
};

export default VrmAvatar;
