import { useState, useEffect, useMemo } from "react";
import type { Point, Edge, CalissonTile } from "./Types";
import { DrawCalissonTile, canPlaceTile } from "./HelperFunctions";
import { Node } from "./Node";
import { DrawGraph } from "./DrawGraph";
import { buildGraph } from "./BuildGraph";
import "./App.css";
import { generateEdges } from "./GenerateEdges";
import { GRID_SIZE } from "./Constants";

export default function App() {
  const [gridSize, setGridSize] = useState(GRID_SIZE);

  const [tiles, setTiles] = useState<CalissonTile[]>([]);

  const [edges, setEdges] = useState<Edge[]>([]);

  const [hoveredNodeAdjacentNodes, setHoveredNodeAdjacentNodes] = useState<Node[]>([]);

  const graph = useMemo(() => buildGraph(gridSize), [gridSize]);

  function handleNodeClick(points: Point[], nodes: Node[]) {
    const id = nodes.map(p => `${p.value.q},${p.value.r},${p.value.s}`).join("|");

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
          id,
          points,
          nodeA: nodes[0],
          nodeB: nodes[1]
        }
      ];
    });
  }

  function handleNodeHover(nodes: Node[] | null) {
    if (nodes === null) {
      setHoveredNodeAdjacentNodes([])
    } else {
      setHoveredNodeAdjacentNodes(nodes)
    }
  }

  useEffect(() => {setEdges(generateEdges(graph, 2))}, [gridSize]);

  // limits the grid size to 4
  const clamp = (n: number) => Math.max(1, Math.min(4, Math.floor(n)));

  const R = gridSize + 1;
  const width = 3 * R;
  const height = Math.sqrt(3) * 2 * R;

  //console.log(isSolvable(gridSize, edges))

  return (
    <div className="app">

      <h1 className="h1">Calissons Puzzle</h1>

      <svg
        viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="board"
      >
        <g transform="scale(1.5)">
          {tiles.map(tile => (
            <DrawCalissonTile key={tile.id} tile={tile} />
          ))}

          <DrawGraph 
            graph={graph} 
            edges={edges} 
            hoveredNodeAdjacentNodes={hoveredNodeAdjacentNodes} 
            onNodeClick={handleNodeClick} 
            onNodeHover={handleNodeHover}
          />
        </g>
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

          <text
            onMouseDown={(e) => e.preventDefault()}
            style={{ width: "36px", textAlign: "center" }}
          > {gridSize} </text>

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
