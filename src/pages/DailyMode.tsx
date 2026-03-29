import { useState, useEffect, useMemo, useRef } from "react"
import type { Point, Edge, CalissonTile, Difficulties } from "../Types"
import { DrawCalissonTile, canPlaceTile, getFillFromNodes, formatTime, getDailySeed } from "../MiscellaneousFunctions"
import { Node } from "../Node"
import { DrawInteractiveGrid } from "../DrawInteractiveGrid"
import { buildGraph } from "../BuildGraph"
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

    const wasSolvedRef = useRef(false)

    const [isSolved, setIsSolved] = useState(false)

    // Initialise empty tiles state
    const [tiles, setTiles] = useState<CalissonTile[]>([])

    // Initialise empty edges state
    const [edges, setEdges] = useState<Edge[]>([])
    const [numberOfEdges, setNumberOfEdges] = useState<number>(4)

    const [difficultySelected, setDifficultSelected] = useState(false)
    const [difficulty, setDifficulty] = useState<Difficulties>("EASY")

    // Timer states
    const [startTime, setStartTime] = useState<number | null>(null)
    const [elapsedTime, setElapsedTime] = useState<number>(0)

    const navigate = useNavigate()

    // Initialise state for storing adjacent nodes to any node being hovered by user
    const [hoveredNodeAdjacentNodes, setHoveredNodeAdjacentNodes] = useState<Node[]>([])

    // Memoized graph will only be redrawn if grid size changes
    const graph = useMemo(() => buildGraph(gridSize), [gridSize])

    // Function to place tiles when node is clicked
    function handleNodeClick(points: Point[], nodes: Node[]) {
        const id = nodes.map(p => `${p.value.q},${p.value.r},${p.value.s}`).join("|")

        setTiles(prevTiles => {
            const tileExists = prevTiles.find(tile => tile.id === id)

            if (tileExists) {
                return prevTiles.filter(tile => tile.id !== id)
            }

            if (!canPlaceTile(points, prevTiles)) {
                return prevTiles
            }

            return [
                ...prevTiles,
                {
                    id,
                    points,
                    nodes,
                    fill: getFillFromNodes(nodes[0], nodes[2])
                }
            ]
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

        setStartTime(Date.now())
        setElapsedTime(0)
    }

    useEffect(() => {
        setEdges(generateSolvableEdges(graph, numberOfEdges, gridSize, getDailySeed(difficulty)))
        setTiles([])
        setIsSolved(false)
        setHoveredNodeAdjacentNodes([])
        wasSolvedRef.current = false
    }, [difficulty])

    // Checks if puzzle is solved when tiles array changes
    useEffect(() => {
        const solved = isPuzzleSolved(tiles, edges, gridSize)

        if (solved && !wasSolvedRef.current) {
            setIsSolved(true)

            if (startTime) {
                setElapsedTime(Date.now() - startTime) // Stop timer
            }
        }

        wasSolvedRef.current = solved
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
                            onClick={() => setTiles(solvePuzzle(edges, graph, gridSize))}
                        >
                            Auto Solve Puzzle
                        </Button>

                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setDifficultSelected(false)}
                        >
                            Select Difficulty
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
                        <Button disabled={tiles.length === 0 || isSolved} onClick={() => setTiles([])}>
                            Reset
                        </Button>
                    </Col>

                    <Col>
                        {isSolved && (
                            <Badge bg="success">
                                Time: {formatTime(elapsedTime)}
                            </Badge>
                        )}               
                    </Col>
                </Row>
            </div>)}
        </Container>
    )
}