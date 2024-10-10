"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  Suspense,
} from "react";
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
import { azureToVrmBlendShapes } from "../helpers/azureToVrmBlendShapes";
import { fetchWithProgress } from "../helpers/fetchWithProgress";
import { throttle } from "../helpers/throttle";
import { cacheVRM, getCachedVRM } from "../helpers/indexedDb";
import { hexStringToArrayBuffer } from "../helpers/crypto";

// Constants
const VRM_KEY_HEX = process.env.NEXT_PUBLIC_VRM_KEY as string;
const VRM_IV_HEX = process.env.NEXT_PUBLIC_VRM_IV as string;

interface DecryptedVRM {
  url: string;
  blob: Blob;
}

// Utility function to process blend shapes data
const processBlendShapesData = (
  blendShapesData: any[]
): { frameIndex: number; blendShapeValues: number[] }[] => {
  const frames: { frameIndex: number; blendShapeValues: number[] }[] = [];
  let cumulativeFrameIndex = 0;

  for (const keyframe of blendShapesData) {
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
    for (const blendShapeValues of blendShapesArray) {
      frames.push({
        frameIndex: cumulativeFrameIndex,
        blendShapeValues: blendShapeValues,
      });
      cumulativeFrameIndex++;
    }
  }

  return frames;
};

// Utility function to get blend shape key
const getBlendShapeKey = (index: number): string => {
  return azureToVrmBlendShapes[index];
};

// Type definitions for props
interface VrmAvatarProps {
  avatarKey: string;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  onLoadingProgress: (progress: number) => void;
  audioBlob: Blob | null;
  blendShapes: any[];
  position: [number, number, number];
  scale: [number, number, number];
}

// Type definition for processed frames
interface ProcessedFrame {
  frameIndex: number;
  blendShapeValues: number[];
}

