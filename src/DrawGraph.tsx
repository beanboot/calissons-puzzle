import { Graph } from "./Graph";
import type { Point, Edge } from "./Types";
import { Node } from "./Node";
import { findPointsFromNodes, getNodeFillFromNodes } from "./HelperFunctions";

// function to visualise graph
export function DrawGraph({ graph, edges, hoveredNodeAdjacentNodes, onNodeClick, onNodeHover }:
{ graph: Graph; edges: Edge[]; hoveredNodeAdjacentNodes: Node[]; onNodeClick: (points: Point[], nodes: Node[]) => void; 
  onNodeHover: (adjacentNodes: Node[] | null) => void;}) {
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
              strokeWidth={.06}
            />
            );
          } else {
            if (edges.some(e =>
              (e.nodeA.id === node.id && e.nodeB.id === n.id) ||
              (e.nodeA.id === n.id && e.nodeB.id === node.id)
            )) {
              return (
              <line
                key={`edge-${i}-${j}`}
                x1={node.value.px}
                y1={node.value.py}
                x2={n.value.px}
                y2={n.value.py}
                stroke="black"
                strokeWidth={.08}
              />
              );
            } else {
              return ([
              // Dashed line between inner nodes
              <line
                key={`edge-${i}-${j}`}
                x1={node.value.px}
                y1={node.value.py}
                x2={n.value.px}
                y2={n.value.py}
                stroke="black"
                strokeWidth={.03}
                strokeDasharray=".1 .2"
                strokeDashoffset={.15}
                strokeLinecap="round"
              />,

              // tile placing interactive node
              <circle
                key={`circle-${i}-${j}`}
                className="node"
                cx={((node.value.px + n.value.px) / 2)}
                cy={((node.value.py + n.value.py) / 2)}
                r=".1"
                stroke="black"
                strokeWidth={.05}
                strokeOpacity={0.5}
                fill={getNodeFillFromNodes(node, n, hoveredNodeAdjacentNodes)}
                onClick={() =>
                  onNodeClick(findPointsFromNodes(node, n), [node, n])
                }
                onMouseEnter={() =>
                  onNodeHover([node, n])
                }
                onMouseLeave={() =>
                  onNodeHover(null)
                }
              />
              ]);
          }}
          })
      )}
      
      {/* draws a dot for every node */}
      {graph.nodes.map((node, i) => ([
        <circle
          key={i}
          cx={node.value.px}
          cy={node.value.py}
          r=".1"
          fill="black"
        />,

        // debugging info
        // <text
        //   x={node.value.px + 0.1}
        //   y={node.value.py - 0.05}
        //   fontSize="0.2"
        //   fill="black"
        // >
        //   {`(${node.value.q},${node.value.r},${node.value.s})`}
        // </text>
      ]))}
    </>
  );
}
