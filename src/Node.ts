import type { Cube3D } from "./Types";

export class Node {
  id: number;
  value: any;
  neighbours: Node[] = [];

  constructor(id: number, value: any) {
    this.id = id;
    this.value = value;
  }

  addNeighbour(node: Node) {
    this.neighbours.push(node);
  }
}

export class SolverNode {
  id: number;
  value: Cube3D;

  outEdges: SolverNode[] = [];
  inEdges: SolverNode[] = [];
  unbreakableEdges: SolverNode[] = [];

  constructor(id: number, value: Cube3D) {
    this.id = id;
    this.value = value;
  }
}