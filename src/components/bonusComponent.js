// src/Components/Bonus.js
class Bonus {
    constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.type = type;
      this.radius = 10;
      this.dy = 5; 
    }
  
    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x + this.radius, this.y);
        for (let i = 1; i <= 5; i++) {
          ctx.lineTo(
            this.x + this.radius * Math.cos((i * 2 * Math.PI) / 5),
            this.y + this.radius * Math.sin((i * 2 * Math.PI) / 5)
          );
          ctx.lineTo(
            this.x + (this.radius / 2) * Math.cos(((i + 0.5) * 2 * Math.PI) / 5),
            this.y + (this.radius / 2) * Math.sin(((i + 0.5) * 2 * Math.PI) / 5)
          );
        }
        ctx.closePath();
        ctx.fillStyle = this.getColor();
        ctx.fill();
    }
  
    getColor() {
      switch (this.type) {
        case 'extendPaddle':
          return 'green';
        case 'shrinkPaddle':
          return 'red';
        case 'extraLife':
          return 'blue';
        default:
          return 'yellow';
      }
    }
  
    update() {
      this.y += this.dy;
    }
  }
  
  export default Bonus;
  