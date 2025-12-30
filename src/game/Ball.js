export default class Ball {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.size = 12; // Radius
        this.reset();
    }

    reset() {
        this.position = {
            x: this.gameWidth / 2,
            y: this.gameHeight - 60,
        };
        this.speed = {
            x: 6,
            y: -6,
        };
        // Randomize initial x direction slightly
        if (Math.random() > 0.5) this.speed.x *= -1;
        this.active = false; // Waits for player to launch
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = '#f8fafc';
        ctx.shadowColor = '#f8fafc';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
        ctx.closePath();
    }

    update(deltaTime) {
        if (!this.active) return;

        this.position.x += this.speed.x;
        this.position.y += this.speed.y;

        // Wall Collision (Left/Right)
        if (this.position.x + this.size > this.gameWidth || this.position.x - this.size < 0) {
            this.speed.x = -this.speed.x;
        }

        // Wall Collision (Top)
        if (this.position.y - this.size < 0) {
            this.speed.y = -this.speed.y;
        }

        // Bottom collision is game over condition, handled in Game class
    }
}
