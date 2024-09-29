"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { loadMixamoAnimation } from "../helpers/loadMixamoAnimation";
import { MToonMaterialLoaderPlugin, VRMLoaderPlugin } from "@pixiv/three-vrm";

export default function VrmAvatar({
  onLoadingProgress,
}: Readonly<{ onLoadingProgress: (progress: number) => void }>) {
  const [gltf, setGltf] = useState<GLTF | null>(null);
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [actions, setActions] = useState<THREE.AnimationAction[]>([]);

  useEffect(() => {
    const loadModel = async () => {
      if (typeof window !== "undefined") {
        const { MToonNodeMaterial } = await import("@pixiv/three-vrm/nodes");

        const loader = new GLTFLoader().register(
          (parser) =>
            new VRMLoaderPlugin(parser, {
              autoUpdateHumanBones: true,
            })
        );

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
          async (gltf) => {
            gltf.scene.rotation.y = Math.PI;
            setGltf(gltf);

            const mixer = new THREE.AnimationMixer(gltf.scene);
            setMixer(mixer);

            const animationUrls = [
              "/animations/idle-1.fbx",
              "/animations/fan-face.fbx",
              "/animations/idle-2.fbx",
              "/animations/kick-foot.fbx",
              "/animations/look-hand.fbx",
              "/animations/ninja.fbx",
              "/animations/snake-dance.fbx",
              "/animations/booty-dance.fbx",
              "/animations/belly-dance.fbx",
              "/animations/happy-idle.fbx",
            ];

            const loadedActions = await Promise.all(
              animationUrls.map(async (url) => {
                const clip = await loadMixamoAnimation(url, gltf.userData.vrm);
                const action = mixer.clipAction(clip);
                return action;
              })
            );

            setActions(loadedActions);

            if (loadedActions.length > 0) {
              loadedActions[0].play();
            }
          },
          (event) => {
            onLoadingProgress((event.loaded / event.total) * 100);
          }
        );
      }
    };

    loadModel();
  }, [onLoadingProgress]);

  useFrame((_, delta) => {
    if (mixer) {
      mixer.update(delta);

      // Check if the current action is almost finished and transition to the next one
      const currentAction = actions.find((action) => action.isRunning());
      if (
        currentAction &&
        currentAction.time >= currentAction.getClip().duration - 0.5
      ) {
        const currentIndex = actions.indexOf(currentAction);
        const nextIndex =
          currentIndex + 1 >= actions.length ? 0 : currentIndex + 1;
        const nextAction = actions[nextIndex];

        currentAction.reset().fadeOut(0.5);
        nextAction.reset().fadeIn(0.5).play();
      }
    }

    if (gltf) {
      gltf.userData.vrm.update(delta);
    }
  });

  return gltf && actions.length > 1 ? <primitive object={gltf.scene} /> : null;
}
