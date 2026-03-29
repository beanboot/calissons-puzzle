import { Graph, SolverGraph } from "./Graph";
import type { CalissonTile, Cube3D, Edge } from "./Types";
import { Node, SolverNode } from "./Node";
import { getTileFromSolverNode } from "./MiscellaneousFunctions";

function buildDAG(n: number): SolverGraph {
    const graph = new SolverGraph();
    let nextId = 0;

    // create the back layer
    for (let y = 0; y < n; y++) {
        for (let z = 0; z < n; z++) {
            const cube: Cube3D = { id: nextId, x: -1, y, z};
            graph.addNode(nextId, cube);
            graph.index.set(`-1,${y},${z}`, graph.nodes[nextId]);
            nextId++;
        }
    }

    for (let x = 0; x < n; x++) {
        for (let z = 0; z < n; z++) {
            const cube: Cube3D = { id: nextId, x, y: -1, z};
            graph.addNode(nextId, cube);
            graph.index.set(`${x},-1,${z}`, graph.nodes[nextId]);
            nextId++;
        }
    }

    for (let x = 0; x < n; x++) {
        for (let y = 0; y < n; y++) {
            const cube: Cube3D = { id: nextId, x, y, z: -1};
            graph.addNode(nextId, cube);
            graph.index.set(`${x},${y},-1`, graph.nodes[nextId]);
            nextId++;
        }
    }

    // create all internal cubes
    for (let x = 0; x < n; x++) {
        for (let y = 0; y < n; y++) {
            for (let z = 0; z < n; z++) {
                const cube: Cube3D = { id: nextId, x, y, z };
                graph.addNode(nextId, cube);
                graph.index.set(`${x},${y},${z}`, graph.nodes[nextId]);
                nextId++;
            }
        }
    }

    // create the front layer
    for (let y = 0; y < n; y++) {
        for (let z = 0; z < n; z++) {
            const cube: Cube3D = { id: nextId, x: n, y, z};
            graph.addNode(nextId, cube);
            graph.index.set(`${n},${y},${z}`, graph.nodes[nextId]);
            nextId++;
        }
    }

    for (let x = 0; x < n; x++) {
        for (let z = 0; z < n; z++) {
            const cube: Cube3D = { id: nextId, x, y: n, z};
            graph.addNode(nextId, cube);
            graph.index.set(`${x},${n},${z}`, graph.nodes[nextId]);
            nextId++;
        }
    }

    for (let x = 0; x < n; x++) {
        for (let y = 0; y < n; y++) {
            const cube: Cube3D = { id: nextId, x, y, z: n};
            graph.addNode(nextId, cube);
            graph.index.set(`${x},${y},${n}`, graph.nodes[nextId]);
            nextId++;
        }
    }

    // add DAG ascendant edges
    for (const node of graph.nodes) {
        const { x, y, z } = node.value as Cube3D

        const neighbours = [
            [x + 1, y, z],
            [x, y + 1, z],
            [x, y, z + 1],
        ];

        for (const [nx, ny, nz] of neighbours) {
            const target = graph.index.get(`${nx},${ny},${nz}`);
            if (target) {
                graph.addDirectedEdge(node, target)
            }
        }
    }

    return graph;
}

function isFront(c: Cube3D, n: number): boolean {
    const inRange = (v: number) => v >= 0 && v < n;

    return (
        (c.x === n && inRange(c.y) && inRange(c.z)) ||
        (c.y === n && inRange(c.x) && inRange(c.z)) ||
        (c.z === n && inRange(c.x) && inRange(c.y))
    );
}

function isBack(c: Cube3D, n: number): boolean {
    const inRange = (v: number) => v >= 0 && v < n;

    return (
        (c.x === -1 && inRange(c.y) && inRange(c.z)) ||
        (c.y === -1 && inRange(c.x) && inRange(c.z)) ||
        (c.z === -1 && inRange(c.x) && inRange(c.y))
    );
}

function addUnbreakableEdges(graph: SolverGraph, edges: Edge[], n: number) {
    for (const edge of edges) {
        if (edge.direction === "z") {
            addZAxisEdges(graph, edge.nodeA, n)
        }
        else if (edge.direction === "y") {
            addYAxisEdges(graph, edge.nodeA, n)
        }
        else if (edge.direction === "x") {
            addXAxisEdges(graph, edge.nodeA, n)
        }
    }
}

function addZAxisEdges(graph: SolverGraph, node: Node, n: number) {
    for (let k = -1; k <= n; k++) {
        const Lk = graph.index.get(`${node.value.q + k},${node.value.r + k - 1},${node.value.s + k}`)
        const Rk = graph.index.get(`${node.value.q + k - 1},${node.value.r + k},${node.value.s + k}`)
        const Fk = graph.index.get(`${node.value.q + k},${node.value.r + k},${node.value.s + k}`)
        const BkPlus1 = graph.index.get(`${node.value.q + k},${node.value.r + k},${node.value.s + k + 1}`)

        if (Fk && BkPlus1) {
            graph.addUnbreakableEdge(Fk, BkPlus1)
        }

        if (Lk && Rk) {
            graph.addUnbreakableEdge(Lk, Rk)
        }
    }
}

