class CanvasService {
  constructor(canvas) {
    // Initialization of variables

    // Canvas
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    // Ball
    this.ballRadius = 12;
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height - 30;
    this.dx = 2;
    this.dy = -2;

    // Paddle
    this.paddleHeight = 10;
    this.paddleWidth = 85;
    this.paddleX = (this.canvas.width - this.paddleWidth) / 2;

    // Bricks
    this.brickRowCount = 4;
    this.brickColumnCount = 13;
    this.brickWidth = this.canvas.width / (this.brickColumnCount + 1) + 5;
    this.brickHeight = 20;
    this.brickPadding = 5;
    this.brickOffsetTop = 30;
    this.brickOffsetLeft = 5;


    this.accelerationFactor = 1.05;

    // Score
    this.score = 0;
    // Lives
    this.lives = 3;

    // Création du tableau de briques
    this.createBricks();

    this.gameOverNotify = document.querySelector(".game-over-notify");
    this.gameOverNotify.addEventListener("click", function () {
      document.location.reload();
    });

    this.interval = null;

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
    this.ctx.fillStyle = this.ballColor || "#0095DD"; // Use the new color or default color
    this.ctx.fill();
    this.ctx.closePath();
  }

  // function to draw the paddle
  drawPaddle() {
    this.ctx.beginPath();
    const paddleY = this.canvas.height - this.paddleHeight - 10;
    this.ctx.rect(
      this.paddleX,
      paddleY,
      this.paddleWidth,
      this.paddleHeight
    );
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

  createBricks() {
    this.bricks = [];
    for (let c = 0; c < this.brickColumnCount; c++) {
      this.bricks[c] = [];
      for (let r = 0; r < this.brickRowCount; r++) {
        const brickX =
          c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
        const brickY =
          r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
        this.bricks[c][r] = { x: brickX, y: brickY, status: 1 };
      }
    }
  }

  //function to draw the bricks
  drawBricks() {
    for (let r = 0; r < this.brickRowCount; r++) {
      for (let c = 0; c < this.brickColumnCount; c++) {
        if (this.bricks[c][r].status == 1) {
          let brickX =
            c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
          let brickY =
            r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
          this.bricks[c][r].x = brickX;
          this.bricks[c][r].y = brickY;
          this.ctx.beginPath();
          this.ctx.rect(brickX, brickY, this.brickWidth, this.brickHeight);
          this.ctx.fillStyle = "#0095DD";
          this.ctx.fill();
          this.ctx.closePath();
        }
      }
    }
  }

  collisionDetection() {
    for (let c = 0; c < this.brickColumnCount; c++) {
      for (let r = 0; r < this.brickRowCount; r++) {
        let b = this.bricks[c][r];
        if (b.status == 1) {
          if (
            this.x > b.x &&
            this.x < b.x + this.brickWidth &&
            this.y > b.y &&
            this.y < b.y + this.brickHeight
          ) {
            if (this.y - this.dy <= b.y  ||  this.y - this.dy >= b.y + this.brickHeight) {
              this.dy = -this.dy;
            } else {
            this.dx = -this.dx;
            }
            b.status = 0;
            this.score++;
            this.ballColor = this.getRandomColor();
            if (this.score == this.brickRowCount * this.brickColumnCount) {
              alert("Vous avez gagné !");
              this.stopDrawing();
              return;
            }
          }
        }
      }
    }
  }

  //function to draw the game
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBricks();
    this.drawBall();
    this.drawPaddle();
    this.drawScore();
    this.drawLives();
    this.collisionDetection();

    // Manage the ball's movements
    if (
      this.x + this.dx > this.canvas.width - this.ballRadius ||
      this.x + this.dx < this.ballRadius
    ) {
      this.dx = -this.dx;
    }
    // Gestion des rebonds sur le mur supérieur
    if (this.y + this.dy < this.ballRadius) {
      this.dy = -this.dy;
    }

    // Manage the ball's movements on the paddle
    if (
      this.y + this.dy >
      this.canvas.height - this.ballRadius - this.paddleHeight
    ) {
      if (this.x > this.paddleX && this.x < this.paddleX + this.paddleWidth) {
        let hitPosition = (this.x - this.paddleX) / this.paddleWidth;
        let angle = (hitPosition * Math.PI) / 4 - Math.PI / 8;
        this.dx = 2 * Math.sin(angle);
        this.dy = -2 * Math.cos(angle);
        this.accelerationFactor += 0.1;
        this.dx *= this.accelerationFactor;
        this.dy *= this.accelerationFactor;
      }
    }

    // Vérifier si la balle touche le bas du canvas
    if (this.y + this.dy > this.canvas.height - this.ballRadius) {
      this.lives--;
      if (!this.lives) {
        this.gameOver();
        return;
      } else {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height - 30;
        this.dx = 2;
        this.dy = -2;
        this.paddleX = (this.canvas.width - this.paddleWidth) / 2;
      }
    }

    this.x += this.dx;
    this.y += this.dy;
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

  gameOver() {
    this.gameOverNotify.style.display = "flex";
    const playerName = prompt("Enter your name:");
    this.addToLeaderboard(playerName, this.score);
    localStorage.setItem("leaderboard", JSON.stringify(this.leaderboard));
    this.displayLeaderboard();
    this.stopDrawing();
  }

  addToLeaderboard(name, score) {
    if (name === null || name === "") {
      name = "Anonymous";
    }
    this.leaderboard.push({ name, score });
    this.leaderboard.sort((a, b) => b.score - a.score);
    this.leaderboard = this.leaderboard.slice(0, 10);
  }

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
      .slice(10)
      ;
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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
