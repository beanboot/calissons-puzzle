import { Graph } from "./Graph";
import type { Point, Edge } from "./Types";
import { Node } from "./Node";
import { findTileNodes, findTilePoints, getNodeFillFromNodes } from "./MiscellaneousFunctions";

// Function to visualise 2D puzzle graph
export function DrawInteractiveGrid({
	graph,
	edges,
	interactable,
	hoveredNodeAdjacentNodes,
	onNodeClick,
	onNodeHover,
	canPlaceTileOnNode,
}: {
	graph: Graph;
	edges: Edge[];
	interactable: boolean;
	hoveredNodeAdjacentNodes: Node[];
	onNodeClick: (points: Point[], nodes: Node[]) => void;
	onNodeHover: (adjacentNodes: Node[] | null) => void;
	canPlaceTileOnNode: (points: Point[]) => boolean;
}) {
	return (
		<>
			{/* Map applies a function to each element iteratively */}
			{graph.nodes.map((node, i) =>
				node.neighbours.map((n, j) => {
					{
						/* If neighbour id is less than current node id, it means its already been checked */
					}
					if (n.id <= node.id) return null;

					{
						/* Checks if node is a border node and draws a line */
					}
					if (node.neighbours.length <= 4 && n.neighbours.length <= 4) {
						return (
							<line
								key={`edge-${i}-${j}`}
								x1={node.value.px}
								y1={node.value.py}
								x2={n.value.px}
								y2={n.value.py}
								stroke="black"
								strokeWidth={0.08}
								strokeLinecap="round"
							/>
						);
					} else {
						if (
							edges.some(
								(e) =>
									(e.nodeA.id === node.id && e.nodeB.id === n.id) ||
									(e.nodeA.id === n.id && e.nodeB.id === node.id),
							)
						) {
							return (
								<line
									key={`edge-${i}-${j}`}
									x1={node.value.px}
									y1={node.value.py}
									x2={n.value.px}
									y2={n.value.py}
									stroke="black"
									strokeWidth={0.08}
									strokeLinecap="round"
								/>
							);
						} else {
							return [
								// Dashed line between inner nodes
								<line
									key={`edge-${i}-${j}`}
									x1={node.value.px}
									y1={node.value.py}
									x2={n.value.px}
									y2={n.value.py}
									stroke="black"
									strokeWidth={0.03}
									strokeDasharray=".1 .2"
									strokeDashoffset={0.15}
									strokeLinecap="round"
								/>,

								// Tile placing interactive node
								interactable && canPlaceTileOnNode(findTilePoints(node, n)) && (
									<circle
										key={`circle-${i}-${j}`}
										className="node"
										cx={(node.value.px + n.value.px) / 2}
										cy={(node.value.py + n.value.py) / 2}
										r=".1"
										stroke="black"
										strokeOpacity={0.5}
										fill={getNodeFillFromNodes(
											node,
											n,
											hoveredNodeAdjacentNodes,
										)}
										onClick={() =>
											onNodeClick(
												findTilePoints(node, n),
												findTileNodes(node, n),
											)
										}
										onMouseEnter={() => onNodeHover([node, n])}
										onMouseLeave={() => onNodeHover(null)}
									/>
								),
							];
						}
					}
				}),
			)}

			{/* Draws a dot for every node*/}
			{graph.nodes.map((node, i) => [
				<circle key={i} cx={node.value.px} cy={node.value.py} r=".1" fill="black" />,

				// Debugging info
				// <text
				//   x={node.value.px + 0.1}
				//   y={node.value.py - 0.05}
				//   fontSize="0.2"
				//   fill="black"
				// >
				//   {`(${node.value.q},${node.value.r},${node.value.s})`}
				// </text>
			])}
		</>
	);
}
