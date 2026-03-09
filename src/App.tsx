import { useState, useEffect, useMemo } from "react";
import { Graph } from "./Graph";
import { Node } from "./Node";
import { isSolvable } from "./SolvingAlgorithm";
import "./App.css";

type CubeCoord = {
  q: number;
  r: number;
  s: number;
}

function addCubeCoords(a: CubeCoord, b: CubeCoord): CubeCoord {
  return {
    q: a.q + b.q,
    r: a.r + b.r,
    s: a.s + b.s
  }
}

type Point = {
  x: number;
  y: number;
};

type CalissonTile = {
  id: string;
  points: Point[];
};

type Edge = {
  nodeA: Node;
  nodeB: Node;
}

// type for node values (includes 2D coordinates)
type NodeValue = CubeCoord & {
  x: number;
  y: number;
};

// constant for all directional movements that can be made from any coordinate
const CUBE_DIRECTIONS: CubeCoord[] = [
  {q: 1, r: 0, s: -1},
  {q: 1, r: -1, s: 0},
  {q: 0, r: -1, s: 1},
  {q: -1, r: 0, s: 1},
  {q: -1, r: 1, s: 0},
  {q: 0, r: 1, s: -1},
]

// min max included
function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// returns points from which calisson tile should be drawn
const findPointsFromNodes = (nodeA: Node, nodeB: Node): Point[] => {
  const sharedNeighbours: Node[] = []

  for (const neighbourA of nodeA.neighbours) {
    for (const neighbourB of nodeB.neighbours) {
      if (neighbourA == neighbourB) {
        sharedNeighbours.push(neighbourA)
      }
    }
  }

  return ([
    {x: nodeA.value.x, y: nodeA.value.y},
    {x: sharedNeighbours[0].value.x, y: sharedNeighbours[0].value.y},
    {x: nodeB.value.x, y: nodeB.value.y},
    {x: sharedNeighbours[1].value.x, y: sharedNeighbours[1].value.y},
  ])
};

const GetFillFromPoints = (a: Point, b: Point): string => {
  let fill: string;

  if (a.x === b.x) {
    fill = "yellow";
  } else if (a.x > b.x) {
    if (a.y > b.y) {
      fill = "red"
    } else {
      fill = "blue"
    }
  } else {
    if (a.y > b.y) {
      fill = "blue"
    } else {
      fill = "red"
    }
  }

  return fill;
} 

function DrawCalissonTile({ tile }: { tile: CalissonTile }) {
  const pointsAttr = tile.points
    .map(p => `${p.x},${p.y}`)
    .join(" ");

  const a = tile.points[0];
  const b = tile.points[2];

  let fill: string;

  fill = GetFillFromPoints(a, b)

  return (
    <polygon
      points={pointsAttr}
      fill={fill}
      opacity={0.8}
    />
  );
}

function countSharedPoints(a: Point[], b: Point[]): number {
  let count = 0;

  for (const p1 of a) {
    for (const p2 of b) {
      if (p1.x === p2.x && p1.y === p2.y) {
        count++;
      }
    }
  }

  return count;
}

function canPlaceTile(points: Point[], tiles: CalissonTile[]): boolean {
  for (const tile of tiles) {
    const shared = countSharedPoints(tile.points, points);
    if (shared === 3) {
      return false;
    }
  }

  return true;
}

function getNodeFillFromPoints(a: Point[], b: Point[]): string {
  if (countSharedPoints(a, b) === 4) {
    return(GetFillFromPoints(a[0], a[2]))
  } else {
    return("white")
  }
}

// graph building function
function buildGraph(size: number) {
  // initialize graph
  const graph = new Graph();

  let nextNodeId = 0;

  // iterates through coordinates according to cube size and infers the s coord through axial coordinate system
  for (let q = -size; q <= size; q++) {
    for (let r = -size; r <= size; r++) {
      const s = -q - r;

      // if s is within the size -> create a node for that coodinate with the current node id
      if (Math.abs(s) <= size) {
        const value: NodeValue = {
          q, r, s,
          x: (3/2 * q),
          y: (Math.sqrt(3)/2 * q + Math.sqrt(3) * r)
        };
        graph.addNode(nextNodeId, value);
        nextNodeId++;
      }
    }
  }

  // initializing a new map / index
  const index = new Map<string, Node>();

  // add each node to the map for easy searching
  for (const node of graph.nodes) {
    index.set(`${node.value.q},${node.value.r},${node.value.s}`, node);
  }

  // iterates through all graph nodes and checks each direction to add an edge between node and neighbour
  for (const node of graph.nodes) {
    for (const dir of CUBE_DIRECTIONS) {
      const target = addCubeCoords({q: node.value.q, r: node.value.r, s: node.value.s}, dir)

      const neighbor = index.get(`${target.q},${target.r},${target.s}`);

      if (!neighbor) continue;

      if (neighbor.id > node.id) {
        graph.addUndirectedEdge(node, neighbor);
      }
    }
  }

  return graph;
}

