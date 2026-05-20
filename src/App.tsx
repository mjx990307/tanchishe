
import { useState } from 'react';
import { MainMenuPage } from './pages/MainMenuPage';
import { GamePage } from './pages/GamePage';
import { LevelCompletePage } from './pages/LevelCompletePage';
import { GameOverPage } from './pages/GameOverPage';
import { useGameState } from './hooks/useGameState';

type Page = 'menu' | 'game' | 'level-complete' | 'game-over';

export default function App() {
  const [currentPage, setCurrentPage] = useState&lt;Page&gt;('menu');
  const [currentLevel, setCurrentLevel] = useState(1);
  const { gameState, resetGame, nextLevel } = useGameState();

  const handleStartGame = (level: number) =&gt; {
    setCurrentLevel(level);
    resetGame();
    setCurrentPage('game');
  };

  const handleLevelComplete = () =&gt; {
    setCurrentPage('level-complete');
  };

  const handleGameOver = () =&gt; {
    setCurrentPage('game-over');
  };

  const handleNextLevel = () =&gt; {
    setCurrentLevel(prev =&gt; prev + 1);
    setCurrentPage('game');
  };

  const handleRestart = () =&gt; {
    resetGame();
    setCurrentPage('game');
  };

  const handleBackToMenu = () =&gt; {
    resetGame();
    setCurrentPage('menu');
  };

  return (
    &lt;div className="min-h-screen"&gt;
      {currentPage === 'menu' &amp;&amp; (
        &lt;MainMenuPage onStartGame={handleStartGame} /&gt;
      )}
      {currentPage === 'game' &amp;&amp; (
        &lt;GamePage
          onLevelComplete={handleLevelComplete}
          onGameOver={handleGameOver}
          onBackToMenu={handleBackToMenu}
          initialLevel={currentLevel}
        /&gt;
      )}
      {currentPage === 'level-complete' &amp;&amp; (
        &lt;LevelCompletePage
          gameState={gameState}
          onNextLevel={handleNextLevel}
          onBackToMenu={handleBackToMenu}
        /&gt;
      )}
      {currentPage === 'game-over' &amp;&amp; (
        &lt;GameOverPage
          gameState={gameState}
          onRestart={handleRestart}
          onBackToMenu={handleBackToMenu}
        /&gt;
      )}
    &lt;/div&gt;
  );
}
