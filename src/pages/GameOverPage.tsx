
import { GameState } from '../hooks/useGameState';

interface GameOverPageProps {
  gameState: GameState;
  onRestart: () =&gt; void;
  onBackToMenu: () =&gt; void;
}

export function GameOverPage({
  gameState,
  onRestart,
  onBackToMenu
}: GameOverPageProps) {
  return (
    &lt;div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 p-8"&gt;
      &lt;div className="text-center"&gt;
        &lt;h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400 mb-6"&gt;
          游戏结束
        &lt;/h1&gt;
        &lt;p className="text-2xl text-gray-300 mb-8"&gt;
          不要气馁，再试一次吧！
        &lt;/p&gt;

        &lt;div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 inline-block"&gt;
          &lt;div className="text-gray-400 mb-2"&gt;最终得分&lt;/div&gt;
          &lt;div className="text-4xl font-bold text-yellow-400"&gt;{gameState.score}&lt;/div&gt;
          &lt;div className="text-gray-400 mt-2"&gt;
            到达第 {gameState.level} 关
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="flex flex-col sm:flex-row gap-4 justify-center"&gt;
          &lt;button
            onClick={onRestart}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold text-xl rounded-xl shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95"
          &gt;
            重新开始
          &lt;/button&gt;
          &lt;button
            onClick={onBackToMenu}
            className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white font-bold text-xl rounded-xl transition-all hover:scale-105 active:scale-95"
          &gt;
            返回菜单
          &lt;/button&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}

