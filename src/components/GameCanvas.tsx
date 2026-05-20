
import { useEffect, useRef, useState } from 'react';
import {
  Player,
  Platform,
  Collectible,
  Obstacle,
  GameObject,
  LevelData,
  updatePlayer,
  updatePlatforms,
  updateCollectibles,
  checkCollision,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  JUMP_FORCE,
  MOVE_SPEED
} from '../utils/gameEngine';

interface GameCanvasProps {
  levelData: LevelData;
  onScore: (points: number) =&gt; void;
  onLoseLife: () =&gt; void;
  onGainLife: () =&gt; void;
  onLevelComplete: () =&gt; void;
  isPaused: boolean;
  controls: { left: boolean; right: boolean; jump: boolean };
}

export function GameCanvas({
  levelData,
  onScore,
  onLoseLife,
  onGainLife,
  onLevelComplete,
  isPaused,
  controls
}: GameCanvasProps) {
  const canvasRef = useRef&lt;HTMLCanvasElement&gt;(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  
  const playerRef = useRef&lt;Player&gt;({
    x: levelData.playerStart.x,
    y: levelData.playerStart.y,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    velocityX: 0,
    velocityY: 0,
    color: '#667eea',
    isJumping: false,
    onGround: false
  });

  const platformsRef = useRef&lt;Platform[]&gt;([...levelData.platforms]);
  const collectiblesRef = useRef&lt;Collectible[]&gt;([...levelData.collectibles]);
  const obstaclesRef = useRef&lt;Obstacle[]&gt;([...levelData.obstacles]);
  const goalRef = useRef&lt;GameObject&gt;({ ...levelData.goal });
  const hitObstacleRef = useRef&lt;boolean&gt;(false);
  const animationFrameRef = useRef&lt;number&gt;();

  useEffect(() =&gt; {
    const handleResize = () =&gt; {
      const width = Math.min(window.innerWidth - 40, 1200);
      const height = Math.min(window.innerHeight - 200, 800);
      setCanvasSize({ width, height });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () =&gt; window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() =&gt; {
    playerRef.current = {
      x: levelData.playerStart.x,
      y: levelData.playerStart.y,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      velocityX: 0,
      velocityY: 0,
      color: '#667eea',
      isJumping: false,
      onGround: false
    };
    platformsRef.current = [...levelData.platforms];
    collectiblesRef.current = [...levelData.collectibles];
    obstaclesRef.current = [...levelData.obstacles];
    goalRef.current = { ...levelData.goal };
    hitObstacleRef.current = false;
  }, [levelData]);

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) =&gt; {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a202c');
    gradient.addColorStop(0.5, '#2d3748');
    gradient.addColorStop(1, '#1a365d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i &lt; 50; i++) {
      const x = (i * 37) % width;
      const y = (i * 23) % (height - 100);
      ctx.beginPath();
      ctx.arc(x, y, 1 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player) =&gt; {
    ctx.fillStyle = player.color;
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 10;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 0;
    ctx.fillRect(player.x + 8, player.y + 8, 6, 6);
    ctx.fillRect(player.x + 18, player.y + 8, 6, 6);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 10, player.y + 10, 2, 2);
    ctx.fillRect(player.x + 20, player.y + 10, 2, 2);
  };

  const drawPlatform = (ctx: CanvasRenderingContext2D, platform: Platform) =&gt; {
    ctx.fillStyle = platform.color;
    ctx.shadowColor = platform.color;
    ctx.shadowBlur = 5;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(platform.x, platform.y, platform.width, 5);
  };

  const drawCollectible = (ctx: CanvasRenderingContext2D, collectible: Collectible) =&gt; {
    if (collectible.collected) return;

    ctx.save();
    ctx.translate(collectible.x + collectible.width / 2, collectible.y + collectible.height / 2);
    ctx.rotate(collectible.rotation);
    ctx.shadowColor = collectible.color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = collectible.color;

    if (collectible.type === 'star') {
      ctx.beginPath();
      for (let i = 0; i &lt; 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const x = Math.cos(angle) * 12;
        const y = Math.sin(angle) * 12;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        
        const innerAngle = angle + Math.PI / 5;
        const innerX = Math.cos(innerAngle) * 5;
        const innerY = Math.sin(innerAngle) * 5;
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.bezierCurveTo(-10, -5, -10, -12, 0, -8);
      ctx.bezierCurveTo(10, -12, 10, -5, 0, 5);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, obstacle: Obstacle) =&gt; {
    ctx.fillStyle = obstacle.color;
    ctx.shadowColor = obstacle.color;
    ctx.shadowBlur = 10;

    if (obstacle.type === 'spike') {
      ctx.beginPath();
      ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
      ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
      ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  };

  const drawGoal = (ctx: CanvasRenderingContext2D, goal: GameObject) =&gt; {
    ctx.fillStyle = goal.color;
    ctx.shadowColor = goal.color;
    ctx.shadowBlur = 20;
    
    ctx.fillRect(goal.x, goal.y, 8, goal.height);
    
    ctx.fillStyle = '#9f7aea';
    ctx.beginPath();
    ctx.moveTo(goal.x + 8, goal.y);
    ctx.lineTo(goal.x + goal.width, goal.y + 20);
    ctx.lineTo(goal.x + 8, goal.y + 40);
    ctx.closePath();
    ctx.fill();
    
    ctx.shadowBlur = 0;
  };

  const gameLoop = () =&gt; {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    drawBackground(ctx, canvasSize.width, canvasSize.height);

    if (!isPaused) {
      let player = playerRef.current;
      let platforms = platformsRef.current;
      let collectibles = collectiblesRef.current;
      let obstacles = obstaclesRef.current;
      let goal = goalRef.current;

      if (controls.left) player.velocityX = -MOVE_SPEED;
      else if (controls.right) player.velocityX = MOVE_SPEED;
      else player.velocityX = 0;

      if (controls.jump &amp;&amp; player.onGround &amp;&amp; !player.isJumping) {
        player.velocityY = JUMP_FORCE;
        player.isJumping = true;
      }

      player = updatePlayer(player, platforms, canvasSize.width, canvasSize.height);
      platforms = updatePlatforms(platforms);
      collectibles = updateCollectibles(collectibles);

      collectibles = collectibles.map(c =&gt; {
        if (!c.collected &amp;&amp; checkCollision(player, c)) {
          if (c.type === 'star') onScore(100);
          else onGainLife();
          return { ...c, collected: true };
        }
        return c;
      });

      if (!hitObstacleRef.current) {
        obstacles.forEach(obstacle =&gt; {
          if (checkCollision(player, obstacle)) {
            hitObstacleRef.current = true;
            onLoseLife();
            setTimeout(() =&gt; {
              hitObstacleRef.current = false;
            }, 1000);
          }
        });
      }

      if (checkCollision(player, goal)) {
        onLevelComplete();
      }

      playerRef.current = player;
      platformsRef.current = platforms;
      collectiblesRef.current = collectibles;
    }

    platformsRef.current.forEach(p =&gt; drawPlatform(ctx, p));
    collectiblesRef.current.forEach(c =&gt; drawCollectible(ctx, c));
    obstaclesRef.current.forEach(o =&gt; drawObstacle(ctx, o));
    drawGoal(ctx, goalRef.current);
    drawPlayer(ctx, playerRef.current);

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() =&gt; {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () =&gt; {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, controls]);

  return (
    &lt;canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      className="rounded-lg shadow-2xl border-4 border-blue-500/30"
    /&gt;
  );
}

