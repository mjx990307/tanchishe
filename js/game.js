/**
 * 双蛇对战游戏 - 游戏逻辑主文件
 * 
 * 这是一个双人贪吃蛇对战游戏，包含：
 * - 两条独立控制的蛇
 * - 实时分数系统
 * - 碰撞检测（墙壁、自己、对方）
 * - 暂停/继续功能
 */

// 获取游戏画布和2D绘图上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏网格配置
const gridSize = 20; // 每个格子的像素大小
const gridWidth = canvas.width / gridSize; // 网格宽度（格子数）
const gridHeight = canvas.height / gridSize; // 网格高度（格子数）

/**
 * 游戏状态对象
 * 包含游戏的运行状态、分数和获胜者信息
 */
let gameState = {
    running: false, // 游戏是否正在运行
    paused: false, // 游戏是否暂停
    score1: 0, // 玩家1的分数
    score2: 0, // 玩家2的分数
    winner: null // 获胜者（1、2 或 'draw'）
};

/**
 * 蛇1的数据结构（玩家1 - 绿色）
 */
let snake1 = {
    body: [{ x: 5, y: Math.floor(gridHeight / 2) }], // 蛇身体的坐标数组，第一个元素是蛇头
    direction: 'right', // 当前移动方向
    nextDirection: 'right', // 下一步的移动方向（防止快速按键导致蛇自己撞到自己）
    color: '#4ade80' // 蛇的颜色
};

/**
 * 蛇2的数据结构（玩家2 - 红色）
 */
let snake2 = {
    body: [{ x: gridWidth - 6, y: Math.floor(gridHeight / 2) }],
    direction: 'left',
    nextDirection: 'left',
    color: '#f87171'
};

/**
 * 食物的数据结构
 */
let food = {
    x: Math.floor(gridWidth / 2), // 食物的x坐标
    y: Math.floor(gridHeight / 2), // 食物的y坐标
    color: '#fbbf24' // 食物的颜色（金色）
};

// 游戏循环计时器
let gameLoop = null;
const gameSpeed = 100; // 游戏更新间隔，单位毫秒（100ms = 10帧/秒）

// 获取DOM元素引用，用于更新UI
const score1El = document.getElementById('score1'); // 玩家1分数显示
const score2El = document.getElementById('score2'); // 玩家2分数显示
const gameStatusEl = document.getElementById('gameStatus'); // 游戏状态显示
const startBtn = document.getElementById('startBtn'); // 开始按钮
const pauseBtn = document.getElementById('pauseBtn'); // 暂停按钮
const restartBtn = document.getElementById('restartBtn'); // 重新开始按钮

/**
 * 初始化游戏
 * 重置两条蛇的位置、方向、分数，并生成新的食物
 */
function initGame() {
    // 重置蛇1（玩家1）
    snake1 = {
        body: [{ x: 5, y: Math.floor(gridHeight / 2) }],
        direction: 'right',
        nextDirection: 'right',
        color: '#4ade80'
    };

    // 重置蛇2（玩家2）
    snake2 = {
        body: [{ x: gridWidth - 6, y: Math.floor(gridHeight / 2) }],
        direction: 'left',
        nextDirection: 'left',
        color: '#f87171'
    };

    // 重置游戏状态
    gameState = {
        running: false,
        paused: false,
        score1: 0,
        score2: 0,
        winner: null
    };

    // 更新UI显示
    updateScores();
    generateFood();
    draw();
    gameStatusEl.textContent = '按开始游戏来挑战！';
}

/**
 * 生成新的食物位置
 * 确保食物不会出现在任何一条蛇的身体上
 */
