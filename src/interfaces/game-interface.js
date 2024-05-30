import CanvasComponent from "../components/canvasComponent.js";

class GameInterface {
  constructor() {
    this.canvasComponent = new CanvasComponent();

    // Start button
    const startButton = document.getElementById("start-button");
    startButton.addEventListener("click", () => {
      this.canvasComponent.startGame();
    });

    // Stop button
    const stopButton = document.getElementById("stop-button");
    stopButton.addEventListener("click", () => {
      this.canvasComponent.stopGame();
    });

    // Reset button
    const resetButton = document.getElementById("reset-button");
    resetButton.addEventListener("click", () => {
      localStorage.removeItem("leaderboard");
      document.location.reload();
    });
  }
}

export default GameInterface;
