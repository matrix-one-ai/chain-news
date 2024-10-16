import * as THREE from "three";
import {
  MeshSineMaterial,
  BentPlaneGeometry,
} from "./app/components/BentScreen";
import { ReactThreeFiber } from "@react-three/fiber";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      bentPlaneGeometry: ReactThreeFiber.Object3DNode<
        BentPlaneGeometry,
        typeof BentPlaneGeometry
      >;
      meshSineMaterial: ReactThreeFiber.Object3DNode<
        MeshSineMaterial,
        typeof MeshSineMaterial
      >;
    }
  }
}
