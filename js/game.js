// 游戏配置
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 网格大小
const gridSize = 20;
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

// 游戏状态
let gameState = {
    running: false,
    paused: false,
    score1: 0,
    score2: 0,
    winner: null
};

// 蛇的数据结构
let snake1 = {
    body: [{ x: 5, y: Math.floor(gridHeight / 2) }],
    direction: 'right',
    nextDirection: 'right',
    color: '#4ade80'
};

let snake2 = {
    body: [{ x: gridWidth - 6, y: Math.floor(gridHeight / 2) }],
    direction: 'left',
    nextDirection: 'left',
    color: '#f87171'
};

// 食物
let food = {
    x: Math.floor(gridWidth / 2),
    y: Math.floor(gridHeight / 2),
    color: '#fbbf24'
};

// 游戏循环
let gameLoop = null;
const gameSpeed = 100; // 毫秒

// DOM 元素
const score1El = document.getElementById('score1');
const score2El = document.getElementById('score2');
const gameStatusEl = document.getElementById('gameStatus');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

// 初始化游戏
function initGame() {
    snake1 = {
        body: [{ x: 5, y: Math.floor(gridHeight / 2) }],
        direction: 'right',
        nextDirection: 'right',
        color: '#4ade80'
    };

    snake2 = {
        body: [{ x: gridWidth - 6, y: Math.floor(gridHeight / 2) }],
        direction: 'left',
        nextDirection: 'left',
        color: '#f87171'
    };

    gameState = {
        running: false,
        paused: false,
        score1: 0,
        score2: 0,
        winner: null
    };

    updateScores();
    generateFood();
    draw();
    gameStatusEl.textContent = '按开始游戏来挑战！';
}

// 生成食物
function generateFood() {
    let validPosition = false;
    while (!validPosition) {
        food.x = Math.floor(Math.random() * gridWidth);
        food.y = Math.floor(Math.random() * gridHeight);
        
        validPosition = true;
        
        // 检查食物是否在蛇身上
        for (let segment of snake1.body) {
            if (segment.x === food.x && segment.y === food.y) {
                validPosition = false;
                break;
            }
        }
        
        if (validPosition) {
            for (let segment of snake2.body) {
                if (segment.x === food.x && segment.y === food.y) {
                    validPosition = false;
                    break;
                }
            }
        }
    }
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = '#112240';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // 绘制食物
    drawSegment(food.x, food.y, food.color, true);
    
    // 绘制蛇1
    snake1.body.forEach((segment, index) => {
        drawSegment(segment.x, segment.y, snake1.color, index === 0);
    });
    
    // 绘制蛇2
    snake2.body.forEach((segment, index) => {
        drawSegment(segment.x, segment.y, snake2.color, index === 0);
    });
}

// 绘制单个格子
function drawSegment(x, y, color, isHead) {
    const padding = 1;
    ctx.fillStyle = color;
    ctx.fillRect(
        x * gridSize + padding,
        y * gridSize + padding,
        gridSize - padding * 2,
        gridSize - padding * 2
    );
    
    // 蛇头添加眼睛
    if (isHead) {
        ctx.fillStyle = '#000000';
        const eyeSize = 3;
        const eyeOffset = 5;
        ctx.fillRect(
            x * gridSize + eyeOffset,
            y * gridSize + eyeOffset,
            eyeSize,
            eyeSize
        );
        ctx.fillRect(
            x * gridSize + gridSize - eyeOffset - eyeSize,
            y * gridSize + eyeOffset,
            eyeSize,
            eyeSize
        );
    }
}

// 移动蛇
function moveSnake(snake) {
    snake.direction = snake.nextDirection;
    const head = { ...snake.body[0] };
    
    switch (snake.direction) {
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
    
    snake.body.unshift(head);
    return head;
}

// 检查碰撞
function checkCollision(snake, otherSnake) {
    const head = snake.body[0];
    
    // 撞墙
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        return true;
    }
    
    // 撞自己
    for (let i = 1; i < snake.body.length; i++) {
        if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
            return true;
        }
    }
    
    // 撞对方
    for (let segment of otherSnake.body) {
        if (head.x === segment.x && head.y === segment.y) {
            return true;
        }
    }
    
    return false;
}

