import { useState, useRef, useCallback, useEffect } from 'react';

export const useLongPress = (callback: () => void, ms: number = 500) => {
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isLongPressed = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const start = useCallback(() => {
    setIsPressed(true);
    timerRef.current = setTimeout(() => {
      isLongPressed.current = true;
      callback();
    }, ms);
  }, [callback, ms]);

  const stop = useCallback(() => {
    setIsPressed(false);
    isLongPressed.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  return {
    isPressed,
    handlers: {
      onMouseDown: start,
      onMouseUp: stop,
      onMouseLeave: stop,
      onTouchStart: start,
      onTouchEnd: stop
    }
  };
};
