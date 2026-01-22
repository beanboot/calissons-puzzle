export class Node {
  id: number;
  value: any;
  neighbors: [Node, number][]

  constructor(id: number, value: any) {
    this.id = id;
    this.value = value;
    this.neighbors = [];
  }

  addNeighbor(node: Node, orientation: number) {
    this.neighbors.push([node, orientation]);
  }
}