import React from "react";
import "./App.css";

interface BoardProps {
  x: number;
  y: number;
}

function Board({x, y}: BoardProps) {
  return (
    <svg width="500" height="500" className="board">
      <polygon points={`${x},${y} ${x},${y + 100} ${x - 86.6},${y + 50}`} fill="none" stroke="black" strokeWidth={3} strokeLinejoin="bevel"/>
      <polygon points={`${x},${y} ${x},${y + 100} ${x + 86.6},${y + 50}`} fill="none" stroke="black" strokeWidth={3} strokeLinejoin="bevel"/>
      <polygon points={`${x},${y} ${x - 86.6},${y - 50} ${x - 86.6},${y + 50}`} fill="none" stroke="black" strokeWidth={3} strokeLinejoin="bevel"/>
      <polygon points={`${x},${y} ${x + 86.6},${y + 50} ${x + 86.6},${y - 50}`} fill="none" stroke="black" strokeWidth={3} strokeLinejoin="bevel"/>
      <polygon points={`${x},${y} ${x - 86.6},${y - 50} ${x},${y - 100}`} fill="none" stroke="black" strokeWidth={3} strokeLinejoin="bevel"/>
      <polygon points={`${x},${y} ${x + 86.6},${y - 50} ${x},${y - 100}`} fill="none" stroke="black" strokeWidth={3} strokeLinejoin="bevel"/>
    </svg>
  )
}

function App() {
  return (
    <div className="app">
      <h1>Calissons Puzzle</h1>
      <Board x={250} y={250} />
    </div>
  )
}

export default App
