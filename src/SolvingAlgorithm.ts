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

    // create the back layer
    for (let y = 0; y < n; y++) {
        for (let z = 0; z < n; z++) {
            const cube: Cube3D = { id: nextId, x: -1, y, z};
            graph.addNode(nextId, cube);
            index.set(`-1,${y},${z}`, graph.nodes[nextId]);
            nextId++;
        }
    }

    for (let x = 0; x < n; x++) {
        for (let z = 0; z < n; z++) {
            const cube: Cube3D = { id: nextId, x, y: -1, z};
            graph.addNode(nextId, cube);
            index.set(`${x},-1,${z}`, graph.nodes[nextId]);
            nextId++;
        }
    }

    for (let x = 0; x < n; x++) {
        for (let y = 0; y < n; y++) {
            const cube: Cube3D = { id: nextId, x, y, z: -1};
            graph.addNode(nextId, cube);
            index.set(`${x},${y},-1`, graph.nodes[nextId]);
            nextId++;
        }
    }

    // create all internal cubes
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

    // create the front layer
    for (let y = 0; y < n; y++) {
        for (let z = 0; z < n; z++) {
            const cube: Cube3D = { id: nextId, x: n, y, z};
            graph.addNode(nextId, cube);
            index.set(`${n},${y},${z}`, graph.nodes[nextId]);
            nextId++;
        }
    }

    for (let x = 0; x < n; x++) {
        for (let z = 0; z < n; z++) {
            const cube: Cube3D = { id: nextId, x, y: n, z};
            graph.addNode(nextId, cube);
            index.set(`${x},${n},${z}`, graph.nodes[nextId]);
            nextId++;
        }
    }

    for (let x = 0; x < n; x++) {
        for (let y = 0; y < n; y++) {
            const cube: Cube3D = { id: nextId, x, y, z: n};
            graph.addNode(nextId, cube);
            index.set(`${x},${y},${n}`, graph.nodes[nextId]);
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
            const target = index.get(`${nx},${ny},${nz}`);
            if (target) {
                graph.addDirectedEdge(node, target)
            }
        }
    }

    graph.nodes.forEach(node => {
    console.log(node.value);
    });

    return { graph, index };
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
