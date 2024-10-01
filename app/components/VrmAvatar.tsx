"use client";

import React, { useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { loadMixamoAnimation } from "../helpers/loadMixamoAnimation";
import {
  MToonMaterialLoaderPlugin,
  VRM,
  VRMLoaderPlugin,
  VRMUtils,
} from "@pixiv/three-vrm";

const azureToVrmBlendShapeMapping = [
  "", // 0 is not used
  "EyeBlinkLeft", // 1: eyeBlinkLeft
  "EyeLookDownLeft", // 2: eyeLookDownLeft
  "EyeLookInLeft", // 3: eyeLookInLeft
  "EyeLookOutLeft", // 4: eyeLookOutLeft
  "EyeLookUpLeft", // 5: eyeLookUpLeft
  "EyeSquintLeft", // 6: eyeSquintLeft
  "EyeWideLeft", // 7: eyeWideLeft
  "EyeBlinkRight", // 8: eyeBlinkRight
  "EyeLookDownRight", // 9: eyeLookDownRight
  "EyeLookInRight", //10: eyeLookInRight
  "EyeLookOutRight", //11: eyeLookOutRight
  "EyeLookUpRight", //12: eyeLookUpRight
  "EyeSquintRight", //13: eyeSquintRight
  "EyeWideRight", //14: eyeWideRight
  "JawForward", //15: jawForward
  "JawLeft", //16: jawLeft
  "JawRight", //17: jawRight
  "JawOpen", //18: jawOpen
  "MouthClose", //19: mouthClose
  "MouthFunnel", //20: mouthFunnel
  "MouthPucker", //21: mouthPucker
  "MouthLeft", //22: mouthLeft
  "MouthRight", //23: mouthRight
  "MouthSmileLeft", //24: mouthSmileLeft
  "MouthSmileRight", //25: mouthSmileRight
  "MouthFrownLeft", //26: mouthFrownLeft
  "MouthFrownRight", //27: mouthFrownRight
  "MouthDimpleLeft", //28: mouthDimpleLeft
  "MouthDimpleRight", //29: mouthDimpleRight
  "MouthStretchLeft", //30: mouthStretchLeft
  "MouthStretchRight", //31: mouthStretchRight
  "MouthRollLower", //32: mouthRollLower
  "MouthRollUpper", //33: mouthRollUpper
  "MouthShrugLower", //34: mouthShrugLower
  "MouthShrugUpper", //35: mouthShrugUpper
  "MouthPressLeft", //36: mouthPressLeft
  "MouthPressRight", //37: mouthPressRight
  "MouthLowerDownLeft", //38: mouthLowerDownLeft
  "MouthLowerDownRight", //39: mouthLowerDownRight
  "MouthUpperUpLeft", //40: mouthUpperUpLeft
  "MouthUpperUpRight", //41: mouthUpperUpRight
  "BrowDownLeft", //42: browDownLeft
  "BrowDownRight", //43: browDownRight
  "BrowInnerUp", //44: browInnerUp
  "BrowOuterUpLeft", //45: browOuterUpLeft
  "BrowOuterUpRight", //46: browOuterUpRight
  "CheekPuff", //47: cheekPuff
  "CheekSquintLeft", //48: cheekSquintLeft
  "CheekSquintRight", //49: cheekSquintRight
  "NoseSneerLeft", //50: noseSneerLeft
  "NoseSneerRight", //51: noseSneerRight
  "TongueOut", //52: tongueOut
  // The following have no direct mapping in VRM blend shapes
  "", //53: headRoll
  "", //54: leftEyeRoll
  "", //55: rightEyeRoll
];

function processBlendShapesData(blendShapesData: any[]) {
  const frames: { frameIndex: number; blendShapeValues: number[] }[] = [];
  let cumulativeFrameIndex = 0;

  for (let i = 0; i < blendShapesData.length; i++) {
    const keyframe = blendShapesData[i];
    const frameIndex = keyframe.FrameIndex; // Number of frames before this keyframe
    const blendShapesArray = keyframe.BlendShapes; // Array of arrays

    // Handle any gaps between cumulativeFrameIndex and keyframe's FrameIndex
    while (cumulativeFrameIndex < frameIndex) {
      // Fill gaps with neutral frames (all zeros)
      frames.push({
        frameIndex: cumulativeFrameIndex,
        blendShapeValues: new Array(55).fill(0),
      });
      cumulativeFrameIndex++;
    }

    // Process the blendShape frames in the keyframe
    for (let j = 0; j < blendShapesArray.length; j++) {
      const blendShapeValues = blendShapesArray[j]; // Array of 55 values
      frames.push({
        frameIndex: cumulativeFrameIndex,
        blendShapeValues: blendShapeValues,
      });
      cumulativeFrameIndex++;
    }
  }

  return frames;
}

const getBlendShapeKey = (index: number): string => {
  return azureToVrmBlendShapeMapping[index];
};

interface VrmAvatarProps {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  onLoadingProgress: (progress: number) => void;
  audioBlob: Blob | null;
  blendShapes: any[];
}

function VrmAvatar({
  audioRef,
  onLoadingProgress,
  audioBlob,
  blendShapes,
}: VrmAvatarProps) {
  const [gltf, setGltf] = useState<GLTF | null>(null);
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [actions, setActions] = useState<THREE.AnimationAction[]>([]);
  const [audioReady, setAudioReady] = useState(false); // State variable to track audio readiness

  const [processedFrames, setProcessedFrames] = useState<
    { frameIndex: number; blendShapeValues: number[] }[]
  >([]);

  useEffect(() => {
    if (blendShapes && blendShapes.length > 0) {
      const frames = processBlendShapesData(blendShapes);
      setProcessedFrames(frames);
    }
  }, [blendShapes]);

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
            VRMUtils.removeUnnecessaryVertices(gltf.scene);
            VRMUtils.removeUnnecessaryJoints(gltf.scene, {
              experimentalSameBoneCounts: true,
            });

            gltf.userData.vrm.scene.traverse((obj: any) => {
              obj.frustumCulled = false;
            });

            VRMUtils.rotateVRM0(gltf.userData.vrm);

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

  useEffect(() => {
    if (audioBlob && blendShapes.length > 0 && gltf) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      const audioURL = URL.createObjectURL(audioBlob);
      console.log("Audio URL:", audioURL);
      audio.src = audioURL;

      const onCanPlayThrough = () => {
        console.log("Audio duration:", audio.duration);
        if (isNaN(audio.duration) || audio.duration === 0) {
          console.error(
            "Audio duration is not available after canplaythrough event."
          );
          return;
        }
        setAudioReady(true);
        audio.play();
      };

      const onError = (e: any) => {
        console.error("Error loading audio:", e);
      };

      audio.addEventListener("canplaythrough", onCanPlayThrough);
      audio.addEventListener("error", onError);

      // Cleanup function
      return () => {
        if (audio) {
          audio.removeEventListener("canplaythrough", onCanPlayThrough);
          audio.removeEventListener("error", onError);
          URL.revokeObjectURL(audio.src);
        }
      };
    }
  }, [audioBlob, audioRef, blendShapes, gltf]);

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

    if (audioRef.current && audioReady && processedFrames.length > 0 && gltf) {
      const audio = audioRef.current;
      const currentTime = audio.currentTime;
      const duration = audio.duration;

      if (isNaN(duration) || duration === 0) {
        console.log("Audio duration not available yet");
        return;
      }

      const totalFrames = processedFrames.length;
      const durationPerFrame = duration / totalFrames;
      const currentFrameIndex = Math.floor(currentTime / durationPerFrame);
      const frameIndex = Math.min(currentFrameIndex, totalFrames - 1);

      const currentFrame = processedFrames[frameIndex];

      if (currentFrame) {
        const expressionManager = (gltf.userData.vrm as VRM).expressionManager;
        if (expressionManager) {
          // Apply blend shape values
          const blendShapeValues = currentFrame.blendShapeValues;

          blendShapeValues.forEach((value: number, index: number) => {
            const blendShapeName = getBlendShapeKey(index + 1);
            if (blendShapeName) {
              expressionManager.setValue(blendShapeName, value);
            }
          });

          // Update the blendShape weights once per frame
          expressionManager.update();
        }
      }

      // Reset blend shapes when the audio ends
      if (currentTime >= duration) {
        const expressionManager = (gltf.userData.vrm as VRM).expressionManager;
        if (expressionManager) {
          expressionManager.resetValues();
          expressionManager.update();
        }
      }
    }
  });

  return gltf && actions.length > 0 ? <primitive object={gltf.scene} /> : null;
}

export default VrmAvatar;
