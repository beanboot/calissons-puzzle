import { Node } from "./Node";

export class Graph {
  nodes: Node[];

  constructor() {
    this.nodes = [];
  }

  addNode(id: number, value: any) {
    const node = new Node(id, value);
    this.nodes.push(node);
  }

  addEdge(source: Node, destination: Node, orientation: number) {
    source.addNeighbor(destination, orientation);
    destination.addNeighbor(source, orientation);
  }
}

