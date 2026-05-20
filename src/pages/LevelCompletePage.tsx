
import { GameState } from '../hooks/useGameState';

interface LevelCompletePageProps {
  gameState: GameState;
  onNextLevel: () =&gt; void;
  onBackToMenu: () =&gt; void;
}

export function LevelCompletePage({
  gameState,
  onNextLevel,
  onBackToMenu
}: LevelCompletePageProps) {
  return (
    &lt;div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 p-8"&gt;
      &lt;div className="text-center"&gt;
        &lt;h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-green-400 mb-6"&gt;
          关卡完成！
        &lt;/h1&gt;
        &lt;p className="text-2xl text-gray-300 mb-8"&gt;
          太棒了！你成功通过了第 {gameState.level} 关
        &lt;/p&gt;

        &lt;div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 inline-block"&gt;
          &lt;div className="text-6xl mb-2"&gt;⭐&lt;/div&gt;
          &lt;div className="text-4xl font-bold text-yellow-400"&gt;{gameState.score}&lt;/div&gt;
          &lt;div className="text-gray-400"&gt;总得分&lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="flex flex-col sm:flex-row gap-4 justify-center"&gt;
          &lt;button
            onClick={onNextLevel}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold text-xl rounded-xl shadow-lg shadow-green-500/30 transition-all hover:scale-105 active:scale-95"
          &gt;
            下一关
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

