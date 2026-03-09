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

  addUndirectedEdge(source: Node, destination: Node) {
    source.addNeighbour(destination);
    destination.addNeighbour(source);
  }

  addDirectedEdge(source: Node, destination: Node) {
    source.addNeighbour(destination);
  }
}

