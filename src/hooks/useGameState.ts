
import { useState, useCallback } from 'react';

export interface GameState {
  score: number;
  lives: number;
  level: number;
  isPaused: boolean;
  isGameOver: boolean;
  isLevelComplete: boolean;
}

export function useGameState() {
  const [gameState, setGameState] = useState&lt;GameState&gt;({
    score: 0,
    lives: 3,
    level: 1,
    isPaused: false,
    isGameOver: false,
    isLevelComplete: false
  });

  const addScore = useCallback((points: number) =&gt; {
    setGameState(prev =&gt; ({ ...prev, score: prev.score + points }));
  }, []);

  const loseLife = useCallback(() =&gt; {
    setGameState(prev =&gt; {
      const newLives = prev.lives - 1;
      return {
        ...prev,
        lives: newLives,
        isGameOver: newLives &lt;= 0
      };
    });
  }, []);

  const gainLife = useCallback(() =&gt; {
    setGameState(prev =&gt; ({ ...prev, lives: Math.min(prev.lives + 1, 5) }));
  }, []);

  const nextLevel = useCallback(() =&gt; {
    setGameState(prev =&gt; ({
      ...prev,
      level: prev.level + 1,
      isLevelComplete: false
    }));
  }, []);

  const togglePause = useCallback(() =&gt; {
    setGameState(prev =&gt; ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const completeLevel = useCallback(() =&gt; {
    setGameState(prev =&gt; ({ ...prev, isLevelComplete: true }));
  }, []);

  const resetGame = useCallback(() =&gt; {
    setGameState({
      score: 0,
      lives: 3,
      level: 1,
      isPaused: false,
      isGameOver: false,
      isLevelComplete: false
    });
  }, []);

  return {
    gameState,
    addScore,
    loseLife,
    gainLife,
    nextLevel,
    togglePause,
    completeLevel,
    resetGame
  };
}

