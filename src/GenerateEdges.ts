import { CUBE_DIRECTIONS } from "./Constants";
import type { Graph } from "./Graph";
import { addCubeCoords, randomIntFromInterval } from "./HelperFunctions";
import { isSolvable } from "./SolvingAlgorithm";
import type { Edge } from "./Types";

function generateRandomEdges(graph: Graph, numOfEdges: number): Edge[] {
  const edges: Edge[] = []

  while (edges.length < numOfEdges) {

    // Generates a random node and a random direction from said node
    const randomNode = graph.nodes[randomIntFromInterval(0, graph.nodes.length - 1)]
    const randomDirection = CUBE_DIRECTIONS[randomIntFromInterval(0, 2)]

    const randomNodeTarget = addCubeCoords(
      {q: randomNode.value.q, r: randomNode.value.r, s: randomNode.value.s},
      randomDirection
    )

    const target = graph.index.get(`${randomNodeTarget.q},${randomNodeTarget.r},${randomNodeTarget.s}`)

    // If the target node doesn't exist - loop again
    if (!target) continue

    // If both nodes are on the outside - loop again
    if (!(randomNode.neighbours.length > 4 || target.neighbours.length > 4)) continue

    const exists = edges.some(e =>
      (e.nodeA.id === randomNode.id && e.nodeB.id === target.id) ||
      (e.nodeA.id === target.id && e.nodeB.id === randomNode.id)
    )

    // If edge doesn't already exist - push edge to edges
    if (!exists) {
      edges.push({ nodeA: randomNode, nodeB: target, direction: randomDirection.direction })
    }
  }

  return edges
}

export function generateSolvableEdges(graph: Graph, numOfEdges: number, n: number): Edge[] {
  let edges: Edge[]

  do {
    edges = generateRandomEdges(graph, numOfEdges)
  } while (!isSolvable(edges, n))

  return edges
}