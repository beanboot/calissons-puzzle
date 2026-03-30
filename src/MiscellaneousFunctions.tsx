import type { CubeCoord, Point, CalissonTile, Difficulties } from "./Types";
import { CUBE_DIRECTIONS } from "./Constants";
import { Node, SolverNode } from "./Node";
import { Graph } from "./Graph";

// Returns a random integer between min and max
export function randomInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
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

function findSharedNeighbours(nodeA: Node, nodeB: Node): Node[] {
  const sharedNeighbours: Node[] = []

  // Iterates through nodes to find shared neighbours
  for (const neighbourA of nodeA.neighbours) {
    for (const neighbourB of nodeB.neighbours) {
      if (neighbourA === neighbourB) {
        sharedNeighbours.push(neighbourA)
      }
    }
  }

  return sharedNeighbours
}

// Returns tile nodes from two nodes
export function findTileNodes(nodeA: Node, nodeB: Node): Node[] {
  const sharedNeighbours = findSharedNeighbours(nodeA, nodeB);

  return ([nodeA, sharedNeighbours[0], nodeB, sharedNeighbours[1]]);
}

// Returns points from which calisson tile should be drawn
export function findTilePoints(nodeA: Node, nodeB: Node): Point[] {
  const sharedNeighbours = findSharedNeighbours(nodeA, nodeB);

  return ([
    {x: nodeA.value.px, y: nodeA.value.py},
    {x: sharedNeighbours[0].value.px, y: sharedNeighbours[0].value.py},
    {x: nodeB.value.px, y: nodeB.value.py},
    {x: sharedNeighbours[1].value.px, y: sharedNeighbours[1].value.py},
  ]);
}

// Returns appropriate fill colour from the direction between nodes
export function getFillFromNodes(nodeA: Node, nodeB: Node): string {
  let fill: string;

  for (const dir of CUBE_DIRECTIONS) {
    const target = addCubeCoords({q: nodeA.value.q, r: nodeA.value.r, s: nodeA.value.s}, dir)

    if(target.q === nodeB.value.q && target.r === nodeB.value.r && target.s === nodeB.value.s) {
      if (dir.direction === "x") {
        fill = "blue";
      } else if (dir.direction === "y") {
        fill = "red";
      } else if (dir.direction === "z") {
        fill = "yellow";
      };
    };
  };

  // Fill will always be decided but we need ! to let TypeScript know
  return fill!;
}

// Returns the calisson tile polygon using the tile points passed in
export function DrawCalissonTile({ tile }: { tile: CalissonTile }) {
  const pointsString = tile.points.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <polygon
      points={pointsString}
      fill={tile.fill}
      stroke={tile.fill}
      strokeWidth={0.02}
      opacity={0.8}
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
    return(getFillFromNodes(nodeA, nodeB));
  } else {
    return("white");
  };
}

// Multiple solver (DAG) nodes can project to the same 2D node, this function returns the corresponding 2D node
function get2DNodeFromSolverNode(solverNode: SolverNode, graph: Graph, n: number): Node | null {
  for (let k = -n; k <= n; k++) {
    const target = graph.index.get(`${solverNode.value.x + k},${solverNode.value.y + k},${solverNode.value.z + k}`);

    if (target) {
      return target;
    };
  };

  return null;
}

export function getTileFromSolverNode(solverNode: SolverNode, direction: string, graph: Graph, n: number): CalissonTile | null {
  let points: Point[] | undefined;
  let nodes: Node[] | undefined;
  let fill: string | undefined;

  // Grabs the corresponding 2D node of the DAG node
  const nodeA = get2DNodeFromSolverNode(solverNode, graph, n);
  if (!nodeA) return null ;

  let nodeB: Node | undefined;

  // Draws blue tile
  if (direction === "x") {
    const { q, r, s } = addCubeCoords({q: nodeA.value.q, r: nodeA.value.r, s: nodeA.value.s}, CUBE_DIRECTIONS[0]);
    nodeB = graph.index.get(`${q},${r},${s}`);

    if (!nodeB) return null;

    points = findTilePoints(nodeA, nodeB);
    nodes = findTileNodes(nodeA, nodeB);
    fill = "blue";
  };

  // Draws red tile
  if (direction === "y") {
    const { q, r, s } = addCubeCoords({q: nodeA.value.q, r: nodeA.value.r, s: nodeA.value.s}, CUBE_DIRECTIONS[1]);
    nodeB = graph.index.get(`${q},${r},${s}`);

    if (!nodeB) return null;

    points = findTilePoints(nodeA, nodeB);
    nodes = findTileNodes(nodeA, nodeB);
    fill = "red";
  };

  // Draws yellow tile
  if (direction === "z") {
    const { q, r, s } = addCubeCoords({q: nodeA.value.q, r: nodeA.value.r, s: nodeA.value.s}, CUBE_DIRECTIONS[2]);
    nodeB = graph.index.get(`${q},${r},${s}`);

    if (!nodeB) return null;

    points = findTilePoints(nodeA, nodeB);
    nodes = findTileNodes(nodeA, nodeB);
    fill = "yellow";
  };

  if (!nodes || !points || !fill) return null;

  const tile: CalissonTile = {
    id: nodes.map(p => `${p.value.q},${p.value.r},${p.value.s}`).join("|"),
    points,
    nodes,
    fill
  };

  return tile;
}

export function returnSharedNodes(a: Node[], b: Node[]): Node[] {
  let sharedNodes: Node[] = [];

  for (const nodeA of a) {
    for (const nodeB of b) {
      if (nodeA.id === nodeB.id) {
        sharedNodes.push(nodeA);
      };
    };
  };

  return sharedNodes;
}

// Formats a date to a time
export function formatTime(ms: number) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Psuedo-random number generator that takes a seed (https://github.com/cprosche/mulberry32)
export function mulberry32(seed: number) {
  return function () {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Turns the date and difficulty into a seed to generate deterministic puzzles for respective day and difficulty
export function getDailySeed(difficulty: Difficulties): number {
  const today = new Date();
  const str = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}-${difficulty}`;

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  return hash;
}

function getNodesFromID(tileID: string, graph: Graph): Node[] | null {
  const ids = tileID.split("|")

  let nodes: Node[] = []
  for (const id of ids) {
     const target = graph.index.get(id)
     
     if (target) {
      nodes.push(target)
     }
  }

  if (nodes.length === 4) {
    return nodes
  } else return null
}

// Converts an array of string IDs into an array of tiles
export function getTilesFromIDs(tileIDs: string[], graph: Graph): CalissonTile[] {
  let tiles: CalissonTile[] = []
  for (const tileId of tileIDs) {
    const nodes = getNodesFromID(tileId, graph)

    // nodes[0] and nodes[2] are always NodeA and NodeB used in earlier functions
    if (nodes) {
      tiles.push({
        id: tileId,
        points: findTilePoints(nodes[0], nodes[2]),
        nodes,
        fill: getFillFromNodes(nodes[0], nodes[2])
      })
    }
  }

  return tiles
}

// Converts an array of tiles into an array of string IDs
export function getIDsFromTiles(tiles: CalissonTile[]): string[] {
  let ids: string[] = []
  for (const tile of tiles) {
    ids.push(tile.id)
  }

  return ids
}