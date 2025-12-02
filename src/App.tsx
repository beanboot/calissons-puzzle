import { useState } from "react";
import { Graph } from "./Graph";
import { Node } from "./Node";
import "./App.css";

type Vector2 = [number, number];

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

  for (let q = -size; q <= size; q++) {
    for (let r = -size; r <= size; r++) {
      const s = -q - r;
      if (Math.abs(s) <= size) {
        const value: NodeValue = {
          q, r, s,
          x: (3/2 * q),
          y: (Math.sqrt(3)/2 * q + Math.sqrt(3) * r)
        };
        graph.addNode(value);
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

      if (index.has(`${target.q},${target.r},${target.s}`)) {
        graph.addEdge(index.get(`${target.q},${target.r},${target.s}`)!, node)
      }
    }
  }

  return graph;
}

function DrawGrid({ graph }: { graph: Graph }) {
  return (
    <>
      {graph.nodes.map((node, i) =>
        node.neighbors.map((n, j) => (
          <line
            key={`edge-${i}-${j}`}
            x1={node.value.x * SCALE + X_OFFSET}
            y1={Y_OFFSET - node.value.y * SCALE}
            x2={n.value.x * SCALE + X_OFFSET}
            y2={Y_OFFSET - n.value.y * SCALE}
            stroke="black"
          />
        ))
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

  return (
  <div className="app">

    <h1>Calissons Puzzle</h1>

    <svg width={SVG_WIDTH} height={SVG_HEIGHT} className="board">
      <DrawGrid graph={graph}/>
    </svg>

    <div style={{ marginTop: "10px" }}>
      <label>
        Grid Size: 
        <input
          type="number"
          min={1}
          max={4}
          value={gridSize}
          onChange={(e) => setGridSize(Number(e.target.value))}
          onKeyDown={(e) => {
            const allowed = ["ArrowUp", "ArrowDown", "Tab"];
            if (!allowed.includes(e.key)) {
              e.preventDefault();
            }
          }}
          style={{ marginLeft: "5px", width: "50px" }}
          />
      </label>
    </div>

  </div>
  );
}
