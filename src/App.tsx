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

type NodeValue = CubeCoord & {
  x: number;
  y: number;
};

const CUBE_DIRECTIONS: CubeCoord[] = [
  {q: 1, r: 0, s: -1},
  {q: 1, r: -1, s: 0},
  {q: 0, r: -1, s: 1},
  {q: -1, r: 0, s: 1},
  {q: -1, r: 1, s: 0},
  {q: 0, r: 1, s: -1},
]

const SVG_WIDTH = 750;
const SVG_HEIGHT = 750;
const SCALE = 50;
const X_OFFSET = SVG_WIDTH / 2;
const Y_OFFSET = SVG_HEIGHT / 2;

function buildGraph(size: number) {
  const graph = new Graph();

  let nextNodeId = 0;

  for (let q = -size; q <= size; q++) {
    for (let r = -size; r <= size; r++) {
      const s = -q - r;
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

  const index = new Map<string, Node>();

  for (const node of graph.nodes) {
    index.set(`${node.value.q},${node.value.r},${node.value.s}`, node);
  }

  for (const node of graph.nodes) {
    for (const dir of CUBE_DIRECTIONS) {
      const target = addCubeCoords({q: node.value.q, r: node.value.r, s: node.value.s}, dir)

      const neighbor = index.get(`${target.q},${target.r},${target.s}`);

      if (!neighbor) continue;

      if (neighbor.id > node.id) {
        graph.addEdge(node, neighbor);
      }
    }
  }

  return graph;
}

function DrawGrid({ graph }: { graph: Graph }) {
  return (
    <>
      {graph.nodes.map((node, i) =>
        node.neighbors.map((n, j) => {
          if (n.id <= node.id) return null;
          
          if (node.neighbors.length <= 4 && n.neighbors.length <= 4) {
            return (
            <line
              key={`edge-${i}-${j}`}
              x1={node.value.x * SCALE + X_OFFSET}
              y1={Y_OFFSET - node.value.y * SCALE}
              x2={n.value.x * SCALE + X_OFFSET}
              y2={Y_OFFSET - n.value.y * SCALE}
              stroke="black"
              strokeWidth="3"
            />
            );
          } else {
            return (
            <line
              key={`edge-${i}-${j}`}
              x1={node.value.x * SCALE + X_OFFSET}
              y1={Y_OFFSET - node.value.y * SCALE}
              x2={n.value.x * SCALE + X_OFFSET}
              y2={Y_OFFSET - n.value.y * SCALE}
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="8 6"
              strokeDashoffset="7"
            />
            );
          }
          })
      )}
      
      {graph.nodes.map((node, i) => (
        <circle
          key={i}
          cx={node.value.x * SCALE + X_OFFSET}
          cy={Y_OFFSET - node.value.y * SCALE}
          r={5}
          fill="black"
        />
      ))}
    </>
  );
}

export default function App() {
  const [gridSize, setGridSize] = useState(1);
  const graph = buildGraph(gridSize);

  const clamp = (n: number) => Math.max(1, Math.min(4, Math.floor(n)));

  return (
  <div className="app">

    <h1>Calissons Puzzle</h1>

    <svg width={SVG_WIDTH} height={SVG_HEIGHT} className="board">
      <DrawGrid graph={graph}/>
    </svg>

    <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: 8 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isNaN(n)) {
              setGridSize(clamp(n));
            }
          }}
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
