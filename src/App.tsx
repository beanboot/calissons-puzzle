import React from "react";
import "./App.css";

interface BoardProps {
  n: number;
  s: number;
}

function Board({n, s}: BoardProps) {
  const h = s * Math.sqrt(3) / 2;

  const grid = [];
  for (let j = -n; j <= n; j++) {
    for (let i = -n; i <= n; i++) {
      if ((Math.abs(j) + Math.abs(i)) < (n * 2)) {
        const x = 250 + i * (s/2);
        const y = 250 + j * h;

        if ((i+j) % 2 == 0) {
          grid.push(<polygon points={`${x},${y - (2 * h / 3)} ${x - (s/2)},${y + (h/3)} ${x + (s/2)},${y + (h/3)}`} fill="none" stroke="black" strokeWidth={3} strokeLinejoin="bevel"/>)
        } else {
          grid.push(<polygon points={`${x},${y + (2 * h / 3)} ${x - (s/2)},${y - (h/3)} ${x + (s/2)},${y + (h/3)}`} fill="none" stroke="black" strokeWidth={3} strokeLinejoin="bevel"/>)
        }
      }
    }
  }

  return (
    <svg width="500" height="500" className="board">
      {grid}
    </svg>
  )
}

function App() {
  return (
    <div className="app">
      <h1>Calissons Puzzle</h1>
      <Board n={1} s={50}/>
    </div>
  )
}

export default App
