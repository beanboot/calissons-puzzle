export class Node {
  id: number;
  value: any;
  neighbours: Node[];

  constructor(id: number, value: any) {
    this.id = id;
    this.value = value;
    this.neighbours = [];
  }

  addNeighbour(node: Node) {
    this.neighbours.push(node);
  }
}