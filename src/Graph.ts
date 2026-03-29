import { Node, SolverNode } from "./Node";
import type { Cube3D } from "./Types";

export class Graph {
  nodes: Node[] = [];
  index = new Map<string, Node>()

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

export class SolverGraph {
  nodes: SolverNode[] = [];
  index = new Map<string, SolverNode>();

  addNode(id: number, value: Cube3D) {
    const node = new SolverNode(id, value);
    this.nodes.push(node)
  }

  addDirectedEdge(source: SolverNode, destination: SolverNode) {
    source.outEdges.push(destination);
    destination.inEdges.push(source);
  }

  addUnbreakableEdge(nodeA: SolverNode, nodeB: SolverNode) {
    nodeA.unbreakableEdges.push(nodeB)
    nodeB.unbreakableEdges.push(nodeA)
  }
}

