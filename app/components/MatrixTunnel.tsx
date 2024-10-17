// components/MatrixTunnel.tsx
import React, { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

// Define the props interface for RoundedPlane
interface RoundedPlaneProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  width?: number;
  height?: number;
  radius?: number;
  opacity?: number;
}

const RoundedPlane = React.forwardRef<THREE.Line, RoundedPlaneProps>(
  (
    {
      position = [0, 0, 0],
      rotation = [0, 0, 0],
      color = "#98f040",
      width = 2,
      height = 1,
      radius = 0.2,
      opacity = 1,
    },
    ref
  ) => {
    const shape = React.useMemo(() => {
      const x = 0;
      const y = 0;

      const shape = new THREE.Shape();

      shape.moveTo(x + radius, y);
      shape.lineTo(x + width - radius, y);
      shape.quadraticCurveTo(x + width, y, x + width, y + radius);
      shape.lineTo(x + width, y + height - radius);
      shape.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
      );
      shape.lineTo(x + radius, y + height);
      shape.quadraticCurveTo(x, y + height, x, y + height - radius);
      shape.lineTo(x, y + radius);
      shape.quadraticCurveTo(x, y, x + radius, y);

      return shape;
    }, [width, height, radius]);

    const points = React.useMemo(
      () =>
        shape
          .getPoints(64)
          .map(
            (p) =>
              [p.x - width / 2, p.y - height / 2, 0] as [number, number, number]
          ),
      [shape, width, height]
    );

    return (
      <group position={position} rotation={rotation}>
        <Line
          ref={ref as any}
          points={points}
          color={color}
          lineWidth={1}
          transparent
          opacity={opacity}
        />
      </group>
    );
  }
);

RoundedPlane.displayName = "RoundedPlane";

function createLinePoints() {
  const linePoints: [number, number, number][][] = [];

  // Left side (from bottom to top)
  for (let y = 0; y <= 4; y += 0.5) {
    linePoints.push([
      [-5, y, -10],
      [-5, y, 10],
    ]);
  }

  // Top side (from left to right)
  for (let x = -5; x <= 5; x += 0.5) {
    linePoints.push([
      [x, 4, -10],
      [x, 4, 10],
    ]);
  }

  // Right side (from top to bottom)
  for (let y = 4; y >= 0; y -= 0.5) {
    linePoints.push([
      [5, y, -10],
      [5, y, 10],
    ]);
  }

  // Bottom side (from right to left)
  for (let x = 5; x >= -5; x -= 0.5) {
    linePoints.push([
      [x, 0, -10],
      [x, 0, 10],
    ]);
  }

  return linePoints;
}

const linePoints = createLinePoints();

const MatrixTunnel: React.FC = () => {
  // Parameters
  const planeCount = 200; // Increased plane count for smoother tunnel
  const planeSpacing = 0.25;
  const speed = 0.01; // Adjusted speed for smoother animation
  const zSpawn = 10; // Z position where planes spawn
  const zReset = -10; // Z position where planes reset back to zSpawn

  // Fade-out parameters
  const zFadeOutStart = 1; // Z position where planes start fading out
  const zFadeOutEnd = -5; // Z position where planes are fully transparent

  // Create an array of planes with positions and refs
  const planes = useMemo(() => {
    const arr: { z: number; ref: React.RefObject<THREE.Line> }[] = [];
    for (let i = 0; i < planeCount; i++) {
      const zPosition = zSpawn - i * planeSpacing;
      arr.push({
        z: zPosition,
        ref: React.createRef<THREE.Line>(), // Ref to access Line component
      });
    }
    return arr;
  }, [planeCount, planeSpacing, zSpawn]);

  // Animate the planes
  useFrame(() => {
    planes.forEach((plane) => {
      plane.z -= speed; // Move planes towards negative Z
      if (plane.z < zReset) {
        plane.z = zSpawn; // Reset to spawn position individually
      }

      // Compute opacity based on plane.z
      let opacity = (plane.z - zFadeOutStart) / (zFadeOutEnd - zFadeOutStart);
      opacity = 1 - opacity; // Reverse the fade direction
      opacity = Math.max(0, Math.min(1, opacity)); // Clamp between 0 and 1

      // Update position and opacity directly
      if (plane.ref.current) {
        // Update position
        const parent = plane.ref.current.parent as THREE.Group;
        parent.position.z = plane.z;

        // Update opacity
        const material = plane.ref.current.material as THREE.Material;
        material.opacity = opacity;
      }
    });
  });

  // Prepare linePoints with per-vertex colors
  const lineSegments = useMemo(() => {
    const segments: {
      points: [number, number, number][];
      colors: number[][];
    }[] = [];

    linePoints.forEach((line) => {
      const numPoints = 50;
      const points: [number, number, number][] = [];
      const colors: number[][] = [];

      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const x = line[0][0] * (1 - t) + line[1][0] * t;
        const y = line[0][1] * (1 - t) + line[1][1] * t;
        const z = line[0][2] * (1 - t) + line[1][2] * t;

        points.push([x, y, z]);

        // Compute opacity based on z position
        let opacity = (z - zFadeOutStart) / (zFadeOutEnd - zFadeOutStart);
        opacity = 1 - opacity; // Reverse the fade direction
        opacity = Math.max(0, Math.min(1, opacity)); // Clamp between 0 and 1

        // Create color with opacity
        const color = new THREE.Color("#98f040");
        colors.push([color.r, color.g, color.b, opacity]);
      }

      segments.push({ points, colors });
    });

    return segments;
  }, [zFadeOutStart, zFadeOutEnd]);

  return (
    <group>
      {planes.map((plane, idx) => (
        <RoundedPlane
          key={idx}
          ref={plane.ref}
          position={[0, 2, plane.z]}
          rotation={[0, 0, 0]}
          color="#98f040"
          width={10}
          height={4}
          radius={0.5}
          opacity={1} // Initial opacity (will be updated in useFrame)
        />
      ))}

      {lineSegments.map((segment, index) => (
        <Line
          key={index}
          points={segment.points}
          vertexColors={segment.colors.flat() as any}
          transparent
        />
      ))}
    </group>
  );
};

export default MatrixTunnel;
