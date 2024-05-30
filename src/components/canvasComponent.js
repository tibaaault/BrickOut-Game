import CanvasService from '../services/canvasService.js';
import InputHandler from '../handlers/inputHandler.js';

class CanvasComponent {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.isGameRunning = false;
    if (this.canvas) {
      this.canvasService = new CanvasService(this.canvas);
      this.inputHandler = new InputHandler();
      this.updateButtonState();
    } else {
      console.error("Canvas element not found");
    }
  }

  startGame() {
    if (!this.isGameRunning) {
      this.canvasService.startDrawing();
      this.gameLoop = setInterval(() => {
        this.canvasService.updatePaddlePosition(this.inputHandler.rightPressed, this.inputHandler.leftPressed);
      }, 10);
      this.isGameRunning = true;
      this.updateButtonState();
    }
  }

  stopGame() {
    if (this.isGameRunning) {
      this.canvasService.stopDrawing();
      clearInterval(this.gameLoop);
      this.isGameRunning = false;
      this.updateButtonState();
    }
  }

  updateButtonState() {
    const startButton = document.getElementById("start-button");
    const stopButton = document.getElementById("stop-button");

    if (this.isGameRunning) {
      startButton.style.display = "none";
      stopButton.style.display = "block";
    } else {
      startButton.style.display = "block";
      stopButton.style.display = "none";
    }
  }
}

export default CanvasComponent;
