
import { useState, useEffect, useCallback } from 'react';

export function useKeyboardControls() {
  const [keys, setKeys] = useState&lt;{ [key: string]: boolean }&gt;({});

  const handleKeyDown = useCallback((e: KeyboardEvent) =&gt; {
    setKeys(prev =&gt; ({ ...prev, [e.key.toLowerCase()]: true }));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) =&gt; {
    setKeys(prev =&gt; ({ ...prev, [e.key.toLowerCase()]: false }));
  }, []);

  useEffect(() =&gt; {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () =&gt; {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return {
    left: keys['a'] || keys['arrowleft'],
    right: keys['d'] || keys['arrowright'],
    jump: keys['w'] || keys['arrowup'] || keys[' '],
    pause: keys['escape'] || keys['p']
  };
}

