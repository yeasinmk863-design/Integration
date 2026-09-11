// Canvas and Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

const player = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

const computer = {
    x: canvas.width - paddleWidth - 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    size: ballSize,
    speed: 5
};

// Game State
let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Input Handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse movement for player paddle
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Only update if mouse is over canvas
    if (mouseY >= 0 && mouseY <= canvas.height) {
        player.y = mouseY - player.height / 2;
    }
});

// Button Controls
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        document.getElementById('status').textContent = '🎮 Game is Running!';
        gameLoop();
    }
}

function resetGame() {
    gameRunning = false;
    playerScore = 0;
    computerScore = 0;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 5;
    ball.dy = 5;
    player.y = canvas.height / 2 - paddleHeight / 2;
    computer.y = canvas.height / 2 - paddleHeight / 2;
    updateScore();
    document.getElementById('status').textContent = 'Game Reset! Click Start Game to begin';
    draw();
}

function updatePlayerPaddle() {
    // Arrow keys control
    if (keys['ArrowUp']) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown']) {
        player.y += player.speed;
    }

    // Boundary checking
    if (player.y < 0) {
        player.y = 0;
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

function updateComputerPaddle() {
    const computerCenter = computer.y + computer.height / 2;
    
    // AI logic: follow the ball
    if (computerCenter < ball.y - 35) {
        computer.y += computer.speed;
    } else if (computerCenter > ball.y + 35) {
        computer.y -= computer.speed;
    }

    // Boundary checking
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
    }

    // Ball collision with paddles
    // Player paddle collision
    if (
        ball.x - ball.size < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = Math.abs(ball.dx) * 1.05; // Increase speed slightly
        ball.x = player.x + player.width + ball.size;
        
        // Add spin based on where ball hits paddle
        const collidePoint = ball.y - (player.y + player.height / 2);
        ball.dy = collidePoint * 0.1;
    }

    // Computer paddle collision
    if (
        ball.x + ball.size > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -Math.abs(ball.dx) * 1.05; // Increase speed slightly
        ball.x = computer.x - ball.size;
        
        // Add spin based on where ball hits paddle
        const collidePoint = ball.y - (computer.y + computer.height / 2);
        ball.dy = collidePoint * 0.1;
    }

    // Ball out of bounds (left side)
    if (ball.x < -ball.size) {
        computerScore++;
        updateScore();
        resetBall();
    }

    // Ball out of bounds (right side)
    if (ball.x > canvas.width + ball.size) {
        playerScore++;
        updateScore();
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 5;
}

function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw player paddle
    ctx.fillStyle = '#667eea';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowColor = 'rgba(102, 126, 234, 0.8)';
    ctx.shadowBlur = 15;

    // Draw computer paddle
    ctx.fillStyle = '#f5576c';
    ctx.fillRect(computer.x, computer.y, computer.width, computer.height);
    ctx.shadowColor = 'rgba(245, 87, 108, 0.8)';
    ctx.shadowBlur = 15;

    // Draw ball
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'transparent';

    // Reset shadow
    ctx.shadowColor = 'transparent';
}

function update() {
    if (gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }
}

function gameLoop() {
    update();
    draw();
    
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Initialize
resetGame();
