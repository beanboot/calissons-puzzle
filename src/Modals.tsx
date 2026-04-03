import { Modal, Row, Col } from "react-bootstrap"
import placeTilesGif from "./assets/place_tiles.gif"
import removeTilesGif from "./assets/remove_tiles.gif"
import incorrectTiles from "./assets/incorrect_tiling.png"
import redX from "./assets/red_x.png"
import correctTiles from "./assets/correct_tiling.png"
import greenTick from "./assets/green_tick.png"

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
                                Hover to see what colour of tile a node represents
                            </li>
                            <li>
                                Click on a node to place its respective tile
                            </li>
                            <li>
                                Tiles cannot overlap
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

                <Row className="pt-5 pb-1">
                    <Col>
                        <h2 className="text-center">How to win:</h2>
                    </Col>
                </Row>

                <Row className="text-center">
                    <Col>
                        <h5>The goal is to place tiles such that:</h5>
                    </Col>
                </Row>

                <Row className="text-center">
                    <Col>
                        1) The entire grid is filled
                    </Col>
                </Row>

                <Row className="text-center pt-2">
                    <Col>
                        <h5>AND</h5>
                    </Col>
                </Row>

                <Row className="text-center">
                    <Col>
                        2) Each puzzle edge is adjacent to tiles of different directions
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <h3>e.g.</h3>
                    </Col>
                </Row>

                <Row className="d-flex align-items-center justify-content-center pt-2">
                    <Col className="d-flex justify-content-center">
                        <img src={incorrectTiles} alt="Incorrect Tiling" height={200} />
                    </Col>

                    <Col>
                        <img src={redX} alt="Red X" height={100} />
                    </Col>
                </Row>

                <Row className="d-flex align-items-center justify-content-center">
                    <Col className="d-flex justify-content-center">
                        <img src={correctTiles} alt="Correct Tiling" height={200} />
                    </Col>

                    <Col>
                        <img src={greenTick} alt="Green Tick" height={100} />
                    </Col>
                </Row>

                <Row className="text-center pt-2">
                    <Col>
                        <h3>Good Luck and Have Fun!</h3>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    )
}