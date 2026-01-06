export class Node {
  id: number;
  value: any;
  neighbors: Node[];

  constructor(id: number, value: any) {
    this.id = id;
    this.value = value;
    this.neighbors = [];
  }

  addNeighbor(node: Node) {
    this.neighbors.push(node);
  }
}