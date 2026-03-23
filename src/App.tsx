import { useState, useEffect, useMemo, useRef } from "react"
import type { Point, Edge, CalissonTile, Difficulties } from "./Types"
import { DrawCalissonTile, canPlaceTile, getFillFromNodes } from "./HelperFunctions"
import { Node } from "./Node"
import { DrawGraph } from "./DrawGraph"
import { buildGraph } from "./BuildGraph"
import "./App.css"
import { generateSolvableEdges } from "./GenerateEdges"
import { Container, Dropdown, DropdownButton, Badge, Row, Col, Button } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css'
import { isPuzzleSolved } from "./IsPuzzleSolved"

export default function App() {
  // Initialise the grid size state to the default size constant
  const [gridSize, setGridSize] = useState(2)

  const [puzzlesSolved, setPuzzlesSolved] = useState<number>(0)

  const wasSolvedRef = useRef(false)

  const [isSolved, setIsSolved] = useState(false)

  // Initialise empty tiles state
  const [tiles, setTiles] = useState<CalissonTile[]>([])

  // Initialise empty edges state
  const [edges, setEdges] = useState<Edge[]>([])

  const [numberOfEdges, setNumberOfEdges] = useState<number>(4)

  const [difficulty, setDifficulty] = useState<Difficulties>("EASY")

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

  function handleNextPuzzle() {
    setEdges(generateSolvableEdges(graph, numberOfEdges, gridSize))
    setTiles([])
    setIsSolved(false)
    setHoveredNodeAdjacentNodes([])
    wasSolvedRef.current = false
  }

  // Generates puzzle if gridSize or graph changes
  useEffect(() => {
    if (!isSolved) {
      setEdges(generateSolvableEdges(graph, numberOfEdges, gridSize))
      setTiles([])
    }
  }, [gridSize, graph])

  // Checks if puzzle is solved when tiles array changes
  useEffect(() => {
    const solved = isPuzzleSolved(tiles, edges, gridSize)

    if (solved && !wasSolvedRef.current) {
      setPuzzlesSolved(prev => prev + 1)
      setIsSolved(true)
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

    setPuzzlesSolved(0)
    setIsSolved(false)
    wasSolvedRef.current = false
  }, [difficulty])

  const R = gridSize + 1
  const width = 3 * R
  const height = Math.sqrt(3) * 2 * R

  return (
    <Container fluid className="app">
      <h1 className="h1">The Calissons Puzzle</h1>

      <svg
        viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="board"
      >
        <g transform="scale(2)">
          {tiles.map(tile => (
            <DrawCalissonTile key={tile.id} tile={tile} />
          ))}

          {!isSolved && (
            <DrawGraph 
              graph={graph} 
              edges={edges} 
              hoveredNodeAdjacentNodes={hoveredNodeAdjacentNodes} 
              onNodeClick={handleNodeClick} 
              onNodeHover={handleNodeHover}
            />
          )}
        </g>
      </svg>

      <Row className="options">
        <Col xs="auto">
          <DropdownButton id="difficulty-dropdown" title={difficulty}>
            <Dropdown.Item onClick={() => setDifficulty("EASY")}>Easy</Dropdown.Item>
            <Dropdown.Item onClick={() => setDifficulty("MEDIUM")}>Medium</Dropdown.Item>
            <Dropdown.Item onClick={() => setDifficulty("HARD")}>Hard</Dropdown.Item>
          </DropdownButton>
        </Col>

        <Col xs="auto">
          <Badge pill bg="primary">Solved Puzzles: {puzzlesSolved}</Badge>
        </Col>

        <Col xs="auto">
          <Button disabled={!isSolved} onClick={handleNextPuzzle}>
            Next Puzzle
          </Button>
        </Col>
      </Row>
    </Container>
  )
}