import { Node } from "./Node";

export class Graph {
  nodes: Node[];
  index: Map<string, Node>

  constructor() {
    this.nodes = [];
    this.index = new Map;
  }

  addNode(id: number, value: any) {
    const node = new Node(id, value);
    this.nodes.push(node);
  }

  addUndirectedEdge(source: Node, destination: Node) {
    source.addNeighbour(destination);
    destination.addNeighbour(source);
  }

  addDirectedEdge(source: Node, destination: Node) {
    source.addNeighbour(destination);
  }
}