// function to visualise graph
function DrawGrid({ graph, edges, hoveredNodePoints, onNodeClick, onNodeHover }:
{ graph: Graph; edges: Edge[]; hoveredNodePoints: Point[]; onNodeClick: (points: Point[]) => void; onNodeHover: (points: Point[] | null) => void;}) {
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
              x1={node.value.x}
              y1={node.value.y}
              x2={n.value.x}
              y2={n.value.y}
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
                x1={node.value.x}
                y1={node.value.y}
                x2={n.value.x}
                y2={n.value.y}
                stroke="black"
                strokeWidth={.08}
              />
              );
            } else {
              return ([
              <line
                key={`edge-${i}-${j}`}
                x1={node.value.x}
                y1={node.value.y}
                x2={n.value.x}
                y2={n.value.y}
                stroke="black"
                strokeWidth={.03}
                strokeDasharray=".1 .2"
                strokeDashoffset={.1}
                strokeLinecap="round"
              />,

              // calisson tile interactive node
              <circle
                key={`circle-${i}-${j}`}
                className="node"
                cx={((node.value.x + n.value.x) / 2)}
                cy={((node.value.y + n.value.y) / 2)}
                r=".1"
                stroke="black"
                strokeWidth={.05}
                strokeOpacity={0.5}
                fill={getNodeFillFromPoints(findPointsFromNodes(node, n), hoveredNodePoints)}
                onClick={() =>
                  onNodeClick(findPointsFromNodes(node, n))
                }
                onMouseEnter={() =>
                  onNodeHover(findPointsFromNodes(node, n))
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
          cx={node.value.x}
          cy={node.value.y}
          r=".1"
          fill="black"
        />,

        // debugging info
        <text
          x={node.value.x + 0.1}
          y={node.value.y - 0.05}
          fontSize="0.2"
          fill="black"
        >
          {`(${node.value.q},${node.value.r},${node.value.s}), (${node.value.x},${node.value.y})`}
        </text>
      ]))}
    </>
  );
}

export default function App() {
  // sets default grid size
  const [gridSize, setGridSize] = useState(2);

  // initiates tiles state
  const [tiles, setTiles] = useState<CalissonTile[]>([]);

  const [edges, setEdges] = useState<Edge[]>([]);

  const [hoveredNodePoints, setHoveredNodePoints] = useState<Point[]>([]);

  const graph = useMemo(() => buildGraph(gridSize), [gridSize]);

  function handleNodeClick(points: Point[]) {
    const id = points.map(p => `${p.x},${p.y}`).join("|");

    setTiles(prevTiles => {
      const tileExists = prevTiles.find(tile => tile.id === id);

      if (tileExists) {
        return prevTiles.filter(tile => tile.id !== id);
      }

      if (!canPlaceTile(points, prevTiles)) {
        return prevTiles;
      }

      return [
        ...prevTiles,
        {
          id: id,
          points: points
        }
      ];
    });
  }

  function handleNodeHover(points: Point[] | null) {
    if (points === null) {
      setHoveredNodePoints([])
    } else {
      setHoveredNodePoints(points)
    }
  }

function makeRandomEdges(numOfEdges: number) {
  const nodes = graph.nodes;
  if (!nodes.length) return;

  for (let i = 0; i < numOfEdges; i++) {
    const node = nodes[randomIntFromInterval(0, nodes.length - 1)];

    const neighbours = node.neighbours;

    if (!neighbours.length) continue;

    const neighbour =
      neighbours[randomIntFromInterval(0, neighbours.length - 1)];

    if (node.id === neighbour.id) continue;

    setEdges(prev => {
      const alreadyExists = prev.some(e =>
        (e.nodeA.id === node.id && e.nodeB.id === neighbour.id) ||
        (e.nodeA.id === neighbour.id && e.nodeB.id === node.id)
      );

      if (alreadyExists) return prev;

      return [...prev, { nodeA: node, nodeB: neighbour }];
    });
  }
}

  useEffect(() => {
    setEdges([]);
    makeRandomEdges(1);
  }, [gridSize]);

  // limits the grid size to 4
  const clamp = (n: number) => Math.max(1, Math.min(4, Math.floor(n)));

  const R = gridSize + 1;
  const width = 3 * R;
  const height = Math.sqrt(3) * 2 * R;

  console.log(isSolvable(gridSize, edges))

  return (
    <div className="app">

      <h1 className="h1">Calissons Puzzle</h1>

      <svg
        viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="board"
      >
        {tiles.map(tile => (
          <DrawCalissonTile key={tile.id} tile={tile} />
        ))}

        <DrawGrid graph={graph} edges={edges} hoveredNodePoints={hoveredNodePoints} onNodeClick={handleNodeClick} onNodeHover={handleNodeHover}/>
      </svg>

      <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: 8 }}>
        <label style={{ display: "flex", flexDirection: "row", gap: 8, color: "black" }}>
          Grid Size:
          <button
            type="button"
            aria-label="decrease grid size"
            onClick={() => {
              setGridSize(prev => clamp(prev - 1));
              setTiles([])
            }}
          >
            -
          </button>

          <input
            type="text"
            value={String(gridSize)}
            readOnly
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            style={{ width: "36px", textAlign: "center" }}
          />

          <button
            type="button"
            aria-label="increase grid size"
            onClick={() => {
              setGridSize(prev => clamp(prev + 1));
              setTiles([]);
            }}
          >
            +
          </button>
        </label>
      </div>
    </div>
  );
}
