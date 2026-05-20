
import { LevelData, PLAYER_WIDTH, PLAYER_HEIGHT } from './gameEngine';

export function generateLevel(level: number, canvasWidth: number, canvasHeight: number): LevelData {
  const platforms = [
    {
      x: 0,
      y: canvasHeight - 50,
      width: canvasWidth,
      height: 50,
      velocityX: 0,
      velocityY: 0,
      color: '#4a5568',
      type: 'normal' as const
    }
  ];

  const platformCount = 5 + level * 2;
  for (let i = 0; i < platformCount; i++) {
    const x = Math.random() * (canvasWidth - 150);
    const y = canvasHeight - 100 - Math.random() * (canvasHeight - 200);
    const isMoving = level > 1 && Math.random() > 0.7;

    platforms.push({
      x,
      y,
      width: 100 + Math.random() * 100,
      height: 20,
      velocityX: 0,
      velocityY: 0,
      color: '#3182ce',
      type: isMoving ? 'moving' : 'normal',
      moveRange: isMoving ? { start: Math.max(0, x - 100), end: Math.min(canvasWidth - 150, x + 100) } : undefined,
      speed: isMoving ? 2 : undefined,
      direction: isMoving ? 1 : undefined
    });
  }

  const collectibles = [];
  const starCount = 5 + level * 3;
  for (let i = 0; i < starCount; i++) {
    collectibles.push({
      x: 50 + Math.random() * (canvasWidth - 100),
      y: 50 + Math.random() * (canvasHeight - 200),
      width: 24,
      height: 24,
      velocityX: 0,
      velocityY: 0,
      color: '#ecc94b',
      type: 'star' as const,
      collected: false,
      rotation: 0
    });
  }

  if (level > 0) {
    collectibles.push({
      x: 100 + Math.random() * (canvasWidth - 200),
      y: 100 + Math.random() * (canvasHeight - 300),
      width: 24,
      height: 24,
      velocityX: 0,
      velocityY: 0,
      color: '#e53e3e',
      type: 'heart' as const,
      collected: false,
      rotation: 0
    });
  }

  const obstacles = [];
  const obstacleCount = Math.min(level, 5);
  for (let i = 0; i < obstacleCount; i++) {
    obstacles.push({
      x: 100 + Math.random() * (canvasWidth - 200),
      y: canvasHeight - 50 - 30,
      width: 30,
      height: 30,
      velocityX: 0,
      velocityY: 0,
      color: '#e53e3e',
      type: 'spike' as const
    });
  }

  const goal = {
    x: canvasWidth - 80,
    y: canvasHeight - 150,
    width: 50,
    height: 80,
    velocityX: 0,
    velocityY: 0,
    color: '#48bb78'
  };

  return {
    platforms,
    collectibles,
    obstacles,
    goal,
    playerStart: { x: 50, y: canvasHeight - 100 }
  };
}

