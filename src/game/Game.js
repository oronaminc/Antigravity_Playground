import Paddle from './Paddle.js';
import Ball from './Ball.js';
import Brick from './Brick.js';

export default class Game {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.gamestate = 'MENU'; // MENU, RUNNING, GAMEOVER, VICTORY
        this.ball = new Ball(gameWidth, gameHeight);
        this.paddle = new Paddle(gameWidth, gameHeight);
        this.bricks = [];
        this.lives = 3;
        this.score = 0;
        this.gameObjects = [];

        // Bind input
        document.addEventListener('keydown', (e) => this.handleInput(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // UI Elements
        this.scoreEl = document.getElementById('score');
        this.livesEl = document.getElementById('lives');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.victoryScreen = document.getElementById('victory-screen');
        this.finalScoreEl = document.getElementById('final-score');
        this.victoryScoreEl = document.getElementById('victory-score');

        // Buttons
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('victory-restart-btn').addEventListener('click', () => this.restart());

        // Touch Inputs
        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });

        this.buildLevel();
    }

    handleTouchStart(e) {
        if (e.cancelable) e.preventDefault();
        if (this.gamestate === 'MENU' || this.gamestate === 'GAMEOVER' || this.gamestate === 'VICTORY') {
            if (this.gamestate === 'GAMEOVER' || this.gamestate === 'VICTORY') {
                this.restart();
            } else {
                this.start();
            }
        }
    }

    handleTouchMove(e) {
        if (e.cancelable) e.preventDefault();
        if (this.gamestate === 'RUNNING') {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            const touchX = e.touches[0].clientX - rect.left;

            // Map touch X to paddle position (centering the paddle on touch)
            // Scale logic if canvas is resized via CSS
            const scaleX = this.gameWidth / rect.width;
            const gameX = touchX * scaleX;

            this.paddle.position.x = gameX - this.paddle.width / 2;

            // Clamp
            if (this.paddle.position.x < 0) this.paddle.position.x = 0;
            if (this.paddle.position.x + this.paddle.width > this.gameWidth)
                this.paddle.position.x = this.gameWidth - this.paddle.width;
        }
    }

    start() {
        if (this.gamestate !== 'MENU' && this.gamestate !== 'GAMEOVER' && this.gamestate !== 'VICTORY') return;

        this.gamestate = 'RUNNING';
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.victoryScreen.classList.add('hidden');
        this.ball.active = true;
    }

    restart() {
        this.lives = 3;
        this.score = 0;
        this.livesEl.innerText = this.lives;
        this.scoreEl.innerText = '0000';
        this.gamestate = 'MENU';
        this.ball.reset();
        this.paddle = new Paddle(this.gameWidth, this.gameHeight); // Reset paddle pos
        this.buildLevel();
        this.startScreen.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.victoryScreen.classList.add('hidden');
    }

    buildLevel() {
        this.bricks = [];
        const rows = 3;
        const cols = 10; // 800 width / 60 = ~13, but let's do 10 centered-ish?
        // Actually brick width 60, 10 bricks = 600. spacing needed.
        // 800 width. 10 bricks * 60 + 11 gaps.
        // Let's just fill a grid.

        let padding = 15;
        let offsetTop = 80;
        let offsetLeft = 35; // (800 - (10 * 60 + 9 * 15)) / 2 approx ... 

        // Recalculate robustly
        // width 60, gap 10. Total 70 per brick. 10 * 70 = 700. leaving 100 margin. 50 left.
        offsetLeft = 50;
        let gap = 13;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < 10; c++) {
                let x = offsetLeft + c * (60 + gap);
                let y = offsetTop + r * (24 + gap);
                this.bricks.push(new Brick(this, { x, y }));
            }
        }
    }

    handleInput(event) {
        if (this.gamestate === 'MENU') {
            if (event.code === 'Space') this.start();
            return;
        }

        if (this.gamestate === 'RUNNING') {
            switch (event.code) {
                case 'ArrowLeft':
                    this.paddle.moveLeft();
                    break;
                case 'ArrowRight':
                    this.paddle.moveRight();
                    break;
            }
        }
    }

    handleKeyUp(event) {
        switch (event.code) {
            case 'ArrowLeft':
                if (this.paddle.speed < 0) this.paddle.stop();
                break;
            case 'ArrowRight':
                if (this.paddle.speed > 0) this.paddle.stop();
                break;
        }
    }

    update(deltaTime) {
        if (this.gamestate !== 'RUNNING') return;

        this.paddle.update(deltaTime);
        this.ball.update(deltaTime);

        // Collision detection
        this.detectCollision();

        // Check lives
        if (this.ball.position.y > this.gameHeight) {
            this.lives--;
            this.livesEl.innerText = this.lives;
            if (this.lives === 0) {
                this.gamestate = 'GAMEOVER';
                this.finalScoreEl.innerText = this.score;
                this.gameOverScreen.classList.remove('hidden');
            } else {
                this.ball.reset();
                this.ball.active = true; // Auto launch or wait? Let's auto launch for now or wait
                // Better UX: Wait for space or delay.
                // For simplicity, let's just reset ball and keep playing
            }
        }

        if (this.bricks.length === 0) {
            this.gamestate = 'VICTORY';
            this.victoryScoreEl.innerText = this.score;
            this.victoryScreen.classList.remove('hidden');
        }
    }

    detectCollision() {
        // Ball with Paddle
        // Simple AABB
        if (
            this.ball.position.y + this.ball.size >= this.paddle.position.y &&
            this.ball.position.x >= this.paddle.position.x &&
            this.ball.position.x <= this.paddle.position.x + this.paddle.width
        ) {
            this.ball.speed.y = -this.ball.speed.y;
            this.ball.position.y = this.paddle.position.y - this.ball.size;

            // Add some english based on where it hit
            // center of paddle
            let centerPaddle = this.paddle.position.x + this.paddle.width / 2;
            let hitPoint = this.ball.position.x - centerPaddle;
            // Normalize
            hitPoint = hitPoint / (this.paddle.width / 2);

            // Modify X speed
            this.ball.speed.x += hitPoint * 2;
        }

        // Ball with Bricks
        this.bricks = this.bricks.filter(brick => {
            if (
                this.ball.position.y - this.ball.size <= brick.position.y + brick.height &&
                this.ball.position.y + this.ball.size >= brick.position.y &&
                this.ball.position.x + this.ball.size >= brick.position.x &&
                this.ball.position.x - this.ball.size <= brick.position.x + brick.width
            ) {
                this.ball.speed.y = -this.ball.speed.y;
                this.score += 100;
                this.scoreEl.innerText = this.score.toString().padStart(4, '0');
                return false;
            }
            return true;
        });
    }

    draw(ctx) {
        this.paddle.draw(ctx);
        this.ball.draw(ctx);
        this.bricks.forEach(brick => brick.draw(ctx));
    }
}
