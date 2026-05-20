
export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  color: string;
}

export interface Player extends GameObject {
  isJumping: boolean;
  onGround: boolean;
}

export interface Platform extends GameObject {
  type: 'normal' | 'moving';
  moveRange?: { start: number; end: number };
  speed?: number;
  direction?: number;
}

export interface Collectible extends GameObject {
  type: 'star' | 'heart';
  collected: boolean;
  rotation: number;
}

export interface Obstacle extends GameObject {
  type: 'spike' | 'enemy';
}

export interface LevelData {
  platforms: Platform[];
  collectibles: Collectible[];
  obstacles: Obstacle[];
  goal: GameObject;
  playerStart: { x: number; y: number };
}

export const GRAVITY = 0.5;
export const JUMP_FORCE = -12;
export const MOVE_SPEED = 5;
export const PLAYER_WIDTH = 32;
export const PLAYER_HEIGHT = 32;

export function checkCollision(obj1: GameObject, obj2: GameObject): boolean {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

export function updatePlayer(
  player: Player,
  platforms: Platform[],
  canvasWidth: number,
  canvasHeight: number
): Player {
  const newPlayer = { ...player };

  newPlayer.velocityY += GRAVITY;
  newPlayer.x += newPlayer.velocityX;
  newPlayer.y += newPlayer.velocityY;

  if (newPlayer.x < 0) newPlayer.x = 0;
  if (newPlayer.x + newPlayer.width > canvasWidth) {
    newPlayer.x = canvasWidth - newPlayer.width;
  }

  newPlayer.onGround = false;

  platforms.forEach(platform => {
    if (checkCollision(newPlayer, platform)) {
      if (player.y + player.height <= platform.y + 10 && newPlayer.velocityY > 0) {
        newPlayer.y = platform.y - newPlayer.height;
        newPlayer.velocityY = 0;
        newPlayer.onGround = true;
        newPlayer.isJumping = false;

        if (platform.type === 'moving' && platform.speed && platform.direction) {
          newPlayer.x += platform.speed * platform.direction;
        }
      } else if (player.y >= platform.y + platform.height - 10 && newPlayer.velocityY < 0) {
        newPlayer.y = platform.y + platform.height;
        newPlayer.velocityY = 0;
      } else {
        if (newPlayer.velocityX > 0) {
          newPlayer.x = platform.x - newPlayer.width;
        } else if (newPlayer.velocityX < 0) {
          newPlayer.x = platform.x + platform.width;
        }
      }
    }
  });

  if (newPlayer.y > canvasHeight) {
    newPlayer.y = canvasHeight - newPlayer.height - 50;
    newPlayer.velocityY = 0;
  }

  return newPlayer;
}

export function updatePlatforms(platforms: Platform[]): Platform[] {
  return platforms.map(platform => {
    if (platform.type === 'moving' && platform.moveRange && platform.speed && platform.direction !== undefined) {
      let newX = platform.x + platform.speed * platform.direction;
      let newDirection = platform.direction;

      if (newX <= platform.moveRange.start || newX >= platform.moveRange.end) {
        newDirection = -platform.direction;
        newX = platform.x + platform.speed * newDirection;
      }

      return { ...platform, x: newX, direction: newDirection };
    }
    return platform;
  });
}

export function updateCollectibles(collectibles: Collectible[]): Collectible[] {
  return collectibles.map(collectible => ({
    ...collectible,
    rotation: (collectible.rotation + 0.05) % (Math.PI * 2)
  }));
}

