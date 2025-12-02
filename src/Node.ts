export class Node {
  value: any;
  neighbors: Node[];

  constructor(value: any) {
    this.value = value;
    this.neighbors = [];
  }

  addNeighbor(node: Node) {
    this.neighbors.push(node);
  }
}