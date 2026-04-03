import { useState, useEffect, useMemo, useRef } from "react"
import type { Point, Edge, CalissonTile, Difficulties } from "../Types"
import { DrawCalissonTile, canPlaceTile, getFillFromNodes, formatTime } from "../MiscellaneousFunctions"
import { Node } from "../Node"
import { DrawInteractiveGrid } from "../DrawInteractiveGrid"
import { build2DGraph } from "../Build2DGraph"
import "../App.css"
import { generateSolvableEdges } from "../GenerateEdges"
import { Container, Dropdown, DropdownButton, Row, Col, Button } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css'
import { isPuzzleSolved } from "../IsPuzzleSolved"
import { FaRegQuestionCircle } from "react-icons/fa";
import { IoMdExit } from "react-icons/io";
import { useWindowSize } from 'react-use'
import Confetti from 'react-confetti'
import { solvePuzzle } from "../SolvingAlgorithm"
import { DrawSolvedGrid } from "../DrawSolvedGrid"
import { useNavigate } from "react-router-dom"
import { TutorialModal } from "../Modals"

export default function EndlessModePage() {
    // Initialise the grid size state to the default size constant
    const [gridSize, setGridSize] = useState(2)

    const [puzzlesSolved, setPuzzlesSolved] = useState<number>(0)

    const wasSolvedRef = useRef(false)

    const [isSolved, setIsSolved] = useState(false)
    const [autoSolved, setAutoSolved] = useState(false)

    // Initialise empty tiles state
    const [tiles, setTiles] = useState<CalissonTile[]>([])

    // Initialise empty edges state
    const [edges, setEdges] = useState<Edge[]>([])

    const [numberOfEdges, setNumberOfEdges] = useState<number>(4)

    const [difficulty, setDifficulty] = useState<Difficulties>("EASY")

    // Timer states
    const [startTime, setStartTime] = useState<number | null>(null)
    const [elapsedTime, setElapsedTime] = useState<number>(0)

    const [showTutorial, setShowTutorial] = useState(false)

    const navigate = useNavigate()

    // Initialise state for storing adjacent nodes to any node being hovered by user
    const [hoveredNodeAdjacentNodes, setHoveredNodeAdjacentNodes] = useState<Node[]>([])

    // Memoized graph will only be redrawn if grid size changes
    const graph = useMemo(() => build2DGraph(gridSize), [gridSize])

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

    function handleNextPuzzle() {
        setEdges(generateSolvableEdges(graph, numberOfEdges, gridSize))
        setTiles([])
        setIsSolved(false)
        setAutoSolved(false)
        setHoveredNodeAdjacentNodes([])
        wasSolvedRef.current = false

        // Start timer
        setStartTime(Date.now())
        setElapsedTime(0)
    }

    // Generates puzzle if gridSize or graph changes (probably due to difficulty change)
    useEffect(() => {
        if (!isSolved) {
            setEdges(generateSolvableEdges(graph, numberOfEdges, gridSize))
            setTiles([])
            setAutoSolved(false)

            // Start timer
            setStartTime(Date.now())
            setElapsedTime(0)
        }
    }, [gridSize, graph])

    // Checks if puzzle is solved when tiles array changes
    useEffect(() => {
        const solved = isPuzzleSolved(tiles, edges, gridSize)

        if (solved && !wasSolvedRef.current) {
            if (!autoSolved) setPuzzlesSolved(prev => prev + 1)
            setIsSolved(true)

            if (startTime) {
                setElapsedTime(Date.now() - startTime) // Stop timer
            }
        }

        wasSolvedRef.current = solved
    }, [tiles])

    // Dificulty change logic
    useEffect(() => {
        switch (difficulty) {
            case "EASY":
                setGridSize(2)
                setNumberOfEdges(4)
                break
            case "MEDIUM":
                setGridSize(3)
                setNumberOfEdges(8)
                break
            case "HARD":
                setGridSize(4)
                setNumberOfEdges(10)
                break
        }

        setIsSolved(false)
        setHoveredNodeAdjacentNodes([])
        wasSolvedRef.current = false
    }, [difficulty])

    const R = gridSize + 1
    const viewboxWidth = 3 * R
    const viewboxHeight = Math.sqrt(3) * 2 * R

    const { width, height } = useWindowSize()

    return (
        <Container fluid className="page ibm-plex-serif-semibold">
            {/* Tutorial modal screen */}
            <TutorialModal show={showTutorial} onHide={() => setShowTutorial(false)} />

            {/* Draws confetti if puzzle is solved */}
            {(isSolved && !autoSolved) && (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                />
            )}

            <Row className="d-flex justify-content-center align-items-start top-row flex-nowrap">
                <Col className="d-flex flex-column align-items-start gap-1">
                    <Button onClick={() => navigate("/")}>
                        Daily Mode <IoMdExit className="icon" />
                    </Button>
                </Col>

                <Col className="d-flex flex-column align-self-center">
                    <h1>The Calissons Puzzle</h1>
                </Col>

                <Col className="d-flex flex-column align-items-end gap-1">
                    <Button onClick={() => setShowTutorial(true)}>
                        How to play <FaRegQuestionCircle className="icon" />
                    </Button>

                    <Button
                        disabled={isSolved}
                        onClick={() => {
                            setTiles(solvePuzzle(edges, graph, gridSize))
                            setAutoSolved(true)
                            setPuzzlesSolved(0)
                        }}
                    >
                        Reveal Solution
                    </Button>
                </Col>
            </Row>

            <svg
                viewBox={`${-viewboxWidth / 2} ${-viewboxHeight / 2} ${viewboxWidth} ${viewboxHeight}`}
                preserveAspectRatio="xMidYMid meet"
                className="svg"
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

            <div className="d-flex justify-content-center align-items-top gap-2 bottom-row flex-nowrap">
                <DropdownButton id="difficulty-dropdown" title={difficulty}>
                    <Dropdown.Item onClick={() => setDifficulty("EASY")}>Easy</Dropdown.Item>
                    <Dropdown.Item onClick={() => setDifficulty("MEDIUM")}>Medium</Dropdown.Item>
                    <Dropdown.Item onClick={() => setDifficulty("HARD")}>Hard</Dropdown.Item>
                </DropdownButton>

                <Button variant="outline-success" className="not-clickable">
                    Streak: {puzzlesSolved}
                </Button>

                {!isSolved && (
                    <Button disabled={tiles.length === 0} onClick={() => setTiles([])}>
                        Reset
                    </Button>
                )}

                {isSolved && (
                    <Button variant="outline-success" className="not-clickable">
                        Time: {formatTime(elapsedTime)}
                    </Button>
                )}

                <Button disabled={!isSolved} onClick={handleNextPuzzle}>
                    Next Puzzle
                </Button>
            </div>
        </Container>
    )
}