const VrmAvatar: React.FC<VrmAvatarProps> = ({
  avatarKey,
  audioRef,
  onLoadingProgress,
  audioBlob,
  blendShapes,
  position,
  scale,
}) => {
  // State variables
  const [gltf, setGltf] = useState<GLTF | null>(null);
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [actions, setActions] = useState<THREE.AnimationAction[]>([]);
  const [audioReady, setAudioReady] = useState(false);
  const [processedFrames, setProcessedFrames] = useState<ProcessedFrame[]>([]);
  const [decryptedVrm, setDecryptedVrm] = useState<DecryptedVRM | null>(null);

  // Decrypt VRM Function
  const decryptVRM = useCallback(
    async (
      encryptedData: ArrayBuffer,
      key: ArrayBuffer,
      iv: ArrayBuffer
    ): Promise<Uint8Array> => {
      try {
        const algorithm = { name: "AES-CBC", iv };
        const cryptoKey = await window.crypto.subtle.importKey(
          "raw",
          key,
          algorithm,
          false,
          ["decrypt"]
        );
        const decrypted = await window.crypto.subtle.decrypt(
          algorithm,
          cryptoKey,
          encryptedData
        );
        return new Uint8Array(decrypted);
      } catch (error) {
        console.error("Error during decryption:", error);
        throw error;
      }
    },
    []
  );

  // Fetch and Decrypt VRM
  const fetchAndDecryptVRM = useCallback(
    async (avatarKey: string) => {
      try {
        onLoadingProgress(0);

        // Retrieve encrypted VRM from cache or fetch it
        let encryptedData = await getCachedVRM(avatarKey);
        if (!encryptedData) {
          encryptedData = await fetchWithProgress(
            `/api/vrm/decrypt?file=${avatarKey}`,
            throttle((prog: number) => onLoadingProgress(prog), 250)
          );
          await cacheVRM(avatarKey, encryptedData);
        } else {
          console.log("Loaded VRM from cache");
        }

        // Convert hex to ArrayBuffer
        const key = hexStringToArrayBuffer(VRM_KEY_HEX);
        const iv = hexStringToArrayBuffer(VRM_IV_HEX);

        // Decrypt VRM
        const decryptedData = await decryptVRM(encryptedData, key, iv);
        const blob = new Blob([decryptedData.buffer], {
          type: "application/octet-stream",
        });
        const url = URL.createObjectURL(blob);

        setDecryptedVrm({ url, blob });
        onLoadingProgress(100);
      } catch (error) {
        console.error("Error decrypting VRM:", error);
        onLoadingProgress(0);
      }
    },
    [decryptVRM, onLoadingProgress]
  );

  useEffect(() => {
    if (avatarKey) {
      fetchAndDecryptVRM(avatarKey);
    }
  }, [avatarKey, fetchAndDecryptVRM]);

  // Ref for audio event handlers to ensure cleanup
  const audioEventHandlersRef = useRef<{
    onCanPlayThrough: (event: Event) => void;
    onError: (e: Event) => void;
  } | null>(null);

  // Effect to process blend shapes data
  useEffect(() => {
    if (blendShapes && blendShapes.length > 0) {
      const frames = processBlendShapesData(blendShapes);
      setProcessedFrames(frames);
    }
  }, [blendShapes]);

  // Function to load VRM model
  const loadModel = useCallback(
    async (vrmUrl: string) => {
      if (typeof window === "undefined") return;

      try {
        // Dynamically import MToonNodeMaterial to reduce initial bundle size
        const { MToonNodeMaterial } = await import("@pixiv/three-vrm/nodes");

        // Initialize GLTFLoader with VRM plugins
        const loader = new GLTFLoader()
          .register(
            (parser) =>
              new VRMLoaderPlugin(parser, {
                autoUpdateHumanBones: true,
              })
          )
          .register((parser) => {
            const mtoonMaterialPlugin = new MToonMaterialLoaderPlugin(parser, {
              materialType: MToonNodeMaterial,
            });

            return new VRMLoaderPlugin(parser, {
              mtoonMaterialPlugin,
            });
          });

        // Load VRM model
        loader.load(
          vrmUrl,
          async (loadedGltf) => {
            const vrm: VRM = loadedGltf.userData.vrm;

            // Optimize VRM scene
            VRMUtils.removeUnnecessaryVertices(loadedGltf.scene);
            VRMUtils.removeUnnecessaryJoints(loadedGltf.scene, {
              experimentalSameBoneCounts: true,
            });

            // Disable frustum culling for all objects in the scene
            loadedGltf.scene.traverse((obj: any) => {
              obj.frustumCulled = false;
            });

            // Rotate VRM to face the correct direction
            VRMUtils.rotateVRM0(vrm);

            setGltf(loadedGltf);

            // Initialize AnimationMixer
            const newMixer = new THREE.AnimationMixer(loadedGltf.scene);
            setMixer(newMixer);

            // Load animations
            const animationUrls = [
              "/animations/idle-1.fbx",
              "/animations/fan-face.fbx",
              "/animations/idle-2.fbx",
              "/animations/kick-foot.fbx",
              "/animations/look-hand.fbx",
              "/animations/idle-1.fbx",
              "/animations/happy-idle.fbx",
            ];

            const loadedActions = await Promise.all(
              animationUrls.map(async (url) => {
                const clip = await loadMixamoAnimation(url, vrm);
                const action = newMixer.clipAction(clip);
                return action;
              })
            );

            setActions(loadedActions);

            // Play the first animation by default
            if (loadedActions.length > 0) {
              loadedActions[0].play();
            }
          },
          (event) => {
            // Update loading progress
            const progress = (event.loaded / event.total) * 100;
            onLoadingProgress(progress);
          },
          (error) => {
            console.error("Error loading VRM model:", error);
          }
        );
      } catch (error) {
        console.error("Error in loadModel:", error);
      }
    },
    [onLoadingProgress]
  );

  // Effect to load VRM model on component mount
  useEffect(() => {
    if (decryptedVrm?.url) {
      loadModel(decryptedVrm?.url);
    }
  }, [decryptedVrm?.url, loadModel]);

  // Effect to handle audio loading and synchronization
  useEffect(() => {
    if (audioBlob && blendShapes.length > 0 && gltf) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      const audioURL = URL.createObjectURL(audioBlob);
      console.log("Audio URL:", audioURL);
      audio.src = audioURL;

      const handleCanPlayThrough = (event: Event) => {
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

      const handleAudioError = (e: Event) => {
        console.error("Error loading audio:", e);
      };

      // Attach event listeners
      audio.addEventListener("canplaythrough", handleCanPlayThrough);
      audio.addEventListener("error", handleAudioError);

      // Store event handlers for cleanup
      audioEventHandlersRef.current = {
        onCanPlayThrough: handleCanPlayThrough,
        onError: handleAudioError,
      };

      // Cleanup function
      return () => {
        if (audio) {
          const handlers = audioEventHandlersRef.current;
          if (handlers) {
            audio.removeEventListener(
              "canplaythrough",
              handlers.onCanPlayThrough
            );
            audio.removeEventListener("error", handlers.onError);
          }
          URL.revokeObjectURL(audio.src);
          audio.src = "";
        }
      };
    }
  }, [audioBlob, blendShapes, gltf, audioRef]);

  // Frame update for animations and blend shapes synchronization
  useFrame((_, delta) => {
    if (mixer) {
      mixer.update(delta);

      // Transition to the next animation action if current is almost finished
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
      const vrm: VRM = gltf.userData.vrm;
      vrm.update(delta);
    }

    // Synchronize blend shapes with audio
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
          currentFrame.blendShapeValues.forEach(
            (value: number, index: number) => {
              const blendShapeName = getBlendShapeKey(index + 1);
              if (blendShapeName) {
                expressionManager.setValue(blendShapeName, value);
              }
            }
          );

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

  return gltf && actions.length > 0 ? (
    <Suspense fallback={null}>
      <primitive object={gltf.scene} position={position} scale={scale} />
    </Suspense>
  ) : null;
};

export default VrmAvatar;
