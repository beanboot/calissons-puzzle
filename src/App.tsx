import { useState, useEffect, useMemo } from "react"
import type { Point, Edge, CalissonTile } from "./Types"
import { DrawCalissonTile, canPlaceTile } from "./HelperFunctions"
import { Node } from "./Node"
import { DrawGraph } from "./DrawGraph"
import { buildGraph } from "./BuildGraph"
import "./App.css"
import { generateSolvableEdges } from "./GenerateEdges"
import { DEFAULT_GRID_SIZE, NUMBER_OF_EDGES } from "./Constants"
import { Container, Row, Col, Button, ButtonGroup, Card } from "react-bootstrap"

export default function App() {
  // Initialise the grid size state to the default size constant
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE)

  // Initialise empty tiles state
  const [tiles, setTiles] = useState<CalissonTile[]>([])

  // Initialise empty edges state
  const [edges, setEdges] = useState<Edge[]>([])

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
          nodeA: nodes[0],
          nodeB: nodes[1]
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

  // Generates random edges until the puzzle is solvable
  useEffect(() => {
    setEdges(generateSolvableEdges(graph, NUMBER_OF_EDGES, gridSize))
  }, [gridSize, graph])

  // limits the grid size between 2 and 4
  const clamp = (n: number) => Math.max(2, Math.min(4, Math.floor(n)))

  const R = gridSize + 1
  const width = 3 * R
  const height = Math.sqrt(3) * 2 * R

  return (
    <Container fluid className="app">
      <Row className="align-items-center">
        <Col className="align-items-center">
          <h1 className="h1">Calissons Puzzle</h1>
        </Col>
        <Col md={8}>
            <svg
              viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
              preserveAspectRatio="xMidYMid meet"
              className="board"
            >
              <g transform="scale(1.5)">
                {tiles.map(tile => (
                  <DrawCalissonTile key={tile.id} tile={tile} />
                ))}

                <DrawGraph 
                  graph={graph} 
                  edges={edges} 
                  hoveredNodeAdjacentNodes={hoveredNodeAdjacentNodes} 
                  onNodeClick={handleNodeClick} 
                  onNodeHover={handleNodeHover}
                />
              </g>
            </svg>
        </Col>

        <Col md={4} className="d-flex justify-content-center">
          <Card className="mt-3 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center gap-2">
                <ButtonGroup>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => {
                      setGridSize(prev => clamp(prev - 1));
                      setTiles([]);
                    }}
                  >
                    -
                  </Button>

                  <Button variant="light" size="sm" disabled>
                    {gridSize}
                  </Button>

                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => {
                      setGridSize(prev => clamp(prev + 1));
                      setTiles([]);
                    }}
                  >
                    +
                  </Button>
                </ButtonGroup>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}