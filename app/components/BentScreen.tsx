import * as THREE from "three";
import { extend } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Image } from "@react-three/drei";

// Paul West @prisoner849 https://discourse.threejs.org/u/prisoner849
// https://discourse.threejs.org/t/simple-curved-plane/26647/10
class BentPlaneGeometry extends THREE.PlaneGeometry {
  constructor(radius: number, ...args: any) {
    super(...args);
    const p = this.parameters;
    const hw = p.width * 0.5;
    const a = new THREE.Vector2(-hw, 0);
    const b = new THREE.Vector2(0, radius);
    const c = new THREE.Vector2(hw, 0);
    const ab = new THREE.Vector2().subVectors(a, b);
    const bc = new THREE.Vector2().subVectors(b, c);
    const ac = new THREE.Vector2().subVectors(a, c);
    const r =
      (ab.length() * bc.length() * ac.length()) / (2 * Math.abs(ab.cross(ac)));
    const center = new THREE.Vector2(0, radius - r);
    const baseV = new THREE.Vector2().subVectors(a, center);
    const baseAngle = baseV.angle() - Math.PI * 0.5;
    const arc = baseAngle * 2;
    const uv = this.attributes.uv;
    const pos = this.attributes.position;
    const mainV = new THREE.Vector2();
    for (let i = 0; i < uv.count; i++) {
      const uvRatio = 1 - uv.getX(i);
      const y = pos.getY(i);
      mainV.copy(c).rotateAround(center, arc * uvRatio);
      pos.setXYZ(i, mainV.x, y, -mainV.y);
    }
    pos.needsUpdate = true;
  }
}

class MeshSineMaterial extends THREE.MeshBasicMaterial {
  constructor(parameters = {}) {
    super(parameters);
    this.setValues(parameters);
    (this as any).time = { value: 0 };
  }
  onBeforeCompile(shader: any) {
    shader.uniforms.time = (this as any).time;
    shader.vertexShader = `
      uniform float time;
      ${shader.vertexShader}
    `;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `vec3 transformed = vec3(position.x, position.y + sin(time + uv.x * PI * 4.0) / 4.0, position.z);`
    );
  }
}

extend({ MeshSineMaterial, BentPlaneGeometry });

function BentScreen({
  url,
  position,
  rotation,
}: {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  const ref = useRef();

  useEffect(() => {
    if (ref?.current) {
      (ref.current as any).material.radius = 0.1;
    }
  }, []);

  return (
    <Image
      ref={ref as any}
      url={url}
      transparent
      side={THREE.DoubleSide}
      position={position}
      rotation={rotation}
    >
      <bentPlaneGeometry args={[0.25, 4, 2, 20, 20]} />
    </Image>
  );
}

export default BentScreen;
