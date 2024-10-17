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
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { azureToVrmBlendShapes } from "../helpers/azureToVrmBlendShapes";
import { fetchWithProgress } from "../helpers/fetchWithProgress";
import { throttle } from "../helpers/throttle";
import { cacheVRM, getCachedVRM } from "../helpers/indexedDb";
import { hexStringToArrayBuffer } from "../helpers/crypto";

// Constants
const VRM_KEY_HEX = process.env.NEXT_PUBLIC_VRM_KEY as string;
const VRM_IV_HEX = process.env.NEXT_PUBLIC_VRM_IV as string;

const idleAnimations = ["/animations/idle-1.fbx", "/animations/idle-2.fbx"];

const talkAnimations = [
  "/animations/talk-1.fbx",
  "/animations/talk-2.fbx",
  "/animations/talk-3.fbx",
];

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
  rotation: [number, number, number];
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
  rotation,
  scale,
}) => {
  // State variables
  const [gltf, setGltf] = useState<GLTF | null>(null);
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [idleActions, setIdleActions] = useState<THREE.AnimationAction[]>([]);
  const [talkActions, setTalkActions] = useState<THREE.AnimationAction[]>([]);
  const [currentAction, setCurrentAction] =
    useState<THREE.AnimationAction | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [processedFrames, setProcessedFrames] = useState<ProcessedFrame[]>([]);
  const [decryptedVrm, setDecryptedVrm] = useState<DecryptedVRM | null>(null);
  const [isTalking, setIsTalking] = useState(false); // State to track if avatar is talking
  const audioBlobCounterRef = useRef<number>(0); // Counter to track number of audioBlobs

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
        // Initialize GLTFLoader with VRM plugins
        const loader = new GLTFLoader().register(
          (parser) =>
            new VRMLoaderPlugin(parser, {
              autoUpdateHumanBones: true,
            })
        );

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

            // Load idle animations
            const loadedIdleActions = await Promise.all(
              idleAnimations.map(async (url) => {
                const clip = await loadMixamoAnimation(url, vrm);
                const action = newMixer.clipAction(clip);
                return action;
              })
            );
            setIdleActions(loadedIdleActions);

            // Load talk animations
            const loadedTalkActions = await Promise.all(
              talkAnimations.map(async (url) => {
                const clip = await loadMixamoAnimation(url, vrm);
                const action = newMixer.clipAction(clip);
                return action;
              })
            );
            setTalkActions(loadedTalkActions);

            // Play the first idle animation by default
            if (loadedIdleActions.length > 0) {
              const action = loadedIdleActions[0];
              action.play();
              setCurrentAction(action);
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
    if (
      audioBlob &&
      blendShapes.length > 0 &&
      gltf &&
      (talkActions.length > 0 || idleActions.length > 0) &&
      mixer
    ) {
      // Increment the audioBlob counter
      audioBlobCounterRef.current += 1;

      // Determine whether to play talk animation or not
      const shouldPlayTalkAnimation = audioBlobCounterRef.current % 2 === 1;

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

        if (shouldPlayTalkAnimation && talkActions.length > 0) {
          // Set isTalking to true and play a random talk animation
          setIsTalking(true);

          // Play a random talkAnimation
          const randomIndex = Math.floor(Math.random() * talkActions.length);
          const talkAction = talkActions[randomIndex];

          // Cross-fade from currentAction to talkAction
          if (currentAction) {
            currentAction.fadeOut(0.5);
          }
          talkAction.reset().fadeIn(0.5).play();
          setCurrentAction(talkAction);
        } else {
          // Continue with idle animations
          setIsTalking(false);
          if (currentAction && idleActions.includes(currentAction)) {
            // Do nothing, continue current idle animation
          } else if (idleActions.length > 0) {
            const nextIdleAction =
              idleActions[Math.floor(Math.random() * idleActions.length)];
            if (currentAction) {
              currentAction.fadeOut(0.5);
            }
            nextIdleAction.reset().fadeIn(0.5).play();
            setCurrentAction(nextIdleAction);
          }
        }
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
    } else {
      setAudioReady(false);
      setIsTalking(false); // Reset talking state
      if (gltf) {
        const expressionManager = (gltf.userData.vrm as VRM).expressionManager;
        if (expressionManager) {
          expressionManager.resetValues();
          expressionManager.update();
        }
      }
    }
    // Dependencies adjusted to avoid unnecessary re-renders
  }, [audioBlob, blendShapes, gltf, audioRef, talkActions, idleActions, mixer]);

  // Frame update for animations and blend shapes synchronization
  useFrame((_, delta) => {
    if (mixer) {
      mixer.update(delta);

      if (currentAction) {
        const clipDuration = currentAction.getClip().duration;
        const timeRemaining = clipDuration - currentAction.time;

        // Check if current action is about to finish
        if (timeRemaining <= 0.5) {
          if (isTalking && talkActions.includes(currentAction)) {
            // Talk animation has finished, switch back to idle animations
            setIsTalking(false);

            if (idleActions.length > 0) {
              const nextIdleAction =
                idleActions[Math.floor(Math.random() * idleActions.length)];
              currentAction.fadeOut(0.5);
              nextIdleAction.reset().fadeIn(0.5).play();
              setCurrentAction(nextIdleAction);
            }
          } else if (!isTalking && idleActions.includes(currentAction)) {
            // Transition between idle animations
            const currentIndex = idleActions.indexOf(currentAction);
            const nextIndex = (currentIndex + 1) % idleActions.length;
            const nextAction = idleActions[nextIndex];

            currentAction.fadeOut(0.5);
            nextAction.reset().fadeIn(0.5).play();
            setCurrentAction(nextAction);
          }
        }
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

  return gltf && idleActions.length > 0 ? (
    <Suspense fallback={null}>
      <primitive
        object={gltf.scene}
        position={position}
        scale={scale}
        rotation={rotation}
      />
    </Suspense>
  ) : null;
};

export default VrmAvatar;
