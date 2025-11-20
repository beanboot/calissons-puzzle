import React, { useState } from "react";
import "./App.css";

type Vector2 = [number, number];

const svgWidth = 750;
const svgHeight = 750;

function DrawGrid({size}: {
  size: number
}) {
  const width = size;
  const height = size;
  const depth = size;

  const v_r: Vector2 = [Math.sqrt(3) / 2, -0.5];
  const v_g: Vector2 = [0, 1];
  const v_b: Vector2 = [-Math.sqrt(3) / 2, -0.5];

  const points: Vector2[] = [];

  for (let r = 0; r <= width; r++) {
    for (let g = 0; g <= height; g++) {
      for (let b = 0; b <= depth; b++) {
        const x = r * v_r[0] + g * v_g[0] + b * v_b[0]
        const y = r * v_r[1] + g * v_g[1] + b * v_b[1]

        points.push([x, y])
      }
    }
  }

  const scale = 80;
  const x_offset = svgWidth / 2;
  const y_offset = svgHeight / 2;

  return (
    <>
      {points.map(([x, y], i) => (
        <circle
          key={i}
          cx={x * scale + x_offset}
          cy={y_offset - y * scale}
          r={5}
          fill="black"
        />
      ))}
    </>
  );
}

export default function App() {
  const [gridSize, setGridSize] = useState(3);

  return (
  <div className="app">
    <h1>Calissons Puzzle</h1>
    <svg width={svgWidth} height={svgHeight} className="board">
      <DrawGrid size={gridSize} />
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
          style={{ marginLeft: "5px", width: "50px" }}
          />
      </label>
    </div>
  </div>
  );
}
