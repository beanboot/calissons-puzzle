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

// type for node values (includes 2D coordinates)
export type NodeValue = CubeCoord & {
  px: number;
  py: number;
}

export type Edge = {
  nodeA: Node;
  nodeB: Node;
}