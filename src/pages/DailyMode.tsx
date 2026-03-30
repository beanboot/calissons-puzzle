import { useState, useEffect, useMemo } from "react"
import type { Point, Edge, Difficulties, DifficultyState } from "../Types"
import { DrawCalissonTile, canPlaceTile, getFillFromNodes, formatTime, getDailySeed, getTilesFromIDs, getIDsFromTiles } from "../MiscellaneousFunctions"
import { Node } from "../Node"
import { DrawInteractiveGrid } from "../DrawInteractiveGrid"
import { build2DGraph } from "../Build2DGraph"
import "../App.css"
import { generateSolvableEdges } from "../GenerateEdges"
import { Container, Badge, Row, Col, Button } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css'
import { isPuzzleSolved } from "../IsPuzzleSolved"
import { FaRegQuestionCircle } from "react-icons/fa";
import { useWindowSize } from 'react-use'
import Confetti from 'react-confetti'
import { solvePuzzle } from "../SolvingAlgorithm"
import { DrawSolvedGrid } from "../DrawSolvedGrid"
import { useNavigate } from "react-router-dom"

export default function DailyModePage() {
    // Initialise the grid size state to the default size constant
    const [gridSize, setGridSize] = useState(2)

    // Memoized graph will only be redrawn if grid size changes
    const graph = useMemo(() => build2DGraph(gridSize), [gridSize])

    // Initialise empty edges state
    const [edges, setEdges] = useState<Edge[]>([])
    const [numberOfEdges, setNumberOfEdges] = useState<number>(4)

    const [difficultySelected, setDifficultSelected] = useState(false)
    const [difficulty, setDifficulty] = useState<Difficulties>("EASY")

    // Record state that links puzzle information to its respective difficulty (and grabs saved data from local storage)
    const [difficultyStates, setDifficultyStates] = useState<Record<Difficulties, DifficultyState>>(() => {
        const saved = localStorage.getItem("calissonDailyState")

        // Default state for each difficulty
        const defaultState = {
            EASY: { tileIDs: [], isSolved: false, startTime: null, elapsedTime: 0 },
            MEDIUM: { tileIDs: [], isSolved: false, startTime: null, elapsedTime: 0 },
            HARD: { tileIDs: [], isSolved: false, startTime: null, elapsedTime: 0 }
        }

        if (!saved) return defaultState

        try {
            const parsed = JSON.parse(saved)

            // Reset saved data on a new day
            if (parsed.date !== new Date().toDateString()) {
                return defaultState
            }

            return parsed.data
        } catch {
            return defaultState
        }
    })

    // Saves current difficulty state in local storage
    useEffect(() => {
        const payload = {
            date: new Date().toDateString(),
            data: difficultyStates
        }

        localStorage.setItem("calissonDailyState", JSON.stringify(payload))
    }, [difficultyStates])

    // Helper function to update current difficulty state
    function updateCurrentState(updater: (prev: DifficultyState) => DifficultyState) {
        setDifficultyStates(prev => ({
            ...prev,
            [difficulty]: updater(prev[difficulty])
        }))
    }

    // Get variables from current state
    const currentState = difficultyStates[difficulty]
    const tiles = getTilesFromIDs(currentState.tileIDs, graph)
    const isSolved = currentState.isSolved

    // Navigation variable for React Routing
    const navigate = useNavigate()

    // Initialise state for storing adjacent nodes to any node being hovered by user
    const [hoveredNodeAdjacentNodes, setHoveredNodeAdjacentNodes] = useState<Node[]>([])

    // Function to place tiles when node is clicked
    function handleNodeClick(points: Point[], nodes: Node[]) {
        const id = nodes.map(p => `${p.value.q},${p.value.r},${p.value.s}`).join("|")

        updateCurrentState(prev => {
            const prevTiles = getTilesFromIDs(prev.tileIDs, graph)

            const tileExists = prevTiles.find(tile => tile.id === id)

            let newTileIDs
            if (tileExists) {
                newTileIDs = getIDsFromTiles(prevTiles.filter(tile => tile.id !== id))
            } else {
                if (!canPlaceTile(points, prevTiles)) {
                    return prev
                }

                newTileIDs = getIDsFromTiles([...prevTiles, { id, points, nodes, fill: getFillFromNodes(nodes[0], nodes[2]) }])
            }

            return {...prev, tileIDs: newTileIDs}
        })
    }

    // Fills the adjacent node state when a node is hovered
    function handleNodeHover(nodes: Node[] | null) {
        if (nodes === null) {
            setHoveredNodeAdjacentNodes([])
        } else {
            setHoveredNodeAdjacentNodes(nodes)
        }
    }

    // Called when a difficulty is selected and generates puzzles determined by the date and difficulty
    function handleDifficultySelect(difficulty: Difficulties) {
        switch (difficulty) {
            case "EASY":
                setGridSize(2)
                setNumberOfEdges(4)
                setDifficulty("EASY")
                break
            case "MEDIUM":
                setGridSize(3)
                setNumberOfEdges(8)
                setDifficulty("MEDIUM")
                break
            case "HARD":
                setGridSize(4)
                setNumberOfEdges(10)
                setDifficulty("HARD")
                break
        }

        setDifficultSelected(true)
    }

    // Effect used to generate new seeded edges when the difficulty changes
    useEffect(() => {
        setEdges(generateSolvableEdges(graph, numberOfEdges, gridSize, getDailySeed(difficulty)))
        setHoveredNodeAdjacentNodes([])

        // Starts timer if start time is null and the difficulty has been selected
        if (!currentState.startTime && difficultySelected) {
            updateCurrentState (prev => {
                return {...prev, startTime: Date.now(), elapsedTime: 0}
            })
        }
    }, [difficulty])

    // Checks if puzzle is solved when tiles array changes
    useEffect(() => {
        const solved = isPuzzleSolved(tiles, edges, gridSize)

        if (solved && !isSolved) {
            updateCurrentState(prev => {
                let newElapsedTime = 0
                if (currentState.elapsedTime === 0 && currentState.startTime) {
                    newElapsedTime = Date.now() - currentState.startTime
                }

                return {...prev, isSolved: true, elapsedTime: newElapsedTime}
            })
        }
    }, [tiles])

    const R = gridSize + 1
    const viewboxWidth = 3 * R
    const viewboxHeight = Math.sqrt(3) * 2 * R

    const { width, height } = useWindowSize()

    return (
        <Container fluid className="app">
            {!difficultySelected && (
                <div>
                    <Row className="top-buttons fixed-top ibm-plex-serif-regular">
                        <Col>
                            <Button variant="outline-primary" size="sm" onClick={() => navigate("/endless")}>
                                Switch to Endless Mode
                            </Button>
                        </Col>

                        <Col className="d-flex justify-content-end">
                            <Button variant="outline-primary" size="sm">
                                <FaRegQuestionCircle />
                            </Button>
                        </Col>
                    </Row>

                    <h1 className="h1 ibm-plex-serif-semibold">Select your difficulty:</h1>

                    <div className="d-flex justify-content-center gap-3 ibm-plex-serif-semibold difficulty-buttons">
                        <Button onClick={() => handleDifficultySelect("EASY")}>Easy</Button>
                        <Button onClick={() => handleDifficultySelect("MEDIUM")}>Medium</Button>
                        <Button onClick={() => handleDifficultySelect("HARD")}>Hard</Button>
                    </div>
                </div>
            )}

            {difficultySelected && (
                <div className="app">
                {/* Draws confetti if puzzle is solved */}
                {isSolved && (
                    <Confetti
                        width={width}
                        height={height}
                        recycle={false}
                    />
                )}

                <Row className="top-buttons fixed-top ibm-plex-serif-regular">
                    <Col>
                        <Button variant="outline-primary" size="sm" onClick={() => navigate("/endless")}>
                            Switch to Endless Mode
                        </Button>

                        <Button
                            variant="outline-primary"
                            size="sm"
                            disabled={isSolved}
                            onClick={() => updateCurrentState(prev => {
                                return {...prev, tileIDs: getIDsFromTiles(solvePuzzle(edges, graph, gridSize))}})
                            }
                        >
                            Auto Solve Puzzle
                        </Button>

                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setDifficultSelected(false)}
                        >
                            Switch Difficulty
                        </Button>
                    </Col>

                    <Col className="d-flex justify-content-end">
                        <Button variant="outline-primary" size="sm">
                            <FaRegQuestionCircle />
                        </Button>
                    </Col>
                </Row>

                <h1 className="h1 ibm-plex-serif-semibold">The Calissons Puzzle</h1>

                <svg
                    viewBox={`${-viewboxWidth / 2} ${-viewboxHeight / 2} ${viewboxWidth} ${viewboxHeight}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="board"
                >
                    <g transform="scale(2)">
                        {tiles.map(tile => (
                            <DrawCalissonTile key={tile.id} tile={tile} />
                        ))}

                        {!isSolved && (
                            <DrawInteractiveGrid
                                graph={graph}
                                edges={edges}
                                interactable={true}
                                hoveredNodeAdjacentNodes={hoveredNodeAdjacentNodes}
                                onNodeClick={handleNodeClick}
                                onNodeHover={handleNodeHover}
                            />
                        )}

                        {isSolved && (
                            <DrawSolvedGrid
                                tiles={tiles}
                                graph={graph}
                            />
                        )}
                    </g>
                </svg>

                <Row className="bottom-buttons ibm-plex-serif-regular">
                    <Col>
                        <Button disabled={tiles.length === 0 || isSolved} onClick={() => updateCurrentState(prev => {
                            return {...prev, tileIDs: []}
                        })}>
                            Reset
                        </Button>
                    </Col>

                    <Col>
                        {isSolved && (
                            <Badge bg="success">
                                Time: {formatTime(currentState.elapsedTime)}
                            </Badge>
                        )}               
                    </Col>
                </Row>
            </div>)}
        </Container>
    )
}