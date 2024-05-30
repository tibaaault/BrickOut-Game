import CanvasService from '../services/canvasService.js';
import InputHandler from '../handlers/inputHandler.js';

class CanvasComponent {
  constructor() {
    this.canvas = document.getElementById("canvas");
    if (this.canvas) {
      this.canvasService = new CanvasService(this.canvas);
      this.inputHandler = new InputHandler();
      this.startGame();
    } else {
      console.error("Canvas element not found");
    }
  }

  startGame() {
    this.canvasService.startDrawing();
    this.gameLoop = setInterval(() => {
      this.canvasService.updatePaddlePosition(this.inputHandler.rightPressed, this.inputHandler.leftPressed);
    }, 10);
  }

  stopGame() {
    this.canvasService.stopDrawing();
    this.clearInterval(this.gameLoop);
  }
}

export default CanvasComponent;
