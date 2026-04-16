import { useState, useEffect, useMemo } from "react";
import type { Point, Edge, Difficulties, DifficultyState } from "../Types";
import {
	DrawCalissonTile,
	canPlaceTile,
	getFillFromNodes,
	getDailySeed,
	getTilesFromIDs,
	getIDsFromTiles,
	returnDate,
	formatTime,
} from "../MiscellaneousFunctions";
import { Node } from "../Node";
import { DrawInteractiveGrid } from "../DrawInteractiveGrid";
import { build2DGraph } from "../Build2DGraph";
import { generateSolvableEdges } from "../GenerateEdges";
import { Container, Row, Col, Button, Modal, ToggleButton } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import { isPuzzleSolved } from "../IsPuzzleSolved";
import { IoMdExit } from "react-icons/io";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FaRegClipboard } from "react-icons/fa6";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import { solvePuzzle } from "../SolvingAlgorithm";
import { DrawSolvedGrid } from "../DrawSolvedGrid";
import { useNavigate } from "react-router-dom";
import { AboutModal, ConfirmationModal, TutorialModal } from "../Modals";

export default function DailyModePage() {
	// Initialise the grid size state
	const [gridSize, setGridSize] = useState(2);

	// Memoized graph will only be redrawn if grid size changes
	const graph = useMemo(() => build2DGraph(gridSize), [gridSize]);

	// Initialise empty edges state
	const [edges, setEdges] = useState<Edge[]>([]);
	const [numberOfEdges, setNumberOfEdges] = useState<number>(4);

	// Boolean states used for modals
	const [showResults, setShowResults] = useState(false);
	const [showTutorial, setShowTutorial] = useState(false);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [showAbout, setShowAbout] = useState(false);

	// Boolean state for puzzle interactability
	const [interactable, setInteractable] = useState(true);

	const [difficultySelected, setDifficultSelected] = useState(false);
	const [difficulty, setDifficulty] = useState<Difficulties>("EASY");

	const [showOriginalEdges, setShowOriginalEdges] = useState(false);

	// Record state that links puzzle information to its respective difficulty (and grabs saved data from local storage)
	const [difficultyStates, setDifficultyStates] = useState<Record<Difficulties, DifficultyState>>(
		() => {
			const saved = localStorage.getItem("calissonDailyState");

			// Default state for each difficulty
			const defaultState = {
				EASY: {
					tileIDs: [],
					isSolved: false,
					autoSolved: false,
					startTime: null,
					elapsedTime: 0,
				},
				MEDIUM: {
					tileIDs: [],
					isSolved: false,
					autoSolved: false,
					startTime: null,
					elapsedTime: 0,
				},
				HARD: {
					tileIDs: [],
					isSolved: false,
					autoSolved: false,
					startTime: null,
					elapsedTime: 0,
				},
			};

			if (!saved) return defaultState;

			try {
				const parsed = JSON.parse(saved);

				// Reset saved data on a new day
				if (parsed.date !== new Date().toDateString()) {
					return defaultState;
				}

				return parsed.data;
			} catch {
				return defaultState;
			}
		},
	);

	// Saves current difficulty state in local storage
	useEffect(() => {
		const payload = {
			date: new Date().toDateString(),
			data: difficultyStates,
		};

		localStorage.setItem("calissonDailyState", JSON.stringify(payload));
	}, [difficultyStates]);

	// Uses local storage to display tutorial to first time players
	useEffect(() => {
		const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");

		if (!hasSeenTutorial && difficultySelected) {
			setShowTutorial(true);
		}
	}, [difficultySelected]);

	// Uses local storage to display about page to first time players
	useEffect(() => {
		const hasSeenAbout = localStorage.getItem("hasSeenAbout");

		if (!hasSeenAbout) {
			setShowAbout(true);
		}
	}, []);

	// Helper function to update current difficulty state
	function updateCurrentState(updater: (prev: DifficultyState) => DifficultyState) {
		setDifficultyStates((prev) => ({
			...prev,
			[difficulty]: updater(prev[difficulty]),
		}));
	}

	// Get variables from current state
	const currentState = difficultyStates[difficulty];
	const tiles = getTilesFromIDs(currentState.tileIDs, graph);
	const isSolved = currentState.isSolved;
	const autoSolved = currentState.autoSolved;

	// Navigation variable for React Routing
	const navigate = useNavigate();

	// Initialise state for storing adjacent nodes to any node being hovered by user
	const [hoveredNodeAdjacentNodes, setHoveredNodeAdjacentNodes] = useState<Node[]>([]);

	// Function to place tiles when node is clicked
	function handleNodeClick(points: Point[], nodes: Node[]) {
		const id = nodes.map((p) => `${p.value.q},${p.value.r},${p.value.s}`).join("|");

		updateCurrentState((prev) => {
			const prevTiles = getTilesFromIDs(prev.tileIDs, graph);

			const tileExists = prevTiles.find((tile) => tile.id === id);

			let newTileIDs;
			if (tileExists) {
				newTileIDs = getIDsFromTiles(prevTiles.filter((tile) => tile.id !== id));
			} else {
				if (!canPlaceTile(points, prevTiles)) {
					return prev;
				}

				newTileIDs = getIDsFromTiles([
					...prevTiles,
					{
						id,
						points,
						nodes,
						fill: getFillFromNodes(nodes[0], nodes[2]),
					},
				]);
			}

			return { ...prev, tileIDs: newTileIDs };
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

	// Returns true if a tile can be placed on a node, false if not
	function canPlaceTileOnNode(points: Point[]): boolean {
		return canPlaceTile(points, tiles);
	}

	// Called when a difficulty is selected and generates puzzles determined by the date and difficulty
	function handleDifficultySelect(difficulty: Difficulties) {
		switch (difficulty) {
			case "EASY":
				setGridSize(2);
				setNumberOfEdges(4);
				setDifficulty("EASY");
				break;
			case "MEDIUM":
				setGridSize(3);
				setNumberOfEdges(8);
				setDifficulty("MEDIUM");
				break;
			case "HARD":
				setGridSize(4);
				setNumberOfEdges(10);
				setDifficulty("HARD");
				break;
		}

		setDifficultSelected(true);
	}

	// Calls solving algorithm and staggers tile placement
	function generateSolution() {
		updateCurrentState((prev) => {
			return {
				...prev,
				tileIDs: [],
				autoSolved: true,
			};
		});
		setInteractable(false);

		const newTiles = solvePuzzle(edges, graph, gridSize);

		if (!newTiles || newTiles.length === 0) return;

		const delay = 50;

		// Delay between drawing tiles
		newTiles.forEach((tile, index) => {
			setTimeout(() => {
				updateCurrentState((prev) => {
					return {
						...prev,
						tileIDs: [...prev.tileIDs, tile.id],
					};
				});
			}, index * delay);
		});

		// Re-enables interactivity after tiles are drawn
		setTimeout(() => {
			setInteractable(true);
		}, newTiles.length * delay);
	}

	// Effect used to generate new seeded edges when the difficulty changes
	useEffect(() => {
		setEdges(generateSolvableEdges(graph, numberOfEdges, gridSize, getDailySeed(difficulty)));

		setHoveredNodeAdjacentNodes([]);
		setShowOriginalEdges(false);

		if (difficultySelected) {
			updateCurrentState((prev) => {
				if (prev.startTime) return prev;
				return {
					...prev,
					startTime: Date.now(),
					elapsedTime: 0,
				};
			});
		}
	}, [difficulty, difficultySelected]);

	// Checks if puzzle is solved when tiles array changes
	useEffect(() => {
		const solved = isPuzzleSolved(tiles, edges, gridSize);

		if (solved && !isSolved) {
			updateCurrentState((prev) => {
				let newElapsedTime = 0;
				if (currentState.startTime) {
					newElapsedTime = Date.now() - currentState.startTime;
				}

				return { ...prev, isSolved: true, elapsedTime: newElapsedTime };
			});
		}
	}, [tiles, edges, gridSize]);

	// Displays results modal after a short delay
	useEffect(() => {
		if (!isSolved) return;

		const timer = setTimeout(() => {
			if (difficultySelected) {
				setShowResults(true);
			}
		}, 1000);

		return () => clearTimeout(timer);
	}, [isSolved, difficultySelected]);

	// Copy to clipboard button function
	function CopyButton({ text }: { text: string }) {
		const [copied, setCopied] = useState(false);

		const handleCopy = async () => {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		};

		return (
			<Button onClick={handleCopy}>
				{copied ? (
					"Copied!"
				) : (
					<>
						Copy to Clipboard <FaRegClipboard className="icon" />
					</>
				)}
			</Button>
		);
	}

	const R = gridSize + 1;
	const svgWidth = 3 * R;
	const svgHeight = Math.sqrt(3) * 2 * R;

	const { width, height } = useWindowSize();

	return (
		<Container fluid className="page ibm-plex-serif-semibold">
			{/* Results modal screen */}
			<Modal
				className="ibm-plex-serif-semibold"
				show={showResults}
				onHide={() => setShowResults(false)}
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title>
						{autoSolved ? "Better luck next time!" : "Nicely done!"}
					</Modal.Title>
				</Modal.Header>

				<Modal.Body className="text-center ibm-plex-serif-regular">
					<Row>
						<Col>
							Calissons Puzzle {returnDate()} {difficulty}:
						</Col>
					</Row>

					<Row>
						<Col>{autoSolved ? "FAILED" : formatTime(currentState.elapsedTime)}</Col>
					</Row>
				</Modal.Body>

				<Modal.Footer className="justify-content-center flex-column">
					<CopyButton
						text={`Calissons Puzzle ${returnDate()} ${difficulty}:\n${autoSolved ? "FAILED" : formatTime(currentState.elapsedTime)}`}
					/>

					<Button
						onClick={() => {
							setDifficultSelected(false);
							setShowResults(false);
						}}
					>
						Play Another Difficulty
					</Button>
				</Modal.Footer>
			</Modal>

			{/* Tutorial modal screen */}
			<TutorialModal 
				show={showTutorial} 
				onHide={() => {
					setShowTutorial(false);
					localStorage.setItem("hasSeenTutorial", "true");
				}} 
			/>

			{/* Tutorial modal screen */}
			<AboutModal 
				show={showAbout} 
				onHide={() => {
					setShowAbout(false)
					localStorage.setItem("hasSeenAbout", "true");
				}} 
			/>

			{/* Reveal solution confirmation */}
			<ConfirmationModal
				show={showConfirmation}
				onHide={() => setShowConfirmation(false)}
				onConfirm={() => {
					generateSolution();
					setShowConfirmation(false);
				}}
				title="Are you sure?"
				body="Auto generating the solution will count as failing the puzzle."
			/>

			{!difficultySelected && (
				<div className="app">
					<Row className="d-flex justify-content-center align-items-start top-row flex-nowrap">
						<Col xs="auto" className="d-flex justify-content-start">
							<Button onClick={() => navigate("/endless")}>
								Endless Mode <IoMdExit className="icon" />
							</Button>
						</Col>

						<Col className="d-flex flex-column align-self-center">
							<h1>The Calissons Puzzle</h1>
						</Col>

						<Col xs="auto" className="d-flex flex-column align-items-end gap-1">
							<Button onClick={() => setShowTutorial(true)}>
								How to play <FaRegQuestionCircle className="icon" />
							</Button>

							<Button onClick={() => setShowAbout(true)}>
								About <FaRegQuestionCircle className="icon" />
							</Button>
						</Col>
					</Row>

					<div className="flex-grow-1 d-flex justify-content-center align-items-center pb-5">
						<Row className="d-flex flex-column gap-2">
							<Col className="text-center">
								<h2>Select your difficulty:</h2>
							</Col>

							<Col className="d-flex justify-content-center gap-3">
								{/* Buttons are green if solved, orange if timer has started, blue if not started, and red if auto solved */}
								<Button
									onClick={() => handleDifficultySelect("EASY")}
									variant={
										difficultyStates["EASY"].autoSolved
											? "danger"
											: difficultyStates["EASY"].isSolved &&
												  !difficultyStates["EASY"].autoSolved
												? "success"
												: difficultyStates["EASY"].startTime
													? "warning"
													: "outline-primary"
									}
								>
									Easy
								</Button>

								<Button
									onClick={() => handleDifficultySelect("MEDIUM")}
									variant={
										difficultyStates["MEDIUM"].autoSolved
											? "danger"
											: difficultyStates["MEDIUM"].isSolved &&
												  !difficultyStates["MEDIUM"].autoSolved
												? "success"
												: difficultyStates["MEDIUM"].startTime
													? "warning"
													: "outline-primary"
									}
								>
									Medium
								</Button>

								<Button
									onClick={() => handleDifficultySelect("HARD")}
									variant={
										difficultyStates["HARD"].autoSolved
											? "danger"
											: difficultyStates["HARD"].isSolved &&
												  !difficultyStates["HARD"].autoSolved
												? "success"
												: difficultyStates["HARD"].startTime
													? "warning"
													: "outline-primary"
									}
								>
									Hard
								</Button>
							</Col>

							<Col className="ibm-plex-serif-regular text-center">
								(Puzzles refresh at midnight)
							</Col>
						</Row>
					</div>
				</div>
			)}

			{difficultySelected && (
				<div className="app">
					{/* Draws confetti if puzzle is solved */}
					{isSolved && !autoSolved && (
						<Confetti width={width} height={height} recycle={false} />
					)}

					<Row className="d-flex justify-content-center align-items-start top-row flex-nowrap">
						<Col xs="auto" className="d-flex flex-column align-items-start gap-1">
							<Button onClick={() => navigate("/endless")}>
								Endless Mode <IoMdExit className="icon" />
							</Button>

							<Button 
								disabled={isSolved || autoSolved} 
								onClick={() => setShowConfirmation(true)}
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

							<Button onClick={() => setDifficultSelected(false)}>
								Switch Difficulty
							</Button>
						</Col>
					</Row>

					<svg
						viewBox={`${-svgWidth / 2} ${-svgHeight / 2} ${svgWidth} ${svgHeight}`}
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
						<Col className="d-flex justify-content-center align-items-center gap-2">
							{!isSolved && (
								<Button
									disabled={tiles.length === 0 || autoSolved}
									onClick={() =>
										updateCurrentState((prev) => {
											return { ...prev, tileIDs: [] };
										})
									}
								>
									Reset
								</Button>
							)}

							{isSolved && (
								<Button onClick={() => setShowResults(true)}>View Results</Button>
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
						</Col>
					</Row>
				</div>
			)}
		</Container>
	);
}
