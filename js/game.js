const gameState = {
    score: 0,
    highScore: localStorage.getItem('snakeHighScore') || 0,
    isPlaying: false,
    isPaused: false,
    snake: [],
    food: null,
    direction: 'right',
    nextDirection: 'right',
    gridSize: 20,
    speed: 150,
    gameLoop: null
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const currentScoreEl = document.getElementById('currentScore');
const highScoreEl = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const gameOverlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');

const canvasWidth = 400;
const canvasHeight = 400;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

function initGame() {
    highScoreEl.textContent = gameState.highScore;
    
    const startX = Math.floor(canvasWidth / gameState.gridSize / 2);
    const startY = Math.floor(canvasHeight / gameState.gridSize / 2);
    
    gameState.snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
    ];
    
    gameState.direction = 'right';
    gameState.nextDirection = 'right';
    gameState.score = 0;
    gameState.isPlaying = false;
    gameState.isPaused = false;
    
    currentScoreEl.textContent = gameState.score;
    
    generateFood();
    draw();
}

function generateFood() {
    let foodX, foodY;
    let isOnSnake;
    
    do {
        isOnSnake = false;
        foodX = Math.floor(Math.random() * (canvasWidth / gameState.gridSize));
        foodY = Math.floor(Math.random() * (canvasHeight / gameState.gridSize));
        
        for (let segment of gameState.snake) {
            if (segment.x === foodX && segment.y === foodY) {
                isOnSnake = true;
                break;
            }
        }
    } while (isOnSnake);
    
    gameState.food = { x: foodX, y: foodY };
}

function draw() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= canvasWidth; i += gameState.gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvasHeight);
        ctx.stroke();
    }
    for (let i = 0; i <= canvasHeight; i += gameState.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvasWidth, i);
        ctx.stroke();
    }
    
    gameState.snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = '#22c55e';
        } else {
            const greenValue = Math.max(74, 222 - index * 10);
            ctx.fillStyle = `rgb(34, ${greenValue}, 94)`;
        }
        
        ctx.fillRect(
            segment.x * gameState.gridSize + 1,
            segment.y * gameState.gridSize + 1,
            gameState.gridSize - 2,
            gameState.gridSize - 2
        );
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(
            segment.x * gameState.gridSize + 2,
            segment.y * gameState.gridSize + 2,
            gameState.gridSize - 8,
            gameState.gridSize - 8
        );
    });
    
    if (gameState.food) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(
            gameState.food.x * gameState.gridSize + gameState.gridSize / 2,
            gameState.food.y * gameState.gridSize + gameState.gridSize / 2,
            gameState.gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(
            gameState.food.x * gameState.gridSize + gameState.gridSize / 2 - 3,
            gameState.food.y * gameState.gridSize + gameState.gridSize / 2 - 3,
            gameState.gridSize / 4,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

function update() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    gameState.direction = gameState.nextDirection;
    
    const head = { ...gameState.snake[0] };
    
    switch (gameState.direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    gameState.snake.unshift(head);
    
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        gameState.score += 10;
        currentScoreEl.textContent = gameState.score;
        
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            highScoreEl.textContent = gameState.highScore;
            localStorage.setItem('snakeHighScore', gameState.highScore);
        }
        
        generateFood();
    } else {
        gameState.snake.pop();
    }
    
    draw();
}

function checkCollision(head) {
    if (head.x < 0 || 
        head.x >= canvasWidth / gameState.gridSize ||
        head.y < 0 || 
        head.y >= canvasHeight / gameState.gridSize) {
        return true;
    }
    
    for (let i = 0; i < gameState.snake.length; i++) {
        if (head.x === gameState.snake[i].x && head.y === gameState.snake[i].y) {
            return true;
        }
    }
    
    return false;
}

function startGame() {
    if (gameState.isPlaying && !gameState.isPaused) return;
    
    if (gameState.isPaused) {
        gameState.isPaused = false;
        pauseBtn.textContent = '暂停';
        hideOverlay();
    } else {
        resetGame();
        gameState.isPlaying = true;
    }
    
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    gameState.gameLoop = setInterval(update, gameState.speed);
}

function pauseGame() {
    if (!gameState.isPlaying) return;
    
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        pauseBtn.textContent = '继续';
        showOverlay('游戏暂停', '点击继续按钮或按空格键');
    } else {
        pauseBtn.textContent = '暂停';
        hideOverlay();
    }
}

function resetGame() {
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
    }
    
    initGame();
    hideOverlay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '暂停';
}

function gameOver() {
    gameState.isPlaying = false;
    clearInterval(gameState.gameLoop);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    showOverlay('游戏结束', `得分: ${gameState.score}`);
}

function showOverlay(title, message) {
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    gameOverlay.classList.remove('hidden');
}

function hideOverlay() {
    gameOverlay.classList.add('hidden');
}

function handleKeyPress(e) {
    const key = e.key.toLowerCase();
    
    if (key === ' ' || key === 'spacebar') {
        e.preventDefault();
        if (!gameState.isPlaying) {
            startGame();
        } else {
            pauseGame();
        }
        return;
    }
    
    if (key === 'r') {
        resetGame();
        return;
    }
    
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    switch (key) {
        case 'arrowup':
        case 'w':
            if (gameState.direction !== 'down') {
                gameState.nextDirection = 'up';
            }
            break;
        case 'arrowdown':
        case 's':
            if (gameState.direction !== 'up') {
                gameState.nextDirection = 'down';
            }
            break;
        case 'arrowleft':
        case 'a':
            if (gameState.direction !== 'right') {
                gameState.nextDirection = 'left';
            }
            break;
        case 'arrowright':
        case 'd':
            if (gameState.direction !== 'left') {
                gameState.nextDirection = 'right';
            }
            break;
    }
}

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', resetGame);
document.addEventListener('keydown', handleKeyPress);

gameOverlay.addEventListener('click', () => {
    if (!gameState.isPlaying) {
        startGame();
    } else if (gameState.isPaused) {
        pauseGame();
    }
});

initGame();
