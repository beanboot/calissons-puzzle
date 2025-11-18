import React from "react";
import "./App.css";

function Triangle({x, y, side, up}: {
  x: number; y: number;
  side: number;
  up: boolean;
}) {
  const h = (Math.sqrt(3) / 2) * side;

  let points;

  if (up) {
    points = [
      `${x},${y - h / 2}`,
      `${x - side /2},${y + h / 2}`,
      `${x + side / 2},${y + h / 2}`
    ].join(" ")
  } else {
    points = [
      `${x},${y + h / 2}`,
      `${x - side /2},${y - h / 2}`,
      `${x + side / 2},${y - h / 2}`
    ].join(" ")
  }

  return <polygon points={points} stroke="black" fill="none" />;
}

export default function App() {
  const triangles = [];
  const side = 50;
  const height = (Math.sqrt(3) / 2) * side

  // Row 1
  triangles.push(<Triangle x={225} y={250 - (height /2)} side={side} up={true} />);
  triangles.push(<Triangle x={250} y={250 - (height /2)} side={side} up={false} />);
  triangles.push(<Triangle x={275} y={250 - (height /2)} side={side} up={true} />);

  // Row 2
  triangles.push(<Triangle x={225} y={250 + (height /2)} side={side} up={false} />);
  triangles.push(<Triangle x={250} y={250 + (height /2)} side={side} up={true} />);
  triangles.push(<Triangle x={275} y={250 + (height /2)} side={side} up={false} />);


  return (
  <svg width="500" height="500" style={{border: "1px solid black"}}>
    {triangles}
    </svg>
  );
}
