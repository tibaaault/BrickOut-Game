import Bonus from "../components/bonusComponent.js";

class CanvasService {
  constructor(canvas) {
    // Canvas
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    // Ball
    this.ballRadius = 12;
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height - 30;
    this.dx = 5;
    this.dy = -5;
    // Paddle
    this.paddleHeight = 10;
    this.paddleWidth = 100;
    this.paddleX = (this.canvas.width - this.paddleWidth) / 2;
    // Bricks
    this.brickRowCount = 4;
    this.brickColumnCount = 13;
    this.brickWidth = this.canvas.width / (this.brickColumnCount + 1);
    this.brickHeight = 20;
    this.brickPadding = 4;
    this.brickOffsetTop = 30;
    this.brickOffsetLeft = 5;
    this.createBricks();
    // Acceleration factor
    this.accelerationFactor = 1.05;
    // Score
    this.score = 0;
    // Lives
    this.lives = 3;
    // Game over
    this.gameOverNotify = document.querySelector(".game-over-notify");
    this.gameOverNotify.addEventListener("click", function () {
      document.location.reload();
    });
    this.interval = null;
    // Bonus
    this.bonuses = [];

    // Leaderboard
    this.leaderboard = [];
    const savedLeaderboard = localStorage.getItem("leaderboard");
    if (savedLeaderboard) {
      this.leaderboard = JSON.parse(savedLeaderboard);
    }
    this.displayLeaderboard();
  }

