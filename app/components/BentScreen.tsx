import * as THREE from "three";
import { extend, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import { Html, Image, useVideoTexture } from "@react-three/drei";

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

const VideoPlayer = ({
  url,
  position,
  rotation,
}: {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
}) => {
  const ref = useRef<any>();

  // Load video texture regardless of whether it's an image or video
  const videoTexture = useVideoTexture(url, {
    unsuspend: "canplay",
    crossOrigin: "Anonymous",
    muted: true,
    loop: true,
    start: true,
  });

  useFrame(() => {
    if (ref?.current) {
      (ref.current as any).material.radius = 0.1;
    }
  });

  return (
    <mesh
      ref={ref}
      key={url} // Add key prop here
      position={position}
      rotation={rotation}
      scale={[1, 1, 1]}
    >
      <bentPlaneGeometry args={[0.25, 4, 2, 20, 20]} />
      <meshBasicMaterial
        map={videoTexture}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const IframePlayer = ({
  url,
  position,
  rotation,
}: {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scriptRef = useRef<any>();

  useEffect(() => {
    const createScript = () => {
      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "autosize": true,
          "symbol": "SOLUSD",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "allow_symbol_change": true,
          "calendar": false,
          "support_host": "https://www.tradingview.com"
        }`;
      iframeRef?.current?.appendChild(script);
      scriptRef.current = script;
    };

    const timeout = setTimeout(() => {
      createScript();
    }, 1000);

    return () => {
      if (scriptRef.current) {
        scriptRef.current.remove();
      }
      if ((iframeRef.current as any)?.firstChild) {
        (iframeRef.current as any).removeChild(
          (iframeRef.current as any).firstChild
        );
      }
      clearTimeout(timeout);
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <Html
        position={position}
        rotation={rotation}
        occlude="blending"
        transform
        zIndexRange={[100, 0]}
        scale={0.1}
      >
        <div
          id="player"
          ref={iframeRef}
          style={{
            border: "none",
            height: "45rem",
            width: "95rem",
          }}
        />
      </Html>
    </Suspense>
  );
};

function BentScreen({
  url,
  position,
  rotation,
  isIframe,
}: {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  isIframe: boolean;
}) {
  const ref = useRef<any>();

  // Helper function to determine if the URL is a video based on file extension
  const isVideo = (url: string) => {
    const videoExtensions = [".mp4", ".webm", ".ogg"];
    return videoExtensions.some((ext) => url.endsWith(ext));
  };

  useFrame(() => {
    if (ref?.current) {
      (ref.current as any).material.radius = 0.1;
    }
  });

  if (isIframe) {
    return <IframePlayer url={url} position={position} rotation={rotation} />;
  } else if (isVideo(url)) {
    return <VideoPlayer url={url} position={position} rotation={rotation} />;
  } else {
    return (
      <Image
        key={url}
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
}

export default BentScreen;
