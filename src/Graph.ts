import { Node } from "./Node";

export class Graph {
  nodes: Node[];

  constructor() {
    this.nodes = [];
  }

  addNode(value: any) {
    const node = new Node(value);
    this.nodes.push(node);
  }

  addEdge(source: Node, destination: Node) {
    source.addNeighbor(destination);
    destination.addNeighbor(source);
  }
}

