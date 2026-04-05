import type { Graph } from "./Graph";
import { returnSharedNodes } from "./MiscellaneousFunctions";
import type { SolvedEdge, CalissonTile, Edge } from "./Types";

export function DrawSolvedGrid({ tiles, graph, edges, originalEdges }: { 
    tiles: CalissonTile[], 
    graph: Graph,
    edges: Edge[],
    originalEdges: boolean
}) {
    const solvedEdges: SolvedEdge[] = []

    for (const tileA of tiles) {
        for (const tileB of tiles) {
            const sharedNodes = returnSharedNodes(tileA.nodes, tileB.nodes)

            if (sharedNodes.length === 2 && tileA.fill !== tileB.fill) {
                const exists = solvedEdges.some(e =>
                    (e.nodeA.id === sharedNodes[0].id && e.nodeB.id === sharedNodes[1].id) ||
                    (e.nodeA.id === sharedNodes[1].id && e.nodeB.id === sharedNodes[0].id)
                )

                // Convoluted way of checking if edges are equal, only display previous edges when toggleEdges is true
                if (!exists) {
                    if (originalEdges) {
                        for (const edge of edges) {
                            if (sharedNodes[0].id === edge.nodeA.id && sharedNodes[1].id === edge.nodeB.id
                                || sharedNodes[0].id === edge.nodeB.id && sharedNodes[1].id === edge.nodeA.id) 
                            {
                                solvedEdges.push({nodeA: sharedNodes[0], nodeB: sharedNodes[1]})
                            } 
                        }
                    } else {
                        solvedEdges.push({nodeA: sharedNodes[0], nodeB: sharedNodes[1]})
                    }
                }
            }
        }
    }

    return (
        <>
        {/* map applies a function to each element iteratively */}
        {graph.nodes.map((node, i) =>
            node.neighbours.map((n, j) => {
                {/* if neighbour id is less than current node id, it means its already been checked */}
                if (n.id <= node.id) return null;
                
                {/* checks if node is a border node and draws a line */}
                if (node.neighbours.length <= 4 && n.neighbours.length <= 4) {
                    return (
                    <line
                    key={`edge-${i}-${j}`}
                    x1={node.value.px}
                    y1={node.value.py}
                    x2={n.value.px}
                    y2={n.value.py}
                    stroke="black"
                    strokeWidth={.08}
                    strokeLinecap="round"
                    />
                    );    
                }
            })
        )}

        {solvedEdges.map((edge, i) => {
            return (
                <line
                key={`solvedEdge-${i}`}
                x1={edge.nodeA.value.px}
                y1={edge.nodeA.value.py}
                x2={edge.nodeB.value.px}
                y2={edge.nodeB.value.py}
                stroke="black"
                strokeWidth={.08}
                strokeLinecap="round"
                />
            )
        })}
        </>
    )
}