// 检查吃食物
function checkEatFood(snake, player) {
    const head = snake.body[0];
    if (head.x === food.x && head.y === food.y) {
        if (player === 1) {
            gameState.score1 += 10;
        } else {
            gameState.score2 += 10;
        }
        updateScores();
        generateFood();
        return true;
    }
    return false;
}

// 更新分数显示
function updateScores() {
    score1El.textContent = gameState.score1;
    score2El.textContent = gameState.score2;
}

// 游戏更新
function update() {
    if (!gameState.running || gameState.paused) return;
    
    // 移动蛇
    const head1 = moveSnake(snake1);
    const head2 = moveSnake(snake2);
    
    // 检查吃食物
    const ate1 = checkEatFood(snake1, 1);
    const ate2 = checkEatFood(snake2, 2);
    
    // 没吃到食物就移除尾部
    if (!ate1) {
        snake1.body.pop();
    }
    if (!ate2) {
        snake2.body.pop();
    }
    
    // 检查碰撞
    const collision1 = checkCollision(snake1, snake2);
    const collision2 = checkCollision(snake2, snake1);
    
    if (collision1 || collision2) {
        gameState.running = false;
        clearInterval(gameLoop);
        
        if (collision1 && collision2) {
            gameState.winner = 'draw';
            gameStatusEl.textContent = '平局！';
        } else if (collision1) {
            gameState.winner = 2;
            gameStatusEl.textContent = '🎉 玩家 2 获胜！';
        } else {
            gameState.winner = 1;
            gameStatusEl.textContent = '🎉 玩家 1 获胜！';
        }
    }
    
    draw();
}

// 开始游戏
function startGame() {
    if (gameState.running) return;
    
    initGame();
    gameState.running = true;
    gameStatusEl.textContent = '游戏进行中...';
    gameLoop = setInterval(update, gameSpeed);
}

// 暂停/继续游戏
function togglePause() {
    if (!gameState.running) return;
    
    gameState.paused = !gameState.paused;
    
    if (gameState.paused) {
        gameStatusEl.textContent = '游戏已暂停';
        pauseBtn.textContent = '继续';
    } else {
        gameStatusEl.textContent = '游戏进行中...';
        pauseBtn.textContent = '暂停';
    }
}

// 重新开始游戏
function restartGame() {
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    initGame();
}

// 键盘事件处理
document.addEventListener('keydown', (e) => {
    // 玩家1控制: W/A/S/D
    switch(e.key.toLowerCase()) {
        case 'w':
            if (snake1.direction !== 'down') {
                snake1.nextDirection = 'up';
            }
            break;
        case 's':
            if (snake1.direction !== 'up') {
                snake1.nextDirection = 'down';
            }
            break;
        case 'a':
            if (snake1.direction !== 'right') {
                snake1.nextDirection = 'left';
            }
            break;
        case 'd':
            if (snake1.direction !== 'left') {
                snake1.nextDirection = 'right';
            }
            break;
    }
    
    // 玩家2控制: 方向键
    switch(e.key) {
        case 'ArrowUp':
            e.preventDefault();
            if (snake2.direction !== 'down') {
                snake2.nextDirection = 'up';
            }
            break;
        case 'ArrowDown':
            e.preventDefault();
            if (snake2.direction !== 'up') {
                snake2.nextDirection = 'down';
            }
            break;
        case 'ArrowLeft':
            e.preventDefault();
            if (snake2.direction !== 'right') {
                snake2.nextDirection = 'left';
            }
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (snake2.direction !== 'left') {
                snake2.nextDirection = 'right';
            }
            break;
        case ' ':
            e.preventDefault();
            if (gameState.running) {
                togglePause();
            }
            break;
    }
});

// 按钮事件
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);

// 初始化
initGame();
