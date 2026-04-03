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
  nodes: Node[];
  fill: string;
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

export type Difficulties = "EASY" | "MEDIUM" | "HARD"

export type SolvedEdge = {
  nodeA: Node
  nodeB: Node
}

// Used for daily mode to retain information when switching difficulties
export type DifficultyState = {
    tileIDs: string[]
    isSolved: boolean
    autoSolved: boolean
    startTime: number | null
    elapsedTime: number
}