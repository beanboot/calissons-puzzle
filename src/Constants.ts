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

// Calisson tile colours
export const CALISSON_BLUE: string = "#0d6efd"
export const CALISSON_YELLOW: string = "#f8ff22"
export const CALISSON_RED: string = "#ff4141"