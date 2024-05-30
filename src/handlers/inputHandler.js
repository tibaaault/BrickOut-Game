class InputHandler {
    constructor() {
      this.rightPressed = false;
      this.leftPressed = false;
      document.addEventListener("keydown", this.keyDownHandler.bind(this), false);
      document.addEventListener("keyup", this.keyUpHandler.bind(this), false);
    }
  
    keyDownHandler(e) {
      if (e.keyCode === 39) {
        this.rightPressed = true;
      } else if (e.keyCode === 37) {
        this.leftPressed = true;
      }
    }
  
    keyUpHandler(e) {
      if (e.keyCode === 39) {
        this.rightPressed = false;
      } else if (e.keyCode === 37) {
        this.leftPressed = false;
      }
    }

    mouseMoveHandler(e) {
      let relativeX = e.clientX - this.canvas.offsetLeft;
      if (relativeX > 0 && relativeX < this.canvas.width) {
        this.paddleX = relativeX - this.paddleWidth / 2;
      }
    }

  }
  
  export default InputHandler;
  