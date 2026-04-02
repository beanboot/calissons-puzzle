import { useState, useEffect, useMemo } from "react"
import type { Point, Edge, Difficulties, DifficultyState } from "../Types"
import { DrawCalissonTile, canPlaceTile, getFillFromNodes, getDailySeed, getTilesFromIDs, getIDsFromTiles } from "../MiscellaneousFunctions"
import { Node } from "../Node"
import { DrawInteractiveGrid } from "../DrawInteractiveGrid"
import { build2DGraph } from "../Build2DGraph"
import { generateSolvableEdges } from "../GenerateEdges"
import { Container, Row, Col, Button, Modal } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css'
import "../App.css"
import { isPuzzleSolved } from "../IsPuzzleSolved"
import { IoMdExit } from "react-icons/io";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FaRegClipboard } from "react-icons/fa6";
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

    // Boolean states used for results and tutorial modals
    const [showResults, setShowResults] = useState(false)
    const [showTutorial, setShowTutorial] = useState(false) 

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

        if (difficultySelected) {
            updateCurrentState(prev => {
                if (prev.startTime) return prev
                return {
                    ...prev,
                    startTime: Date.now(),
                    elapsedTime: 0
                }
            })
        }
    }, [difficulty, difficultySelected])

    // Checks if puzzle is solved when tiles array changes
    useEffect(() => {
        const solved = isPuzzleSolved(tiles, edges, gridSize)

        if (solved && !isSolved) {
            updateCurrentState(prev => {
                let newElapsedTime = 0
                if (currentState.startTime) {
                    newElapsedTime = Date.now() - currentState.startTime
                }

                return {...prev, isSolved: true, elapsedTime: newElapsedTime}
            })
        }
    }, [tiles, edges, gridSize])

    // Displays results modal after a short delay
    useEffect(() => {
        if (!isSolved) return

        const timer = setTimeout(() => {
            if (difficultySelected) {
                setShowResults(true)
            }
        }, 1000)

        return () => clearTimeout(timer)
    }, [isSolved, difficultySelected])

    const R = gridSize + 1
    const svgWidth = 3 * R
    const svgHeight = Math.sqrt(3) * 2 * R

    const { width, height } = useWindowSize()

    return (
        <Container fluid className="page ibm-plex-serif-semibold">
            {/* Results modal screen */}
            <Modal show={showResults} onHide={() => setShowResults(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Nicely done!</Modal.Title>
                </Modal.Header>

                <Modal.Body className="text-center">
                    Date, Difficulty, Time, etc...
                </Modal.Body>

                <Modal.Footer className="justify-content-center">
                    <Button>Copy to Clipboard <FaRegClipboard className="icon" /></Button>

                    <Button 
                        onClick={() => {
                            setDifficultSelected(false)
                            setShowResults(false)
                        }}
                    >
                        Play Another Difficulty
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Tutorial modal screen */}
            <Modal show={showTutorial} onHide={() => setShowTutorial(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Tutorial</Modal.Title>
                </Modal.Header>

                <Modal.Body className="text-center">
                    How to play...
                </Modal.Body>
            </Modal>

            {!difficultySelected && (
                <div className="app">
                    <Row className="d-flex justify-content-center align-items-start top-row flex-nowrap">
                        <Col className="d-flex justify-content-start">
                            <Button onClick={() => navigate("/endless")}>
                                Endless Mode <IoMdExit className="icon" />
                            </Button>
                        </Col>

                        <Col className="d-flex flex-column align-self-center">
                            <h1>The Calissons Puzzle</h1> 
                        </Col>

                        <Col className="d-flex flex-column align-items-end gap-1">
                            <Button onClick={() => setShowTutorial(true)}>
                                How to play <FaRegQuestionCircle className="icon" />
                            </Button>

                            <Button>
                                About <FaRegQuestionCircle className="icon" />
                            </Button>
                        </Col>
                    </Row>

                    <div className="flex-grow-1 d-flex justify-content-center align-items-center pb-5">
                        <Row className="d-flex flex-column gap-2">
                            <Col>
                                <h1>Select your difficulty:</h1>
                            </Col>
                        
                            <Col className="d-flex justify-content-center gap-3">
                                {/* Buttons are green if solved, orange if timer has started, and blue if not started */}
                                <Button 
                                    onClick={() => handleDifficultySelect("EASY")}
                                    variant={difficultyStates["EASY"].isSolved ? "success" : difficultyStates["EASY"].startTime ? "warning": "outline-primary"}
                                >
                                    Easy
                                </Button>

                                <Button 
                                    onClick={() => handleDifficultySelect("MEDIUM")}
                                    variant={difficultyStates["MEDIUM"].isSolved ? "success" : difficultyStates["MEDIUM"].startTime ? "warning": "outline-primary"}
                                >
                                    Medium
                                </Button>

                                <Button 
                                    onClick={() => handleDifficultySelect("HARD")}
                                    variant={difficultyStates["HARD"].isSolved ? "success" : difficultyStates["HARD"].startTime ? "warning": "outline-primary"}
                                >
                                    Hard
                                </Button>
                            </Col>
                        </Row>
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

                    <Row className="d-flex justify-content-center align-items-start top-row flex-nowrap">
                        <Col className="d-flex flex-column align-items-start gap-1">
                            <Button onClick={() => navigate("/endless")}>
                                Endless Mode <IoMdExit className="icon" />
                            </Button>

                            <Button onClick={() => setDifficultSelected(false)}>
                                Switch Difficulty
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
                                onClick={() => updateCurrentState(prev => {
                                    return {...prev, tileIDs: getIDsFromTiles(solvePuzzle(edges, graph, gridSize))}})
                                }
                            >
                                Reveal Solution
                            </Button>
                        </Col>
                    </Row>

                    <svg
                        viewBox={`${-svgWidth / 2} ${-svgHeight / 2} ${svgWidth} ${svgHeight}`}
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

                    <Row className="bottom-row">
                        <Col className="d-flex flex-column align-items-center">
                            {!isSolved && (
                                <Button disabled={tiles.length === 0} onClick={() => updateCurrentState(prev => {
                                    return {...prev, tileIDs: []}
                                })}>
                                    Reset Puzzle
                                </Button>
                            )}

                            {isSolved && (
                                <Button onClick={() => setShowResults(true)}>
                                    View Results
                                </Button>
                            )} 
                        </Col>             
                    </Row>
                </div>)}
        </Container>
    )
}