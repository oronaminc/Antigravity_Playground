export default class Brick {
    constructor(game, position) {
        this.game = game;
        this.position = position;
        this.width = 60;
        this.height = 24;
        this.markedForDeletion = false;
    }

    update() { }

    draw(ctx) {
        // Gradient Brick
        let gradient = ctx.createLinearGradient(
            this.position.x, this.position.y,
            this.position.x + this.width, this.position.y + this.height
        );
        gradient.addColorStop(0, '#ec4899');
        gradient.addColorStop(1, '#8b5cf6');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Rounded corners
        const radius = 4;

        ctx.roundRect(this.position.x, this.position.y, this.width, this.height, radius);
        ctx.fill();

        // Top highlight for 3D effect
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height / 2);

    }
}
