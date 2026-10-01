import { Modal, Button } from "react-bootstrap";
import placeTilesGif from "./assets/place_tiles.gif";
import removeTilesGif from "./assets/remove_tiles.gif";
import incorrectTiles from "./assets/incorrect_tiling.png";
import redX from "./assets/red_x.png";
import correctTiles from "./assets/correct_tiling.png";
import greenTick from "./assets/green_tick.png";
import solvedPuzzle from "./assets/solved_puzzle.png";
import grid from "./assets/grid.png";
import tiles from "./assets/tiles.png";
import { useWindowSize } from "react-use";

type TutorialModalProps = {
	show: boolean;
	onHide: () => void;
};

export function TutorialModal({ show, onHide }: TutorialModalProps) {
	const { width } = useWindowSize();
	const isMobile = width < 700;

	return (
		<Modal className="ibm-plex-serif-semibold" show={show} onHide={onHide} centered scrollable>
			<Modal.Header closeButton>
				<Modal.Title>How to Play</Modal.Title>
			</Modal.Header>

			<Modal.Body className="ibm-plex-serif-regular">
				<h2 className="text-center pb-1">Overview:</h2>

				<div className="text-center">
					The Calissons Puzzle is a geometry puzzle that involves placing tiles on a grid
					to satisfy the win conditions.
				</div>

				<h3 className="ps-2 pb-2 pt-3">The Grid:</h3>

				<div className="d-flex flex-column flex-md-row align-items-center text-center gap-2">
					<img src={grid} alt="Grid Example" height={200} />
					The grid is where you place tiles. The black lines in the grid are called edges.
				</div>

				<h3 className="ps-2 pb-2 pt-3">Tiles:</h3>

				<div className="d-flex flex-column flex-md-row align-items-center text-center gap-2 pb-2">
					<img src={tiles} alt="Tiles Example" height={150} />
					Tiles can come in 3 directions, each indicated by a respective colour.
				</div>

				<h2 className="text-center pb-1 pt-3">Win Conditions:</h2>

				<div className="text-center">
					1) The entire grid must be filled
					<h5 className="pt-2">AND</h5>
					2) Each puzzle edge (black line) must be adjacent to tiles of different
					directions
				</div>

				<h3 className="ps-2 pb-2 pt-2">e.g.</h3>

				<div className="d-flex align-items-center gap-4">
					<img src={incorrectTiles} alt="Incorrect Tiling" height={200} />

					<img src={redX} alt="Red X" height={100} />
				</div>

				<div className="d-flex align-items-center gap-4">
					<img src={correctTiles} alt="Correct Tiling" height={200} />

					<img src={greenTick} alt="Green Tick" height={100} />
				</div>

				<h2 className="text-center pt-2">How to place tiles:</h2>

				<div className="d-flex flex-column flex-md-row align-items-center">
					{isMobile ? (
						<ol>
							<li>Each node correlates to one tile of a specific direction</li>
							<li>Tap on a node to place the corresponding tile</li>
						</ol>
					) : (
						<ol>
							<li>Each node correlates to one tile of a specific direction</li>
							<li>
								Hover a node to see what direction (colour) of tile it represents
							</li>
							<li>Click on a node to place the corresponding tile</li>
						</ol>
					)}

					<img src={placeTilesGif} alt="How to place tiles GIF" height={200} />
				</div>

				<h2 className="text-center pt-2">How to remove tiles:</h2>

				<div className="d-flex flex-column flex-md-row align-items-center">
					{isMobile ? (
						<ol>
							<li>Each tile will always have a node in its centre</li>
							<li>If a tile is present, tap on its node to remove it</li>
						</ol>
					) : (
						<ol>
							<li>Each tile will always have a node in its centre</li>
							<li>If a tile is present, click on its node to remove it</li>
						</ol>
					)}

					<img src={removeTilesGif} alt="How to remove tiles GIF" height={200} />
				</div>

				<h3 className="text-center pt-3">Good Luck and Have Fun!</h3>
			</Modal.Body>
		</Modal>
	);
}

type ConfirmationModalProps = {
	show: boolean;
	onHide: () => void;
	onConfirm: () => void;
	title: string;
	body: string;
};

export function ConfirmationModal({
	show,
	onHide,
	onConfirm,
	title,
	body,
}: ConfirmationModalProps) {
	return (
		<Modal className="ibm-plex-serif-semibold" show={show} onHide={onHide} centered>
			<Modal.Header closeButton>
				<Modal.Title>{title}</Modal.Title>
			</Modal.Header>

			<Modal.Body className="ibm-plex-serif-regular">{body}</Modal.Body>

			<Modal.Footer className="d-flex justify-content-center">
				<Button onClick={onConfirm}>Yes</Button>

				<Button onClick={onHide}>No</Button>
			</Modal.Footer>
		</Modal>
	);
}

type AboutModalProps = {
	show: boolean;
	onHide: () => void;
};

export function AboutModal({ show, onHide }: AboutModalProps) {
	return (
		<Modal className="ibm-plex-serif-semibold" show={show} onHide={onHide} centered scrollable>
			<Modal.Header closeButton>
				<Modal.Title>About</Modal.Title>
			</Modal.Header>

			<Modal.Body className="ibm-plex-serif-regular">
				<div className="d-flex flex-column align-items-center text-center gap-2 pb-2">
					<h2>The Calissons Puzzle</h2>
					An interactive web app for automatic puzzle generation and solving
					<div className="ibm-plex-serif-semibold">By Ben Sharp</div>
					<p>
					<a href="https://github.com/beanboot/calissons-puzzle" target="_blank" rel="noreferrer">
						GitHub
					</a>
					{" • "}
					<a href="https://www.linkedin.com/in/bensharp05/" target="_blank" rel="noreferrer">
						LinkedIn
					</a>
					</p>
					<img src={solvedPuzzle} alt="A solved calisson puzzle" height={300} />
				</div>
				This web app was developed as part of my final-year project at the University of
				Sussex.
				<br />
				The project is open source - feel free to explore the GitHub repository for a more
				detailed explanation of its implementation.
				<br />
				<h5 className="pt-3">About the Puzzle</h5>
				The Calissons Puzzle (le jeu des calissons) was created in 2022 by Olivier Longuet.
				All credit for the puzzle's design goes to Olivier. Please check out his blog{" "}
				<a href="https://mathix.org/calisson/blog/" target="_blank">
					here
				</a>
				.<h5 className="pt-3">How Does It Work?</h5>
				This app implements the <i>advancing surface algorithm</i> outlined in this{" "}
				<a href="https://doi.org/10.48550/arXiv.2307.02475" target="_blank">
					paper
				</a>
				. All credit for the algorithm goes to its authors. Feel free to check out this
				project's GitHub repository for a deep dive.
			</Modal.Body>
		</Modal>
	);
}
