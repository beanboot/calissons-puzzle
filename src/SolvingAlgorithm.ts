import { Graph } from "./Graph";
import type { Cube3D, Edge } from "./Types";
import { Node } from "./Node";

function buildDAG(n: number): Graph {
    const graph = new Graph();
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

        const neighbors = [
            [x + 1, y, z],
            [x, y + 1, z],
            [x, y, z + 1],
        ];

        for (const [nx, ny, nz] of neighbors) {
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

function addUnbreakableEdges(graph: Graph, edges: Edge[], n: number) {
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

function addZAxisEdges(graph: Graph, node: Node, n: number) {
    for (let k = -1; k <= n; k++) {
        const Lk = graph.index.get(`${node.value.q + k},${node.value.r + k - 1},${node.value.s + k}`)
        const Rk = graph.index.get(`${node.value.q + k - 1},${node.value.r + k},${node.value.s + k}`)
        const Fk = graph.index.get(`${node.value.q + k},${node.value.r + k},${node.value.s + k}`)
        const BkPlus1 = graph.index.get(`${node.value.q + k},${node.value.r + k},${node.value.s + k + 1}`)

        if (Fk && BkPlus1) {
            graph.addUndirectedEdge(Fk, BkPlus1)
        }

        if (Lk && Rk) {
            graph.addUndirectedEdge(Lk, Rk)
        }
    }
}

function addYAxisEdges(graph: Graph, node: Node, n: number) {
    for (let k = -1; k <= n; k++) {
        const Lk = graph.index.get(`${node.value.q + k - 1},${node.value.r + k},${node.value.s + k}`)
        const Rk = graph.index.get(`${node.value.q + k},${node.value.r + k},${node.value.s + k - 1}`)
        const Fk = graph.index.get(`${node.value.q + k},${node.value.r + k},${node.value.s + k}`)
        const BkPlus1 = graph.index.get(`${node.value.q + k},${node.value.r + k + 1},${node.value.s + k}`)

        if (Fk && BkPlus1) {
            graph.addUndirectedEdge(Fk, BkPlus1)
        }

        if (Lk && Rk) {
            graph.addUndirectedEdge(Lk, Rk)
        }
    }
}

function addXAxisEdges(graph: Graph, node: Node, n: number) {
    for (let k = -1; k <= n; k++) {
        const Lk = graph.index.get(`${node.value.q + k},${node.value.r + k - 1},${node.value.s + k}`)
        const Rk = graph.index.get(`${node.value.q + k},${node.value.r + k},${node.value.s + k - 1}`)
        const Fk = graph.index.get(`${node.value.q + k},${node.value.r + k},${node.value.s + k}`)
        const BkPlus1 = graph.index.get(`${node.value.q + k + 1},${node.value.r + k},${node.value.s + k}`)

        if (Fk && BkPlus1) {
            graph.addUndirectedEdge(Fk, BkPlus1)
        }

        if (Lk && Rk) {
            graph.addUndirectedEdge(Lk, Rk)
        }
    }
}

function frontReachesBack(graph: Graph, n: number): boolean {
    const visited = new Set<Node>()
    const queue: Node[] = []

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

        for (const neighbour of current.neighbours) {
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
