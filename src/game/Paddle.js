export default class Paddle {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.width = 120;
        this.height = 20;

        this.maxSpeed = 8;
        this.speed = 0;

        this.position = {
            x: gameWidth / 2 - this.width / 2,
            y: gameHeight - this.height - 30, // Offset from bottom
        };
    }

    moveLeft() {
        this.speed = -this.maxSpeed;
    }

    moveRight() {
        this.speed = this.maxSpeed;
    }

    stop() {
        this.speed = 0;
    }

    draw(ctx) {
        // Glassmorphism paddle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;

        // Rounded rect
        const radius = 10;
        ctx.beginPath();
        ctx.moveTo(this.position.x + radius, this.position.y);
        ctx.lineTo(this.position.x + this.width - radius, this.position.y);
        ctx.quadraticCurveTo(this.position.x + this.width, this.position.y, this.position.x + this.width, this.position.y + radius);
        ctx.lineTo(this.position.x + this.width, this.position.y + this.height - radius);
        ctx.quadraticCurveTo(this.position.x + this.width, this.position.y + this.height, this.position.x + this.width - radius, this.position.y + this.height);
        ctx.lineTo(this.position.x + radius, this.position.y + this.height);
        ctx.quadraticCurveTo(this.position.x, this.position.y + this.height, this.position.x, this.position.y + this.height - radius);
        ctx.lineTo(this.position.x, this.position.y + radius);
        ctx.quadraticCurveTo(this.position.x, this.position.y, this.position.x + radius, this.position.y);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

        // Glow
        ctx.shadowColor = '#6366f1';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    update(deltaTime) {
        this.position.x += this.speed;

        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x + this.width > this.gameWidth)
            this.position.x = this.gameWidth - this.width;
    }
}
