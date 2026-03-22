import type { CubeCoord, Point, CalissonTile } from "./Types";
import { CUBE_DIRECTIONS } from "./Constants";
import { Node } from "./Node";

// Returns a random integer between min and max
export function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function addCubeCoords(a: CubeCoord, b: CubeCoord): CubeCoord {
  const result = {
    q: a.q + b.q,
    r: a.r + b.r,
    s: a.s + b.s
  }

  // If resulting coordinate doesn't contain a 0, it means the result is too high in the projection and we need to move down by one
  if (result.q !== 0 && result.r !== 0 && result.s !== 0) {
    result.q -= 1
    result.r -= 1
    result.s -= 1
  }
  
  return result
}

// Returns points from which calisson tile should be drawn
export function findPointsFromNodes (nodeA: Node, nodeB: Node): Point[] {
  const sharedNeighbours: Node[] = []

  // Iterates through nodes to find shared neighbours
  for (const neighbourA of nodeA.neighbours) {
    for (const neighbourB of nodeB.neighbours) {
      if (neighbourA == neighbourB) {
        sharedNeighbours.push(neighbourA)
      }
    }
  }

  return ([
    {x: nodeA.value.px, y: nodeA.value.py},
    {x: sharedNeighbours[0].value.px, y: sharedNeighbours[0].value.py},
    {x: nodeB.value.px, y: nodeB.value.py},
    {x: sharedNeighbours[1].value.px, y: sharedNeighbours[1].value.py},
  ])
}

// Returns appropriate fill colour from the direction between nodes
function getFillFromNodes(nodeA: Node, nodeB: Node): string {
  let fill: string;

  for (const dir of CUBE_DIRECTIONS) {
    const target = addCubeCoords({q: nodeA.value.q, r: nodeA.value.r, s: nodeA.value.s}, dir)

    if(target.q === nodeB.value.q && target.r === nodeB.value.r && target.s === nodeB.value.s) {
      if (dir.direction === "x") {
        fill = "blue"
      } else if (dir.direction === "y") {
        fill = "red"
      } else if (dir.direction === "z") {
        fill = "yellow"
      }
    }
  }

  // Fill will always be decided but we need ! to let TypeScript know
  return fill!
}

// Returns the calisson tile polygon using the tile points passed in
export function DrawCalissonTile({ tile }: { tile: CalissonTile }) {
  const pointsString = tile.points.map(p => `${p.x},${p.y}`).join(" ");

  const fill = getFillFromNodes(tile.nodeA, tile.nodeB)

  return (
    <polygon
      points={pointsString}
      fill={fill}
    />
  );
}

// Uses floating point comparisons (NOT GOOD) to count shared points in two arrays of points
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

// If the points of a tile to be placed shares 3 points with a pre-existing tile - the tile cannot be placed
export function canPlaceTile(points: Point[], tiles: CalissonTile[]): boolean {
  for (const tile of tiles) {
    const shared = countSharedPoints(tile.points, points);
    if (shared === 3) {
      return false;
    }
  }

  return true;
}

// Function used to determine the fill of an interactive node
export function getNodeFillFromNodes(nodeA: Node, nodeB: Node, adjacentNodes: Node[]): string {
  if (adjacentNodes.length < 2) return "white";

  if (nodeA.id === adjacentNodes[0].id && nodeB.id === adjacentNodes[1].id) {
    return(getFillFromNodes(nodeA, nodeB))
  } else {
    return("white")
  }
}