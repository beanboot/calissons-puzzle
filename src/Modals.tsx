import { Modal, Row, Col, Button } from "react-bootstrap"
import placeTilesGif from "./assets/place_tiles.gif"
import removeTilesGif from "./assets/remove_tiles.gif"
import incorrectTiles from "./assets/incorrect_tiling.png"
import redX from "./assets/red_x.png"
import correctTiles from "./assets/correct_tiling.png"
import greenTick from "./assets/green_tick.png"
import solvedPuzzle from "./assets/solved_puzzle.png"

type TutorialModalProps = {
  show: boolean
  onHide: () => void
}

export function TutorialModal({
    show,
    onHide
}: TutorialModalProps) {
    return (
        <Modal className="ibm-plex-serif-semibold" show={show} onHide={onHide} centered scrollable>
            <Modal.Header closeButton>
                <Modal.Title>How to Play</Modal.Title>
            </Modal.Header>

            <Modal.Body className="ibm-plex-serif-regular">
                <Row className="pb-1">
                    <Col>
                        <h2 className="text-center">Win Conditions:</h2>
                    </Col>
                </Row>

                <Row className="text-center">
                    <Col>
                        1) The entire grid must be filled
                    </Col>
                </Row>

                <Row className="text-center pt-2">
                    <Col>
                        <h5>AND</h5>
                    </Col>
                </Row>

                <Row className="text-center">
                    <Col>
                        2) Each puzzle edge (black line) must be adjacent to tiles of different directions
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <h3>e.g.</h3>
                    </Col>
                </Row>

                <Row className="d-flex align-items-center justify-content-center flex-nowrap pt-2">
                    <Col className="d-flex justify-content-center">
                        <img src={incorrectTiles} alt="Incorrect Tiling" height={200} />
                    </Col>

                    <Col>
                        <img src={redX} alt="Red X" height={100} />
                    </Col>
                </Row>

                <Row className="d-flex align-items-center justify-content-center flex-nowrap">
                    <Col className="d-flex justify-content-center">
                        <img src={correctTiles} alt="Correct Tiling" height={200} />
                    </Col>

                    <Col>
                        <img src={greenTick} alt="Green Tick" height={100} />
                    </Col>
                </Row>

                <Row className="pt-2 pb-1">
                    <Col>
                        <h2 className="text-center">How to place tiles:</h2>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <ol>
                            <li>
                                Each node correlates to a specific tile
                            </li>
                            <li>
                                Hover to see what colour of tile a node represents (PC Only)
                            </li>
                            <li>
                                Click on a node to place its respective tile
                            </li>
                        </ol>
                    </Col>

                    <Col className="d-flex align-items-center">
                        <img src={placeTilesGif} alt="How to place tiles GIF" height={200} />
                    </Col>
                </Row>

                <Row className="pt-5 pb-1">
                    <Col>
                        <h2 className="text-center">How to remove tiles:</h2>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <ol>
                            <li>
                                Each tile will always have a node in its centre
                            </li>
                            <li>
                                If a tile is present, click on its node to remove it
                            </li>
                        </ol>
                    </Col>

                    <Col className="d-flex align-items-center">
                        <img src={removeTilesGif} alt="How to remove tiles GIF" height={200} />
                    </Col>
                </Row>

                <Row className="text-center pt-4">
                    <Col>
                        <h3>Good Luck and Have Fun!</h3>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    )
}

type ConfirmationModalProps = {
  show: boolean
  onHide: () => void
  onConfirm: () => void
  title: string
  body: string
}

export function ConfirmationModal({
    show,
    onHide,
    onConfirm,
    title,
    body
}: ConfirmationModalProps) {
    return (
        <Modal className="ibm-plex-serif-semibold" show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {title}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="ibm-plex-serif-regular">
                {body}
            </Modal.Body>

            <Modal.Footer className="d-flex justify-content-center">
                <Button onClick={onConfirm}>
                    Yes
                </Button>

                <Button onClick={onHide}>
                    No
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

type AboutModalProps = {
  show: boolean
  onHide: () => void
}

export function AboutModal({
    show,
    onHide
}: AboutModalProps) {
    return (
        <Modal className="ibm-plex-serif-semibold" show={show} onHide={onHide} centered scrollable>
            <Modal.Header closeButton>
                <Modal.Title>About</Modal.Title>
            </Modal.Header>

            <Modal.Body className="ibm-plex-serif-regular">
                <Row>
                    <Col>
                        <h2 className="text-center">The Calissons Puzzle</h2>
                    </Col>
                </Row>

                <Row className="text-center">
                    <Col>
                        An interactive web app for automatic puzzle generation and solving
                    </Col>
                </Row>

                <Row className="text-center pt-2 ibm-plex-serif-semibold">
                    <Col>
                        By Ben Sharp
                    </Col>
                </Row>

                <Row className="pt-3 pb-3">
                    <Col className="d-flex justify-content-center align-items-center">
                        <img src={solvedPuzzle} alt="A solved calisson puzzle" height={300}/>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        This web app was developed as part of my final-year project at the University of Sussex.<br />
                        The project is open source - feel free to explore the GitHub repository for a more detailed
                        explanation of its implementation.<br />
                        <i>(GitHub repo will be made public after submission)</i>
                    </Col>
                </Row>

                <Row className="pt-3">
                    <Col>
                        <h5>About the Puzzle</h5>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        The Calissons Puzzle (le jeu des calissons) was created in 2022 by Olivier
                        Longuet. All credit for the puzzle's design goes to Olivier.
                        Please check out his blog <a href="https://mathix.org/calisson/blog/" target="_blank">here</a>.
                    </Col>
                </Row>

                <Row className="pt-3">
                    <Col>
                        <h5>How Does It Work?</h5>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        This app implements the <i>advancing surface algorithm</i> outlined in 
                        this <a href="https://doi.org/10.48550/arXiv.2307.02475" target="_blank">paper</a>.
                        All credit for the algorithm goes to its authors. Feel free to check out this project's GitHub 
                        repository for a deeper explanation.
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    )
}