function generateFood() {
    let validPosition = false; // 标记位置是否有效
    
    // 循环直到找到有效的位置
    while (!validPosition) {
        // 随机生成食物坐标
        food.x = Math.floor(Math.random() * gridWidth);
        food.y = Math.floor(Math.random() * gridHeight);
        
        // 假设位置有效
        validPosition = true;
        
        // 检查食物是否在蛇1身上
        for (let segment of snake1.body) {
            if (segment.x === food.x && segment.y === food.y) {
                validPosition = false;
                break;
            }
        }
        
        // 如果位置仍然有效，继续检查蛇2
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

/**
 * 绘制整个游戏画面
 * 包括：清空画布、绘制网格、绘制食物、绘制两条蛇
 */
function draw() {
    // 清空画布，填充背景色
    ctx.fillStyle = '#112240';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格线（参考线）
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // 绘制垂直网格线
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平网格线
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // 绘制食物
    drawFood(food.x, food.y, food.color);
    
    // 绘制蛇1的身体
    snake1.body.forEach((segment, index) => {
        drawSnakeSegment(segment.x, segment.y, snake1, index);
    });
    
    // 绘制蛇2的身体
    snake2.body.forEach((segment, index) => {
        drawSnakeSegment(segment.x, segment.y, snake2, index);
    });
}

/**
 * 绘制单个食物格子（圆形糖果风格）
 * @param {number} x - 格子的x坐标（网格坐标）
 * @param {number} y - 格子的y坐标（网格坐标）
 * @param {string} color - 格子的颜色
 */
function drawFood(x, y, color) {
    const cx = x * gridSize + gridSize / 2;
    const cy = y * gridSize + gridSize / 2;
    const radius = gridSize * 0.38;

    // 食物主体
    const foodGradient = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, radius);
    foodGradient.addColorStop(0, '#fde68a');
    foodGradient.addColorStop(1, color);
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 4, 3, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * 绘制蛇的单个身体段（带圆角和渐变）
 * @param {number} x - 格子的x坐标（网格坐标）
 * @param {number} y - 格子的y坐标（网格坐标）
 * @param {object} snake - 蛇对象
 * @param {number} index - 当前段的索引（0为蛇头）
 */
function drawSnakeSegment(x, y, snake, index) {
    const isHead = index === 0;
    const padding = isHead ? 1 : 2;
    const segmentX = x * gridSize + padding;
    const segmentY = y * gridSize + padding;
    const segmentSize = gridSize - padding * 2;
    const radius = isHead ? 6 : 5;

    // 圆角蛇身
    ctx.beginPath();
    ctx.roundRect(segmentX, segmentY, segmentSize, segmentSize, radius);

    // 渐变颜色
    const gradient = ctx.createLinearGradient(segmentX, segmentY, segmentX + segmentSize, segmentY + segmentSize);
    gradient.addColorStop(0, '#ffffff66');
    gradient.addColorStop(0.28, snake.color);
    gradient.addColorStop(1, '#00000044');
    ctx.fillStyle = gradient;
    ctx.fill();

    // 身体鳞片纹理
    if (!isHead) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(
            segmentX + segmentSize / 2,
            segmentY + segmentSize / 2,
            segmentSize * 0.22,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        return;
    }

    // 蛇头眼睛
    const leftEye = { x: segmentX + 5, y: segmentY + 6 };
    const rightEye = { x: segmentX + segmentSize - 5, y: segmentY + 6 };

    [leftEye, rightEye].forEach((eye) => {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(eye.x, eye.y, 2.6, 0, Math.PI * 2);
        ctx.fill();

        // 高光
        ctx.fillStyle = '#ffffffcc';
        ctx.beginPath();
        ctx.arc(eye.x - 1, eye.y - 1, 0.9, 0, Math.PI * 2);
        ctx.fill();
    });
}

/**
 * 移动蛇
 * 根据蛇的当前方向，在蛇头前添加一个新的格子，并返回新的蛇头
 * @param {object} snake - 要移动的蛇对象
 * @returns {object} 新的蛇头坐标
 */
function moveSnake(snake) {
    // 更新蛇的方向为下一步的方向
    snake.direction = snake.nextDirection;
    
    // 复制当前蛇头的坐标
    const head = { ...snake.body[0] };
    
    // 根据方向移动蛇头
    switch (snake.direction) {
        case 'up':
            head.y--; // 向上移动，y坐标减1
            break;
        case 'down':
            head.y++; // 向下移动，y坐标加1
            break;
        case 'left':
            head.x--; // 向左移动，x坐标减1
            break;
        case 'right':
            head.x++; // 向右移动，x坐标加1
            break;
    }
    
    // 将新蛇头添加到身体数组的开头
    snake.body.unshift(head);
    return head;
}

/**
 * 检查蛇是否发生碰撞
 * @param {object} snake - 要检查的蛇
 * @param {object} otherSnake - 另一条蛇（对方）
 * @returns {boolean} 是否发生碰撞
 */
function checkCollision(snake, otherSnake) {
    const head = snake.body[0]; // 获取蛇头
    
    // 检查是否撞墙
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        return true;
    }
    
    // 检查是否撞到自己的身体（从第2个格子开始检查）
    for (let i = 1; i < snake.body.length; i++) {
        if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
            return true;
        }
    }
    
    // 检查是否撞到对方的蛇
    for (let segment of otherSnake.body) {
        if (head.x === segment.x && head.y === segment.y) {
            return true;
        }
    }
    
    // 没有碰撞
    return false;
}

