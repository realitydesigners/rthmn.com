import { useCallback, useEffect, useRef, useState } from 'react';

export const useLongPress = (callback: () => void, ms: number = 500) => {
    const [isPressed, setIsPressed] = useState<boolean>(false);
    const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const isLongPressed = useRef<boolean>(false);
    const startPosition = useRef<{ x: number; y: number } | null>(null);
    const scrolling = useRef<boolean>(false);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const start = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if ('touches' in e) {
                startPosition.current = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                };
            } else {
                startPosition.current = {
                    x: e.clientX,
                    y: e.clientY,
                };
            }

            scrolling.current = false;
            setIsPressed(true);

            timerRef.current = setTimeout(() => {
                if (!scrolling.current) {
                    isLongPressed.current = true;
                    callback();
                }
            }, ms);
        },
        [callback, ms]
    );

    const move = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!startPosition.current) return;

        const currentPosition = 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };

        const moveThreshold = 2;
        const deltaY = Math.abs(currentPosition.y - startPosition.current.y);
        const deltaX = Math.abs(currentPosition.x - startPosition.current.x);

        if (deltaY > moveThreshold || deltaX > moveThreshold) {
            scrolling.current = true;
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            setIsPressed(false);
        }
    }, []);

    const stop = useCallback(() => {
        setIsPressed(false);
        isLongPressed.current = false;
        startPosition.current = null;
        scrolling.current = false;
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    }, []);

    return {
        isPressed,
        handlers: {
            onMouseDown: start,
            onMouseMove: move,
            onMouseUp: stop,
            onMouseLeave: stop,
            onTouchStart: start,
            onTouchMove: move,
            onTouchEnd: stop,
        },
    };
};
