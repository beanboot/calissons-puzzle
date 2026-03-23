import type { CalissonTile, Edge } from "./Types";

export function isPuzzleSolved(tiles: CalissonTile[], edges: Edge[], n: number): boolean {
    // The max number of tiles placeable is equal to the amount of triangles in the grid divided by two
    const maxNumberOfTiles = (6 * n * n) / 2

    // Check if the number of tiles placed matches the maximum amount of tiles
    if (tiles.length !== maxNumberOfTiles) {
        return false
    }

    // Check for each edge if its adjacent tiles are of different directions
    for (const edge of edges) {
        const adjacentTiles: CalissonTile[] = []

        for (const tile of tiles) {
            let sharedNodes = 0

            for (const node of tile.nodes) {
                if (node.id === edge.nodeA.id || node.id === edge.nodeB.id) {
                    sharedNodes += 1
                }
            }

            if (sharedNodes === 2) {
                adjacentTiles.push(tile)
            }
        }

        if (adjacentTiles.length >= 2) {
            if (adjacentTiles[0].fill === adjacentTiles[1].fill) {
                return false
            }
        }
    }

    return true
}