/**
 * 检查蛇是否吃到食物
 * @param {object} snake - 要检查的蛇
 * @param {number} player - 玩家编号（1或2）
 * @returns {boolean} 是否吃到食物
 */
function checkEatFood(snake, player) {
    const head = snake.body[0]; // 获取蛇头
    
    // 检查蛇头是否和食物位置重合
    if (head.x === food.x && head.y === food.y) {
        // 更新对应玩家的分数
        if (player === 1) {
            gameState.score1 += 10;
        } else {
            gameState.score2 += 10;
        }
        
        // 更新分数显示，生成新食物
        updateScores();
        generateFood();
        return true;
    }
    
    return false;
}

/**
 * 更新分数显示
 * 将游戏状态中的分数同步到UI上
 */
function updateScores() {
    score1El.textContent = gameState.score1;
    score2El.textContent = gameState.score2;
}

/**
 * 游戏主更新循环
 * 每一帧调用一次，负责：
 * 1. 移动两条蛇
 * 2. 检查吃食物
 * 3. 检查碰撞
 * 4. 重新绘制画面
 */
function update() {
    // 如果游戏未运行或已暂停，不执行更新
    if (!gameState.running || gameState.paused) return;
    
    // 移动两条蛇
    const head1 = moveSnake(snake1);
    const head2 = moveSnake(snake2);
    
    // 检查两条蛇是否吃到食物
    const ate1 = checkEatFood(snake1, 1);
    const ate2 = checkEatFood(snake2, 2);
    
    // 如果没吃到食物，移除蛇的尾部（保持长度不变）
    // 如果吃到食物，不移除尾部（蛇身变长）
    if (!ate1) {
        snake1.body.pop();
    }
    if (!ate2) {
        snake2.body.pop();
    }
    
    // 检查碰撞
    const collision1 = checkCollision(snake1, snake2);
    const collision2 = checkCollision(snake2, snake1);
    
    // 如果有蛇发生碰撞，游戏结束
    if (collision1 || collision2) {
        gameState.running = false;
        clearInterval(gameLoop); // 停止游戏循环
        
        // 判断获胜者
        if (collision1 && collision2) {
            // 两条蛇同时碰撞，平局
            gameState.winner = 'draw';
            gameStatusEl.textContent = '平局！';
        } else if (collision1) {
            // 蛇1碰撞，玩家2获胜
            gameState.winner = 2;
            gameStatusEl.textContent = '🎉 玩家 2 获胜！';
        } else {
            // 蛇2碰撞，玩家1获胜
            gameState.winner = 1;
            gameStatusEl.textContent = '🎉 玩家 1 获胜！';
        }
    }
    
    // 重新绘制游戏画面
    draw();
}

/**
 * 开始游戏
 */
function startGame() {
    // 如果游戏已经在运行，不重复开始
    if (gameState.running) return;
    
    // 初始化游戏
    initGame();
    gameState.running = true;
    gameStatusEl.textContent = '游戏进行中...';
    
    // 启动游戏循环
    gameLoop = setInterval(update, gameSpeed);
}

/**
 * 切换游戏暂停/继续状态
 */
function togglePause() {
    // 如果游戏未运行，不执行操作
    if (!gameState.running) return;
    
    // 切换暂停状态
    gameState.paused = !gameState.paused;
    
    // 更新UI显示
    if (gameState.paused) {
        gameStatusEl.textContent = '游戏已暂停';
        pauseBtn.textContent = '继续';
    } else {
        gameStatusEl.textContent = '游戏进行中...';
        pauseBtn.textContent = '暂停';
    }
}

/**
 * 重新开始游戏
 */
function restartGame() {
    // 停止当前的游戏循环
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    
    // 初始化游戏
    initGame();
}

/**
 * 键盘事件监听器
 * 处理玩家的按键输入
 */
document.addEventListener('keydown', (e) => {
    // 玩家1控制：W(上) / A(左) / S(下) / D(右)
    switch(e.key.toLowerCase()) {
        case 'w':
            // 不能直接掉头（比如向右时不能直接向左）
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
    
    // 玩家2控制：方向键
    switch(e.key) {
        case 'ArrowUp':
            e.preventDefault(); // 防止页面滚动
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
        case ' ': // 空格键：暂停/继续
            e.preventDefault();
            if (gameState.running) {
                togglePause();
            }
            break;
    }
});

// 按钮事件绑定
startBtn.addEventListener('click', startGame); // 开始按钮
pauseBtn.addEventListener('click', togglePause); // 暂停按钮
restartBtn.addEventListener('click', restartGame); // 重新开始按钮

// 页面加载完成后，初始化游戏
initGame();
