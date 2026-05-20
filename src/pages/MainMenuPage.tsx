
import { useState } from 'react';

interface MainMenuPageProps {
  onStartGame: (level: number) =&gt; void;
}

export function MainMenuPage({ onStartGame }: MainMenuPageProps) {
  const [selectedLevel, setSelectedLevel] = useState(1);

  return (
    &lt;div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8"&gt;
      &lt;div className="text-center mb-12"&gt;
        &lt;h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4"&gt;
          冒险闯关
        &lt;/h1&gt;
        &lt;p className="text-xl text-gray-300"&gt;收集星星，躲避危险，到达终点！&lt;/p&gt;
      &lt;/div&gt;

      &lt;div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full"&gt;
        &lt;div className="mb-8"&gt;
          &lt;h2 className="text-2xl font-bold text-white mb-4"&gt;选择关卡&lt;/h2&gt;
          &lt;div className="grid grid-cols-5 gap-3"&gt;
            {[1, 2, 3, 4, 5].map((level) =&gt; (
              &lt;button
                key={level}
                onClick={() =&gt; setSelectedLevel(level)}
                className={`w-12 h-12 rounded-lg font-bold text-xl transition-all ${
                  selectedLevel === level
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-110'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              &gt;
                {level}
              &lt;/button&gt;
            ))}
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;button
          onClick={() =&gt; onStartGame(selectedLevel)}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-xl rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
        &gt;
          开始游戏
        &lt;/button&gt;

        &lt;div className="mt-8 text-gray-300 text-sm"&gt;
          &lt;h3 className="font-bold mb-2"&gt;操作说明：&lt;/h3&gt;
          &lt;ul className="space-y-1"&gt;
            &lt;li&gt;A / 左箭头 - 向左移动&lt;/li&gt;
            &lt;li&gt;D / 右箭头 - 向右移动&lt;/li&gt;
            &lt;li&gt;W / 上箭头 / 空格 - 跳跃&lt;/li&gt;
            &lt;li&gt;ESC / P - 暂停&lt;/li&gt;
          &lt;/ul&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}