  // function to draw the ball
  drawBall() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.ballColor || "#0095DD";
    this.ctx.fill();
    this.ctx.closePath();
  }

  // function to draw the paddle
  drawPaddle() {
    this.ctx.beginPath();
    const paddleY = this.canvas.height - this.paddleHeight - 10;
    this.ctx.rect(this.paddleX, paddleY, this.paddleWidth, this.paddleHeight);
    //red color
    this.ctx.fillStyle = "#FF0000";
    this.ctx.fill();
    this.ctx.closePath();
  }

  // function to update the paddle position
  updatePaddlePosition(rightPressed, leftPressed) {
    if (rightPressed && this.paddleX < this.canvas.width - this.paddleWidth) {
      this.paddleX += 7 * this.accelerationFactor;
    } else if (leftPressed && this.paddleX > 0) {
      this.paddleX -= 7 * this.accelerationFactor;
    }
  }

  //function to create the bricks
  createBricks() {
    this.bricks = [];
    for (let c = 0; c < this.brickColumnCount; c++) {
      this.bricks[c] = [];
      for (let r = 0; r < this.brickRowCount; r++) {
        const brickX =
          c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
        const brickY =
          r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
        this.bricks[c][r] = { x: brickX, y: brickY, status: 1, lives: 3 };
      }
    }
  }

  //function to draw the bricks
  drawBricks() {
    for (let r = 0; r < this.brickRowCount; r++) {
      for (let c = 0; c < this.brickColumnCount; c++) {
        let b = this.bricks[c][r];
        if (b.status == 1) {
          let brickX = b.x;
          let brickY = b.y;
          this.ctx.beginPath();
          this.ctx.rect(brickX, brickY, this.brickWidth, this.brickHeight);
          this.ctx.fillStyle = this.getBrickColor(b.lives);
          this.ctx.fill();
          this.ctx.closePath();
        }
      }
    }
  }

  // function to get the brick color based on lives
  getBrickColor(lives) {
    switch (lives) {
      case 3:
        return "#0095DD"; // Blue
      case 2:
        return "#FFA500"; // Orange
      case 1:
        return "#FF0000"; // Red
      default:
        return "#000000"; // Black
    }
  }

  // function to detect the collision
  collisionDetection() {
    let ballHitBrick = false;
    let linesDestroyed = 0; 
    for (let r = 0; r < this.brickRowCount; r++) {
      let bricksInLine = this.bricks.map((column) => column[r]); 
      // Check if all bricks in the line are destroyed
      if (bricksInLine.every((brick) => brick.status === 0)) {
        linesDestroyed++;
      }
    }

    for (let c = 0; c < this.brickColumnCount; c++) {
      for (let r = 0; r < this.brickRowCount; r++) {
        let b = this.bricks[c][r];
        if (b.status == 1) {
          if (
            this.x + this.ballRadius > b.x &&
            this.x - this.ballRadius < b.x + this.brickWidth &&
            this.y + this.ballRadius > b.y &&
            this.y - this.ballRadius < b.y + this.brickHeight
          ) {
            if (!ballHitBrick) {
              ballHitBrick = true;
              if (
                this.y - this.dy <= b.y ||
                this.y - this.dy >= b.y + this.brickHeight
              ) {
                this.dy = -this.dy;
              } else {
                this.dx = -this.dx;
              }
              b.lives -= 1;
              if (b.lives <= 0) {
                b.status = 0;
                this.score++;
                if (Math.random() < 0.3) {
                  this.createBonus(
                    b.x + this.brickWidth / 2,
                    b.y + this.brickHeight / 2
                  );
                }
              }
              this.ballColor = this.getRandomColor();
            }
          }
        }
      }
    }

    // add bonus points for each line destroyed
    this.score += linesDestroyed * 10;

    // check if the player has won
    if (this.score >= this.brickRowCount * this.brickColumnCount + linesDestroyed * 10) {
      alert("Vous avez gagné !");
      this.stopDrawing();
    }
  }

  //function to draw the game
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBricks();
    this.drawBall();
    this.drawPaddle();
    this.drawBonus();
    this.drawScore();
    this.drawLives();
    this.collisionDetection();
    this.checkBonusCollision();

    // manage the ball's movements
    if (
      this.x + this.dx > this.canvas.width - this.ballRadius ||
      this.x + this.dx < this.ballRadius
    ) {
      this.dx = -this.dx;
    }
    // manage the ball's movements on the top wall
    if (this.y + this.dy < this.ballRadius) {
      this.dy = -this.dy;
    }

    // manage the ball's movements on the paddle
    if (
      this.y + this.dy >
      this.canvas.height - this.ballRadius - this.paddleHeight
    ) {
      if (
        this.y + this.dy >
        this.canvas.height - this.ballRadius - this.paddleHeight
      ) {
        if (this.x > this.paddleX && this.x < this.paddleX + this.paddleWidth) {
          let hitPosition = (this.x - this.paddleX) / this.paddleWidth;
          let angle = (hitPosition * Math.PI) / 4 - Math.PI / 8;
          this.dx = 5 * Math.sin(angle);
          this.dy = -5 * Math.cos(angle);
          this.accelerationFactor += 0.15;
          this.dx *= this.accelerationFactor;
          this.dy *= this.accelerationFactor;
        }
      }
    }
    // manage the ball's movements on the bottom wall
    if (this.y + this.dy > this.canvas.height - this.ballRadius) {
      this.lives--;
      if (!this.lives) {
        this.drawLives();
        this.gameOver();
        return;
      } else {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height - 30;
        this.dx = 5;
        this.dy = -5;
        this.paddleX = (this.canvas.width - this.paddleWidth) / 2;
        this.accelerationFactor = 1.05;
      }
    }

    this.x += this.dx;
    this.y += this.dy;

    this.updateBonus();
  }

  drawScore() {
    this.ctx.font = "16px Arial";
    this.ctx.fillStyle = "#0095DD";
    this.ctx.fillText("Score: " + this.score, 8, 20);
  }

  drawLives() {
    this.ctx.font = "16px Arial";
    this.ctx.fillStyle = "#0095DD";
    this.ctx.fillText("Lives: " + this.lives, this.canvas.width - 65, 20);
  }

  // display the game over message
  gameOver() {
    this.gameOverNotify.style.display = "flex";
    if (
      this.leaderboard.length < 10 ||
      this.score > this.leaderboard[9].score
    ) {
      const playerName = prompt("Enter your name:");
      this.addToLeaderboard(playerName, this.score);
      localStorage.setItem("leaderboard", JSON.stringify(this.leaderboard));
    }
    this.displayLeaderboard();
    this.stopDrawing();
  }

  // add the player to the leaderboard
  addToLeaderboard(name, score) {
    if (name === null || name === "") {
      name = "Anonymous";
    }
    this.leaderboard.push({ name, score });
    this.leaderboard.sort((a, b) => b.score - a.score);
    this.leaderboard = this.leaderboard.slice(0, 10);
  }

  // display the leaderboard
  displayLeaderboard() {
    const leaderboardList = document.querySelector(".leaderboard");
    leaderboardList.innerHTML = this.leaderboard
      .map((entry) => {
        return ` <tr>
      <th scope="row">${this.leaderboard.indexOf(entry) + 1}</th>
      <td>${entry.name}</td>
      <td>${entry.score}</td> 
      <tr>`;
      })
      .join("")
      .slice(10);
  }

  //get random color
  getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  createBonus(x, y) {
    const types = ["extendPaddle", "shrinkPaddle", "extraLife"];
    const type = types[Math.floor(Math.random() * types.length)];
    this.bonuses.push(new Bonus(x, y, type));
  }

  drawBonus() {
    this.bonuses.forEach((bonus) => bonus.draw(this.ctx));
  }

  updateBonus() {
    this.bonuses.forEach((bonus) => bonus.update());
    this.bonuses = this.bonuses.filter((bonus) => bonus.y < this.canvas.height);
  }

  checkBonusCollision() {
    for (let i = 0; i < this.bonuses.length; i++) {
      let bonus = this.bonuses[i];
      if (
        bonus.x + bonus.radius > this.paddleX &&
        bonus.x - bonus.radius < this.paddleX + this.paddleWidth &&
        bonus.y + bonus.radius > this.canvas.height - this.paddleHeight
      ) {
        this.applyBonus(bonus);
        this.bonuses.splice(i, 1);
      }
    }
  }

  applyBonus(bonus) {
    switch (bonus.type) {
      case "extendPaddle":
        this.paddleWidth += 20;
        break;
      case "shrinkPaddle":
        this.paddleWidth -= 20;
        break;
      case "extraLife":
        this.lives++;
        break;
    }
  }

  //function to start drawing
  startDrawing() {
    this.interval = setInterval(() => this.draw(), 5);
  }

  //function to stop drawing
  stopDrawing() {
    clearInterval(this.interval);
  }
}

export default CanvasService;
