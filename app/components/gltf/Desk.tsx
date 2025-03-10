/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.2 ./public/glbs/desk.glb --output ./app/components/gltf/Desk.tsx 
*/

import * as THREE from "three";
import React from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    Line027: THREE.Mesh;
    Object001: THREE.Mesh;
    Object002: THREE.Mesh;
    Object003: THREE.Mesh;
    Object004: THREE.Mesh;
    Object005: THREE.Mesh;
    Object006: THREE.Mesh;
    Object007: THREE.Mesh;
    Object008: THREE.Mesh;
    Object009: THREE.Mesh;
    Object010: THREE.Mesh;
    Object011: THREE.Mesh;
    Plane003: THREE.Mesh;
    Line028: THREE.Mesh;
    Object012: THREE.Mesh;
    Object013: THREE.Mesh;
    Object014: THREE.Mesh;
    Object015: THREE.Mesh;
    Object016: THREE.Mesh;
    Object017: THREE.Mesh;
    Object018: THREE.Mesh;
    Object019: THREE.Mesh;
    Object020: THREE.Mesh;
    Object021: THREE.Mesh;
    Object022: THREE.Mesh;
    Plane005: THREE.Mesh;
    _FLOOR: THREE.Mesh;
    frame: THREE.Mesh;
    base: THREE.Mesh;
    screen: THREE.Mesh;
    top: THREE.Mesh;
    ["top-rim"]: THREE.Mesh;
  };
  materials: {
    ["Material #2.001"]: THREE.MeshStandardMaterial;
    ["Material #6"]: THREE.MeshStandardMaterial;
    ["Material #2.001"]: THREE.MeshStandardMaterial;
    ["08 - Default90trvds"]: THREE.MeshStandardMaterial;
    screens: THREE.MeshStandardMaterial;
    ["Material #1.001"]: THREE.MeshStandardMaterial;
    ["Material #6"]: THREE.MeshStandardMaterial;
  };
};

export function Model(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF("/glbs/desk.glb") as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <group position={[-1.43, 0.457, 0.172]} scale={0.025}>
        <mesh
          geometry={nodes.Line027.geometry}
          material={materials["Material #2.001"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object001.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object002.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object003.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object004.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object005.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object006.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object007.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object008.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object009.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object010.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object011.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Plane003.geometry}
          material={materials["Material #2.001"]}
          position={[4.046, 0, 14.611]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </group>
      <group
        position={[1.433, 0.457, 0.172]}
        rotation={[Math.PI, 0, 0]}
        scale={-0.025}
      >
        <mesh
          geometry={nodes.Line028.geometry}
          material={materials["Material #2.001"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object012.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object013.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object014.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object015.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object016.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object017.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object018.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object019.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object020.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object021.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Object022.geometry}
          material={materials["Material #6"]}
          position={[14.046, 14.493, 13.428]}
        />
        <mesh
          geometry={nodes.Plane005.geometry}
          material={materials["Material #2.001"]}
          position={[4.046, 0, 14.611]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </group>
      {/* <mesh geometry={nodes._FLOOR.geometry} material={materials['08 - Default90trvds']} position={[0, 0, -0.013]} scale={[0.015, 0.345, 0.015]} /> */}
      <mesh
        geometry={nodes.frame.geometry}
        material={materials["Material #2.001"]}
        position={[-1.119, 0.896, 0.596]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.025}
      />
      <mesh
        geometry={nodes.base.geometry}
        material={materials["Material #2.001"]}
        position={[1.642, 0, 0.164]}
        rotation={[Math.PI, 0, 0]}
        scale={-0.025}
      />
      <mesh
        geometry={nodes.screen.geometry}
        material={materials.screens}
        position={[-0.202, 0.039, 3.396]}
        rotation={[Math.PI, 0, 0]}
        scale={-0.025}
      />
      <mesh
        geometry={nodes.top.geometry}
        material={materials["Material #1.001"]}
        position={[0, 0.919, 7.026]}
        rotation={[Math.PI, 0, 0]}
        scale={-0.025}
      />
      <mesh
        geometry={nodes["top-rim"].geometry}
        material={materials["Material #6"]}
        position={[0, 0.919, 7.026]}
        rotation={[Math.PI, 0, 0]}
        scale={-0.025}
      />
    </group>
  );
}

useGLTF.preload("/glbs/desk.glb");
