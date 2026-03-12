import { CUBE_DIRECTIONS } from "./Constants";
import type { Graph } from "./Graph";
import { addCubeCoords, randomIntFromInterval } from "./HelperFunctions";
import type { Edge } from "./Types";

export function generateEdges(graph: Graph, numOfEdges: number): Edge[] {
  const edges: Edge[] = []

  while (edges.length < numOfEdges) {

    const randomNode = graph.nodes[randomIntFromInterval(0, graph.nodes.length - 1)]
    const randomDirection = CUBE_DIRECTIONS[randomIntFromInterval(0, 2)]

    const randomNodeTarget = addCubeCoords(
      {q: randomNode.value.q, r: randomNode.value.r, s: randomNode.value.s},
      randomDirection
    )

    const target = graph.index.get(`${randomNodeTarget.q},${randomNodeTarget.r},${randomNodeTarget.s}`)

    if (!target) continue

    if (!(randomNode.neighbours.length > 4 || target.neighbours.length > 4)) continue

    const exists = edges.some(e =>
      (e.nodeA.id === randomNode.id && e.nodeB.id === target.id) ||
      (e.nodeA.id === target.id && e.nodeB.id === randomNode.id)
    )

    if (!exists) {
      edges.push({ nodeA: randomNode, nodeB: target })
    }
  }

  return edges
}