function addYAxisEdges(graph: SolverGraph, node: Node, n: number) {
    for (let k = -1; k <= n; k++) {
        const Lk = graph.index.get(`${node.value.q + k - 1},${node.value.r + k},${node.value.s + k}`)
        const Rk = graph.index.get(`${node.value.q + k},${node.value.r + k},${node.value.s + k - 1}`)
        const Fk = graph.index.get(`${node.value.q + k},${node.value.r + k},${node.value.s + k}`)
        const BkPlus1 = graph.index.get(`${node.value.q + k},${node.value.r + k + 1},${node.value.s + k}`)

        if (Fk && BkPlus1) {
            graph.addUnbreakableEdge(Fk, BkPlus1)
        }

        if (Lk && Rk) {
            graph.addUnbreakableEdge(Lk, Rk)
        }
    }
}

function addXAxisEdges(graph: SolverGraph, node: Node, n: number) {
    for (let k = -1; k <= n; k++) {
        const Lk = graph.index.get(`${node.value.q + k},${node.value.r + k - 1},${node.value.s + k}`)
        const Rk = graph.index.get(`${node.value.q + k},${node.value.r + k},${node.value.s + k - 1}`)
        const Fk = graph.index.get(`${node.value.q + k},${node.value.r + k},${node.value.s + k}`)
        const BkPlus1 = graph.index.get(`${node.value.q + k + 1},${node.value.r + k},${node.value.s + k}`)

        if (Fk && BkPlus1) {
            graph.addUnbreakableEdge(Fk, BkPlus1)
        }

        if (Lk && Rk) {
            graph.addUnbreakableEdge(Lk, Rk)
        }
    }
}

// Uses BFS to check connectivity from front to back, returns true if the front set connects to back
function frontReachesBack(graph: SolverGraph, n: number): boolean {
    const visited = new Set<SolverNode>()
    const queue: SolverNode[] = []

    // initialize queue with all front cubes
    for (const node of graph.nodes) {
        const cube = node.value as Cube3D;

        if (isFront(cube, n)) {
            visited.add(node)
            queue.push(node)
        }
    }

    // breadth first search
    while (queue.length > 0) {
        const current = queue.shift()!
        const cube = current.value as Cube3D

        // if back is reached - no solution
        if (isBack(cube, n)) {
            return true
        }

        for (const neighbour of current.outEdges) {
            if (!visited.has(neighbour)) {
                visited.add(neighbour)
                queue.push(neighbour)
            }
        }

        for (const neighbour of current.unbreakableEdges) {
            if (!visited.has(neighbour)) {
                visited.add(neighbour)
                queue.push(neighbour)
            }
        }
    }

    // back never reached - solution exists
    return false
}

export function isSolvable(edges: Edge[], n: number): boolean {
    const graph = buildDAG(n)
    addUnbreakableEdges(graph, edges, n)

    return !frontReachesBack(graph, n)
}

// Uses BFS to return the cube nodes connected to the back set
function connectivityFromBack(graph: SolverGraph, n: number): Set<SolverNode> {
    const visited = new Set<SolverNode>()
    const queue: SolverNode[] = []

    // initialize queue with all back cubes
    for (const node of graph.nodes) {
        const cube = node.value as Cube3D;

        if (isBack(cube, n)) {
            visited.add(node)
            queue.push(node)
        }
    }

    // breadth first search
    while (queue.length > 0) {
        const current = queue.shift()!

        for (const neighbour of current.inEdges) {
            if (!visited.has(neighbour)) {
                visited.add(neighbour)
                queue.push(neighbour)
            }
        }

        for (const neighbour of current.unbreakableEdges) {
            if (!visited.has(neighbour)) {
                visited.add(neighbour)
                queue.push(neighbour)
            }
        }
    }

    return visited
}

export function solvePuzzle(edges: Edge[], graph: Graph, n: number): CalissonTile[] {
    const DAG = buildDAG(n)
    addUnbreakableEdges(DAG, edges, n)

    // Calculates the low set of DAG nodes underneath the DAG cut
    const lowSet = connectivityFromBack(DAG, n)

    const tiles: CalissonTile[] = []

    for (const node of lowSet) {
        for (const neighbour of node.outEdges) {
            // If node is above the DAG cut, push tile of corresponding direction
            if (!lowSet.has(neighbour)) {
                if (neighbour.value.x - node.value.x === 1) {
                    tiles.push(getTileFromSolverNode(node, "x", graph, n)!)
                } else if (neighbour.value.y - node.value.y === 1) {
                    tiles.push(getTileFromSolverNode(node, "y", graph, n)!)
                } else if (neighbour.value.z - node.value.z === 1) {
                    tiles.push(getTileFromSolverNode(node, "z", graph, n)!)
                }
            }
        }
    }

    return tiles
}