'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import type { Box, BoxSlice } from '@/types/types';

const LineChart = React.memo(({ boxes, containerSize }: { boxes: Box[]; containerSize: number }) => {
    const createPath = useMemo(() => {
        if (!boxes.length) return '';

        const maxSize = Math.max(...boxes.map((box) => Math.abs(box.value)));
        let path = '';
        let currentX = containerSize;
        let currentY = containerSize / 2; // Start in middle

        // Start path
        path = `M ${currentX} ${currentY}`;

        boxes.forEach((box, i) => {
            const size = (Math.abs(box.value) / maxSize) * containerSize;
            const isPositive = box.value > 0;

            // Move diagonally up or down
            currentX -= size;
            currentY += isPositive ? -size : size;

            // Add line to next point
            path += ` L ${currentX} ${currentY}`;
        });

        return path;
    }, [boxes, containerSize]);

    return (
        <svg className='absolute inset-0 h-full w-full'>
            <path d={createPath} fill='none' strokeWidth='1' stroke={boxes[0]?.value > 0 ? '#22c55e' : '#ef4444'} strokeLinecap='square' strokeLinejoin='miter' />
        </svg>
    );
});

LineChart.displayName = 'LineChart';

export const ResoChart = React.memo(
    ({ slice, className = '' }: { slice: BoxSlice | null; className?: string }) => {
        const boxRef = useRef<HTMLDivElement>(null);
        const [containerSize, setContainerSize] = useState(0);

        useEffect(() => {
            let rafId: number;
            const updateSize = () => {
                if (boxRef.current) {
                    const element = boxRef.current;
                    const rect = element.getBoundingClientRect();
                    setContainerSize(Math.min(rect.width, rect.height));
                }
            };

            const debouncedUpdateSize = () => {
                cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(updateSize);
            };

            const resizeObserver = new ResizeObserver(debouncedUpdateSize);

            if (boxRef.current) {
                resizeObserver.observe(boxRef.current);
            }
            debouncedUpdateSize();

            return () => {
                resizeObserver.disconnect();
                cancelAnimationFrame(rafId);
            };
        }, []);

        if (!slice?.boxes || slice.boxes.length === 0) {
            return null;
        }

        return (
            <div ref={boxRef} className={`relative aspect-square h-full w-full ${className}`}>
                <div className='relative h-full w-full'>
                    <LineChart boxes={slice.boxes} containerSize={containerSize} />
                </div>
            </div>
        );
    },
    (prevProps, nextProps) => prevProps.slice?.timestamp === nextProps.slice?.timestamp && prevProps.className === nextProps.className
);

ResoChart.displayName = 'ResoChart';
