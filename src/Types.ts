import { Node } from "./Node";

export type CubeCoord = {
  q: number;
  r: number;
  s: number;
}

export type CubeDirection = CubeCoord & {
    direction: string;
}

export type Point = {
  x: number;
  y: number;
}

export type CalissonTile = {
  id: string;
  points: Point[];
  nodeA: Node;
  nodeB: Node;
}

// Type for nodes in 2D grid visualisation
export type NodeValue = CubeCoord & {
  px: number;
  py: number;
}

export type Edge = {
  nodeA: Node;
  nodeB: Node;
  direction: string;
}

// 3D cube type for solving algorithm
export type Cube3D = {
    id: number;
    x: number;
    y: number;
    z: number;
}