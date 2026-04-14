import { useState, useEffect, useMemo, useRef } from "react";
import type { Point, Edge, CalissonTile, Difficulties } from "../Types";
import {
	DrawCalissonTile,
	canPlaceTile,
	getFillFromNodes,
	formatTime,
} from "../MiscellaneousFunctions";
import { Node } from "../Node";
import { DrawInteractiveGrid } from "../DrawInteractiveGrid";
import { build2DGraph } from "../Build2DGraph";
import "../App.css";
import { generateSolvableEdges } from "../GenerateEdges";
import {
	Container,
	Dropdown,
	DropdownButton,
	Row,
	Col,
	Button,
	ToggleButton,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { isPuzzleSolved } from "../IsPuzzleSolved";
import { FaRegQuestionCircle } from "react-icons/fa";
import { IoMdExit } from "react-icons/io";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import { solvePuzzle } from "../SolvingAlgorithm";
import { DrawSolvedGrid } from "../DrawSolvedGrid";
import { useNavigate } from "react-router-dom";
import { TutorialModal, ConfirmationModal } from "../Modals";

export default function EndlessModePage() {
	// Initialise the grid size state to the default size constant
	const [gridSize, setGridSize] = useState(2);

	const [puzzlesSolved, setPuzzlesSolved] = useState<number>(0);

	const wasSolvedRef = useRef(false);

	const [isSolved, setIsSolved] = useState(false);
	const [autoSolved, setAutoSolved] = useState(false);

	// Boolean state for puzzle interactability
	const [interactable, setInteractable] = useState(true);

	// Initialise empty tiles state
	const [tiles, setTiles] = useState<CalissonTile[]>([]);

	// Initialise empty edges state
	const [edges, setEdges] = useState<Edge[]>([]);

	const [numberOfEdges, setNumberOfEdges] = useState<number>(4);

	const [difficulty, setDifficulty] = useState<Difficulties>("EASY");

	// Timer states
	const [startTime, setStartTime] = useState<number | null>(null);
	const [elapsedTime, setElapsedTime] = useState<number>(0);

	const [showTutorial, setShowTutorial] = useState(false);
	const [showSolutionConfirmation, setShowSolutionConfirmation] = useState(false);
	const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);

	const [showOriginalEdges, setShowOriginalEdges] = useState(false);

	const navigate = useNavigate();

	// Initialise state for storing adjacent nodes to any node being hovered by user
	const [hoveredNodeAdjacentNodes, setHoveredNodeAdjacentNodes] = useState<
		Node[]
	>([]);

	// Memoized graph will only be redrawn if grid size changes
	const graph = useMemo(() => build2DGraph(gridSize), [gridSize]);

	// Function to place tiles when node is clicked
	function handleNodeClick(points: Point[], nodes: Node[]) {
		const id = nodes
			.map((p) => `${p.value.q},${p.value.r},${p.value.s}`)
			.join("|");

		setTiles((prevTiles) => {
			const tileExists = prevTiles.find((tile) => tile.id === id);

			if (tileExists) {
				return prevTiles.filter((tile) => tile.id !== id);
			}

			if (!canPlaceTile(points, prevTiles)) {
				return prevTiles;
			}

			return [
				...prevTiles,
				{
					id,
					points,
					nodes,
					fill: getFillFromNodes(nodes[0], nodes[2]),
				},
			];
		});
	}

	// Fills the adjacent node state when a node is hovered
	function handleNodeHover(nodes: Node[] | null) {
		if (nodes === null) {
			setHoveredNodeAdjacentNodes([]);
		} else {
			setHoveredNodeAdjacentNodes(nodes);
		}
	}

	function handleNextPuzzle() {
		setEdges(generateSolvableEdges(graph, numberOfEdges, gridSize));
		setTiles([]);
		setIsSolved(false);
		setAutoSolved(false);
		setHoveredNodeAdjacentNodes([]);
		wasSolvedRef.current = false;
		setShowOriginalEdges(false);

		// Start timer
		setStartTime(Date.now());
		setElapsedTime(0);
	}

	// Returns true if a tile can be placed on a node, false if not
	function canPlaceTileOnNode(points: Point[]): boolean {
		return canPlaceTile(points, tiles);
	}

	// Calls solving algorithm and staggers tile placement
	function generateSolution() {
		setTiles([]);
		setInteractable(false);
		setAutoSolved(true);
		setPuzzlesSolved(0);

		const newTiles = solvePuzzle(edges, graph, gridSize);

		if (!newTiles || newTiles.length === 0) return;

		const delay = 50;

		// Delay between drawing tiles
		newTiles.forEach((tile, index) => {
			setTimeout(() => {
				setTiles((prev) => [...prev, tile]);
			}, index * delay);
		});

		// Re-enables interactivity after tiles are drawn
		setTimeout(() => {
			setInteractable(true);
		}, newTiles.length * delay);
	}

	// Generates puzzle if gridSize or graph changes (probably due to difficulty change)
	useEffect(() => {
		if (!isSolved) {
			setEdges(generateSolvableEdges(graph, numberOfEdges, gridSize));
			setTiles([]);
			setAutoSolved(false);
			setShowOriginalEdges(false);

			// Start timer
			setStartTime(Date.now());
			setElapsedTime(0);
		}
	}, [gridSize, graph]);

	// Checks if puzzle is solved when tiles array changes
	useEffect(() => {
		const solved = isPuzzleSolved(tiles, edges, gridSize);

		if (solved && !wasSolvedRef.current) {
			if (!autoSolved) setPuzzlesSolved((prev) => prev + 1);
			setIsSolved(true);

			if (startTime) {
				setElapsedTime(Date.now() - startTime); // Stop timer
			}
		}

		wasSolvedRef.current = solved;
	}, [tiles]);

	// Dificulty change logic
	useEffect(() => {
		switch (difficulty) {
			case "EASY":
				setGridSize(2);
				setNumberOfEdges(4);
				break;
			case "MEDIUM":
				setGridSize(3);
				setNumberOfEdges(8);
				break;
			case "HARD":
				setGridSize(4);
				setNumberOfEdges(10);
				break;
		}

		setIsSolved(false);
		setHoveredNodeAdjacentNodes([]);
		wasSolvedRef.current = false;
	}, [difficulty]);

	// Uses local storage to display tutorial to first time players
	useEffect(() => {
		const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");

		if (!hasSeenTutorial) {
			setShowTutorial(true);
		}
	}, []);

	const R = gridSize + 1;
	const viewboxWidth = 3 * R;
	const viewboxHeight = Math.sqrt(3) * 2 * R;

	const { width, height } = useWindowSize();

	return (
		<Container fluid className="page ibm-plex-serif-semibold">
			{/* Tutorial modal screen */}
			<TutorialModal
				show={showTutorial}
				onHide={() => setShowTutorial(false)}
			/>

			{/* Reveal solution confirmation */}
			<ConfirmationModal
				show={showSolutionConfirmation}
				onHide={() => setShowSolutionConfirmation(false)}
				onConfirm={() => {
					generateSolution();
					setShowSolutionConfirmation(false);
				}}
				title="Are you sure?"
				body="Auto generating the solution will reset your streak to zero."
			/>

			{/* Skip puzzle confirmation */}
			<ConfirmationModal
				show={showSkipConfirmation}
				onHide={() => setShowSkipConfirmation(false)}
				onConfirm={() => {
					handleNextPuzzle();
					setPuzzlesSolved(0);
					setShowSkipConfirmation(false);
				}}
				title="Are you sure?"
				body="This will skip the current puzzle, and reset your streak to zero."
			/>

			{/* Draws confetti if puzzle is solved */}
			{isSolved && !autoSolved && (
				<Confetti width={width} height={height} recycle={false} />
			)}

			<Row className="d-flex justify-content-center align-items-start top-row flex-nowrap">
				<Col xs="auto" className="d-flex flex-column align-items-start gap-1">
					<Button onClick={() => navigate("/")}>
						Daily Mode <IoMdExit className="icon" />
					</Button>

					<Button
						disabled={isSolved || autoSolved}
						onClick={() => setShowSolutionConfirmation(true)}
					>
						Generate Solution
					</Button>
				</Col>

				<Col className="d-flex flex-column align-self-center">
					<h1>The Calissons Puzzle</h1>
				</Col>

				<Col xs="auto" className="d-flex flex-column align-items-end gap-1">
					<Button onClick={() => setShowTutorial(true)}>
						How to play <FaRegQuestionCircle className="icon" />
					</Button>

					{!isSolved && (
						<Button
							disabled={isSolved || autoSolved}
							onClick={() => setShowSkipConfirmation(true)}
						>
							Skip Puzzle
						</Button>
					)}

					{isSolved && (
						<Button 
							disabled={!isSolved} 
							onClick={handleNextPuzzle}
							variant="success"
						>
							Next Puzzle
						</Button>
					)}
				</Col>
			</Row>

			<svg
				viewBox={`${-viewboxWidth / 2} ${-viewboxHeight / 2} ${viewboxWidth} ${viewboxHeight}`}
				preserveAspectRatio="xMidYMid meet"
				className="svg"
			>
				<g transform="scale(2)">
					{tiles.map((tile) => (
						<DrawCalissonTile key={tile.id} tile={tile} />
					))}

					{!isSolved && (
						<DrawInteractiveGrid
							graph={graph}
							edges={edges}
							interactable={interactable}
							hoveredNodeAdjacentNodes={hoveredNodeAdjacentNodes}
							onNodeClick={handleNodeClick}
							onNodeHover={handleNodeHover}
							canPlaceTileOnNode={canPlaceTileOnNode}
						/>
					)}

					{isSolved && (
						<DrawSolvedGrid
							tiles={tiles}
							graph={graph}
							edges={edges}
							showOriginalEdges={showOriginalEdges}
						/>
					)}
				</g>
			</svg>

			<Row className="bottom-row">
				<Col className="d-flex justify-content-center align-items-top gap-2">
					<DropdownButton id="difficulty-dropdown" title={difficulty} disabled={autoSolved && !isSolved}>
						<Dropdown.Item onClick={() => setDifficulty("EASY")}>
							Easy
						</Dropdown.Item>
						<Dropdown.Item onClick={() => setDifficulty("MEDIUM")}>
							Medium
						</Dropdown.Item>
						<Dropdown.Item onClick={() => setDifficulty("HARD")}>
							Hard
						</Dropdown.Item>
					</DropdownButton>

					{!isSolved && (
						<Button
							disabled={tiles.length === 0 || autoSolved}
							onClick={() => setTiles([])}
						>
							Reset
						</Button>
					)}

					{isSolved && (
						<ToggleButton
							id="original-puzzle-toggle"
							value={1}
							type="checkbox"
							variant="outline-primary"
							checked={!showOriginalEdges}
							onClick={() => setShowOriginalEdges((prev) => !prev)}
							className="d-flex align-items-center justify-content-center"
						>
							Toggle Edges
						</ToggleButton>
					)}

					{isSolved && (
						<Button variant="outline-success" className="not-clickable">
							Time: {formatTime(elapsedTime)}
						</Button>
					)}

					<Button variant="outline-success" className="not-clickable">
						Streak: {puzzlesSolved}
					</Button>
				</Col>
			</Row>
		</Container>
	);
}
