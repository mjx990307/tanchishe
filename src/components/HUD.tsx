
import { GameState } from '../hooks/useGameState';

interface HUDProps {
  gameState: GameState;
  onPause: () =&gt; void;
}

export function HUD({ gameState, onPause }: HUDProps) {
  return (
    &lt;div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10"&gt;
      &lt;div className="bg-black/50 backdrop-blur-md rounded-lg p-4 space-y-2"&gt;
        &lt;div className="flex items-center gap-2"&gt;
          &lt;span className="text-yellow-400 text-xl"&gt;⭐&lt;/span&gt;
          &lt;span className="text-white font-bold text-lg"&gt;{gameState.score}&lt;/span&gt;
        &lt;/div&gt;
        &lt;div className="flex items-center gap-1"&gt;
          {Array.from({ length: 5 }).map((_, i) =&gt; (
            &lt;span
              key={i}
              className={`text-xl ${i &lt; gameState.lives ? 'text-red-500' : 'text-gray-600'}`}
            &gt;
              ❤️
            &lt;/span&gt;
          ))}
        &lt;/div&gt;
      &lt;/div&gt;

      &lt;div className="bg-black/50 backdrop-blur-md rounded-lg p-4 flex items-center gap-4"&gt;
        &lt;span className="text-white font-bold text-lg"&gt;
          关卡 {gameState.level}
        &lt;/span&gt;
        &lt;button
          onClick={onPause}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        &gt;
          {gameState.isPaused ? '继续' : '暂停'}
        &lt;/button&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}

