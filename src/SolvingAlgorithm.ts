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

function hasValidCut(graph: Graph, n: number): boolean {
    const visited = new Set<Node>();
    const queue: Node[] = [];

    // initialize queue with all front cubes
    for (const node of graph.nodes) {
        const cube = node.value as Cube3D;

        if (isFront(cube, n)) {
            visited.add(node);
            queue.push(node);
        }
    }

    // breadth first search
    while (queue.length > 0) {
        const current = queue.shift()!;
        const cube = current.value as Cube3D;

        // if back is reached - no solution
        if (isBack(cube, n)) {
            return false;
        }

        for (const neighbor of current.neighbours) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    // back never reached - solution exists
    return true;
}

function addConstraintFrom2DEdge(
    graph: Graph, 
    index: Map<string, Node>, 
    n: number, 
    q: number, 
    r: number, 
    s: number, 
    dq: number, 
    dr: number, 
    ds: number
) {
    if (dq < 0 || (dq === 0 && dr < 0)) {
        dq = -dq;
        dr = -dr;
        ds = -ds;
    }

    console.log('edge direction: ', dq, dr, ds)

    // vertical edge
    if (dq === 0 && dr === 1 && ds === -1) { 
        addVerticalConstraint(graph, index, n, q, r, s);
    } 
    
    // diagonal edge 1
    if (dq === 1 && dr === 0 && ds === -1) { 
        addFirstDiagonalConstraint(graph, index, n, q, r, s);
    }

    // diagonal edge 2
    if (dq === 1 && dr === -1 && ds === 0) { 
        addSecondDiagonalConstraint(graph, index, n, q, r, s);
    } 
}

function addVerticalConstraint(
    graph: Graph,
    index: Map<string, Node>,
    n: number,
    q: number,
    r: number,
    s: number
) {
    const key = (x: number, y: number, z: number) => `${x},${y},${z}`;

    const kMin = Math.max(-1 - q, -1 - r, -1 - s);
    const kMax = Math.min(n - q, n - r, n - s);

    for (let k = kMin; k <= kMax; k++) {

        const Fx = q + k;
        const Fy = r + k;
        const Fz = s + k;

        const BxNext = q + k;
        const ByNext = r + k;
        const BzNext = s + k + 1;

        const Lx = q + k;
        const Ly = r + k - 1;
        const Lz = s + k;

        const Rx = q + k - 1;
        const Ry = r + k;
        const Rz = s + k;

        const F = index.get(key(Fx, Fy, Fz));
        const Bnext = index.get(key(BxNext, ByNext, BzNext));
        const L = index.get(key(Lx, Ly, Lz));
        const R = index.get(key(Rx, Ry, Rz));

        // non-overlap
        if (F && Bnext) {
            graph.addUndirectedEdge(F, Bnext);
        }

        // saliency
        if (L && R) {
            graph.addUndirectedEdge(L, R);
        }
    }
}

function addFirstDiagonalConstraint(
    graph: Graph,
    index: Map<string, Node>,
    n: number,
    q: number,
    r: number,
    s: number
) {
    const key = (x: number, y: number, z: number) => `${x},${y},${z}`;

    const kMin = Math.max(-1 - q, -1 - r, -1 - s);
    const kMax = Math.min(n - q, n - r, n - s);

    for (let k = kMin; k <= kMax; k++) {

        const Fx = q + k;
        const Fy = r + k;
        const Fz = s + k;

        const BxNext = q + k + 1;
        const ByNext = r + k;
        const BzNext = s + k;

        const Lx = q + k;
        const Ly = r + k - 1;
        const Lz = s + k;

        const Rx = q + k;
        const Ry = r + k;
        const Rz = s + k - 1;

        const F = index.get(key(Fx, Fy, Fz));
        const Bnext = index.get(key(BxNext, ByNext, BzNext));
        const L = index.get(key(Lx, Ly, Lz));
        const R = index.get(key(Rx, Ry, Rz));

        // non-overlap
        if (F && Bnext) {
            graph.addUndirectedEdge(F, Bnext);
        }

        // saliency
        if (L && R) {
            graph.addUndirectedEdge(L, R);
        }
    }
}

function addSecondDiagonalConstraint(
    graph: Graph,
    index: Map<string, Node>,
    n: number,
    q: number,
    r: number,
    s: number
) {
    const key = (x: number, y: number, z: number) => `${x},${y},${z}`;

    const kMin = Math.max(-1 - q, -1 - r, -1 - s);
    const kMax = Math.min(n - q, n - r, n - s);

    for (let k = kMin; k <= kMax; k++) {

        const Fx = q + k;
        const Fy = r + k;
        const Fz = s + k;

        const BxNext = q + k;
        const ByNext = r + k + 1;
        const BzNext = s + k;

        const Lx = q + k - 1;
        const Ly = r + k;
        const Lz = s + k;

        const Rx = q + k;
        const Ry = r + k;
        const Rz = s + k - 1;

        const F = index.get(key(Fx, Fy, Fz));
        const Bnext = index.get(key(BxNext, ByNext, BzNext));
        const L = index.get(key(Lx, Ly, Lz));
        const R = index.get(key(Rx, Ry, Rz));

        // non-overlap
        if (F && Bnext) {
            graph.addUndirectedEdge(F, Bnext);
        }

        // saliency
        if (L && R) {
            graph.addUndirectedEdge(L, R);
        }
    }
}

export function isSolvable(n: number, edges: { nodeA: Node, nodeB: Node }[]): boolean {
    const { graph, index } = buildDAG(n);

    /*
    // translate 2D edges into 3D constraints
    for (const edge of edges) {
        const a = edge.nodeA.value; 
        const b = edge.nodeB.value; 

        const q = a.q; 
        const r = a.r; 
        const s = a.s; 

        // directions 
        const dq = b.q - a.q;
        const dr = b.r - a.r; 
        const ds = b.s - a.s; 
        
        addConstraintFrom2DEdge(graph, index, n, q, r, s, dq, dr, ds); 
    }
    */

    return hasValidCut(graph, n);
}
