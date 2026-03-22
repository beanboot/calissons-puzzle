import type { CubeDirection } from "./Types"

// constant for all directional movements that can be made from any coordinate
export const CUBE_DIRECTIONS: CubeDirection[] = [
    {q: 1, r: 0, s: 0, direction: "x"},
    {q: 0, r: 1, s: 0, direction: "y"},
    {q: 0, r: 0, s: 1, direction: "z"},
    {q: 0, r: 1, s: 1, direction: "x"},
    {q: 1, r: 0, s: 1, direction: "y"},
    {q: 1, r: 1, s: 0, direction: "z"},
]

export const DEFAULT_GRID_SIZE: number = 2

export const NUMBER_OF_EDGES: number = 10