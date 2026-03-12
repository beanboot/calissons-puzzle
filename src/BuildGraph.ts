import { Graph } from "./Graph";
import { Node } from "./Node";
import type { NodeValue } from "./Types";
import { addCubeCoords } from "./HelperFunctions";
import { CUBE_DIRECTIONS } from "./Constants";

// graph building function
export function buildGraph(size: number) {
  // initialize graph
  const graph = new Graph();

  let nextNodeId = 0;

  for (let q = 0; q <= size; q++) {
    for (let r = 0; r <= size; r++) {
      for (let s = 0; s <= size; s++) {

        // 2D projection vectors
        const px = -((r * -(Math.sqrt(3)/2)) + (q * (Math.sqrt(3)/2)))
        const py = -((r * -(1/2)) + (q * -(1/2)) + (s))

        let drawn = false

        for (const node of graph.nodes) {
          for (let k = 0; k <= size; k++) {
            if (q - k === node.value.q && r - k === node.value.r && s - k === node.value.s) {
              drawn = true
            }
          }
        }

        if (!drawn) {
          const value: NodeValue = {
            q, r, s, px, py
          };
          graph.addNode(nextNodeId, value)
          nextNodeId++
        }
      }
    }
  }

  // initializing a new map / index
  const index = new Map<string, Node>()
  graph.index = index

  // add each node to the map for easy searching
  for (const node of graph.nodes) {
    index.set(`${node.value.q},${node.value.r},${node.value.s}`, node);
  }

  // iterates through all graph nodes and checks each direction to add an edge between node and neighbour
  for (const node of graph.nodes) {
    for (const dir of CUBE_DIRECTIONS) {
      const target = addCubeCoords({q: node.value.q, r: node.value.r, s: node.value.s}, dir)

      const neighbour = index.get(`${target.q},${target.r},${target.s}`);

      if (!neighbour) continue;

      if (neighbour.id > node.id) {
        graph.addUndirectedEdge(node, neighbour);
      }
    }
  }

  return graph
}