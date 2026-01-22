import { useState } from "react";
import { Graph } from "./Graph";
import { Node } from "./Node";
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

type CalissonTile = {
  id: string;
  cx: number;
  cy: number;
  orientation: number;
};

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
    for (const [dirIndex, dir] of CUBE_DIRECTIONS.entries()) {
      const target = addCubeCoords({q: node.value.q, r: node.value.r, s: node.value.s}, dir)

      const orientation = dirIndex % 3

      const neighbor = index.get(`${target.q},${target.r},${target.s}`);

      if (!neighbor) continue;

      if (neighbor.id > node.id) {
        graph.addEdge(node, neighbor, orientation);
      }
    }
  }

  return graph;
}

// function to visualise graph
function DrawGrid({ graph, onNodeClick }:
{ graph: Graph; onNodeClick: (info: {cx: number; cy: number; orientation: number;}) => void }) {
  return (
    <>
      {/* map applies a function to each element iteratively */}
      {graph.nodes.map((node, i) =>
        node.neighbors.map((n, j) => {
          {/* if neighbour id is less than current node id, it means its already been checked */}
          if (n[0].id <= node.id) return null;
          
          {/* checks if node is an edge node and draws a line */}
          if (node.neighbors.length <= 4 && n[0].neighbors.length <= 4) {
            return (
            <line
              key={`edge-${i}-${j}`}
              x1={node.value.x}
              y1={node.value.y}
              x2={n[0].value.x}
              y2={n[0].value.y}
              stroke="black"
              strokeWidth={.06}
            />
            );
          
          {/* else the node is on the inside, and a dotted line is drawn plus a dot in the middle */}
          } else {
            return ([
            <line
              key={`edge-${i}-${j}`}
              x1={node.value.x}
              y1={node.value.y}
              x2={n[0].value.x}
              y2={n[0].value.y}
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
              cx={((node.value.x + n[0].value.x) / 2)}
              cy={((node.value.y + n[0].value.y) / 2)}
              r=".1"
              stroke="black"
              strokeWidth={.05}
              strokeOpacity={0.5}
              fill="white"
              onClick={() =>
                onNodeClick({
                  cx: (node.value.x + n[0].value.x) / 2,
                  cy: (node.value.y + n[0].value.y) / 2,
                  orientation: n[1]
                })
              }
            />
            ]);
          }
          })
      )}
      
      {/* draws a dot for every node */}
      {graph.nodes.map((node, i) => (
        <circle
          key={i}
          cx={node.value.x}
          cy={node.value.y}
          r=".1"
          fill="black"
        />
      ))}
    </>
  );
}

export default function App() {
  // sets default grid size
  const [gridSize, setGridSize] = useState(2);

  const [tiles, setTiles] = useState<CalissonTile[]>([]);

  function handleNodeClick({cx, cy, orientation}: 
  {
    cx: number;
    cy: number;
    orientation: number;
  }) {
    setTiles(prev => [
      ...prev,
      {
        id: `${cx},${cy},${orientation}`,
        cx,
        cy,
        orientation,
      },
    ]);
  }

  console.log("tiles:", tiles);

  // calls the buildGraph function
  const graph = buildGraph(gridSize);

  // limits the grid size to 4
  const clamp = (n: number) => Math.max(2, Math.min(4, Math.floor(n)));

  const R = gridSize + 1;
  const width = 3 * R;
  const height = Math.sqrt(3) * 2 * R;

  return (
    <div className="app">

      <h1 className="h1">Calissons Puzzle</h1>

      <svg
        viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="board"
      >
        <DrawGrid graph={graph} onNodeClick={handleNodeClick}/>
      </svg>

      <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: 8 }}>
        <label style={{ display: "flex", flexDirection: "row", gap: 8, color: "black" }}>
          Grid Size:
          <button
            type="button"
            aria-label="decrease grid size"
            onClick={() => setGridSize(prev => clamp(prev - 1))}
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
            onClick={() => setGridSize(prev => clamp(prev + 1))}
          >
            +
          </button>
        </label>
      </div>
    </div>
  );
}
