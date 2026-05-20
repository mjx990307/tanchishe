
import { useState, useEffect, useMemo } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { generateLevel } from '../utils/levelGenerator';
import { GameCanvas } from '../components/GameCanvas';
import { HUD } from '../components/HUD';

interface GamePageProps {
  onLevelComplete: () =&gt; void;
  onGameOver: () =&gt; void;
  onBackToMenu: () =&gt; void;
  initialLevel: number;
}

export function GamePage({
  onLevelComplete,
  onGameOver,
  onBackToMenu,
  initialLevel
}: GamePageProps) {
  const { gameState, addScore, loseLife, gainLife, togglePause, completeLevel } = useGameState();
  const controls = useKeyboardControls();
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

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
    if (controls.pause) {
      togglePause();
    }
  }, [controls.pause]);

  useEffect(() =&gt; {
    if (gameState.isLevelComplete) {
      setTimeout(() =&gt; {
        onLevelComplete();
      }, 500);
    }
  }, [gameState.isLevelComplete, onLevelComplete]);

  useEffect(() =&gt; {
    if (gameState.isGameOver) {
      setTimeout(() =&gt; {
        onGameOver();
      }, 500);
    }
  }, [gameState.isGameOver, onGameOver]);

  const levelData = useMemo(() =&gt; {
    return generateLevel(initialLevel, canvasSize.width, canvasSize.height);
  }, [initialLevel, canvasSize]);

  return (
    &lt;div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center p-4"&gt;
      &lt;div className="relative"&gt;
        &lt;HUD gameState={gameState} onPause={togglePause} /&gt;
        &lt;GameCanvas
          levelData={levelData}
          onScore={addScore}
          onLoseLife={loseLife}
          onGainLife={gainLife}
          onLevelComplete={completeLevel}
          isPaused={gameState.isPaused}
          controls={{ left: controls.left, right: controls.right, jump: controls.jump }}
        /&gt;

        {gameState.isPaused &amp;&amp; (
          &lt;div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg"&gt;
            &lt;div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center"&gt;
              &lt;h2 className="text-4xl font-bold text-white mb-6"&gt;游戏暂停&lt;/h2&gt;
              &lt;div className="space-y-4"&gt;
                &lt;button
                  onClick={togglePause}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl"
                &gt;
                  继续游戏
                &lt;/button&gt;
                &lt;button
                  onClick={onBackToMenu}
                  className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold text-lg rounded-xl"
                &gt;
                  返回菜单
                &lt;/button&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        )}
      &lt;/div&gt;
    &lt;/div&gt;
  );
}

