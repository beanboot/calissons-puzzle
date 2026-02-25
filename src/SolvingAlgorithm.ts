import { Graph } from "./Graph";
import { Node } from "./Node";

type Cube3D = {
    id: number;
    x: number;
    y: number;
    z: number;
};

function buildDAG(n: number): { graph: Graph, index: Map<string, Node> } {
    const graph = new Graph();
    let nextId = 0;

    const index = new Map<string, Node>();

    // create all cubes
    for (let x = 0; x < n; x++) {
        for (let y = 0; y < n; y++) {
            for (let z = 0; z < n; z++) {
                const cube: Cube3D = { id: nextId, x, y, z };
                graph.addNode(nextId, cube);
                index.set(`${x},${y},${z}`, graph.nodes[nextId]);
                nextId++;
            }
        }
    }

    // add DAG edges
    for (const node of graph.nodes) {
        const { x, y, z } = node.value as Cube3D

        const neighbors = [
            [x + 1, y, z],
            [x, y + 1, z],
            [x, y, z + 1],
        ];

        for (const [nx, ny, nz] of neighbors) {
            if (nx < n && ny < n && nz < n) {
                const target = index.get(`${nx},${ny},${nz}`);
                if (target) {
                    graph.addEdge(node, target)
                }
            }
        }
    }

    return { graph, index };
}

function bfsFromFront(graph: Graph, n: number): Set<Node> {
    const visited = new Set<Node>();
    const queue: Node[] = [];

    for (const node of graph.nodes) {
        const { x, y, z } = node.value as Cube3D

        if (x === n - 1 || y === n - 1 || z === n - 1) {
            visited.add(node);
            queue.push(node);
        }
    }

    while (queue.length > 0) {
        const current = queue.shift()!;

        for (const neighbour of current.neighbours) {
            if (!visited.has(neighbour)) {
                visited.add(neighbour);
                queue.push(neighbour);
            }
        }
    }

    return visited;
}

function touchesBack(visited: Set<Node>, n: number): boolean {
    for (const node of visited) {
        const { x, y, z } = node.value as Cube3D

        if (x === 0 || y === 0 || z === 0) {
            return true;
        }
    }

    return false;
}

export function isSolvable(n: number): boolean {
    const { graph, index } = buildDAG(n);

    // unbreakable edges added here

    const visited = bfsFromFront(graph, n);

    return touchesBack(visited, n);
}
