'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useGridStore } from '@/stores/gridStore';

// Pre-calculate grid cells to avoid recreation
const GRID_CELLS = {
    1: [0],
    2: [0, 1],
    3: [0, 1, 2],
    4: [0, 1, 2, 3],
    5: [0, 1, 2, 3, 4],
};

// Memoized grid icon component
const GridIcon = React.memo(({ cols, isActive, onClick }: { cols: number; isActive: boolean; onClick: () => void }) => {
    const gridStyle = useMemo(() => ({ gridTemplateColumns: `repeat(${cols}, 1fr)` }), [cols]);
    const cells = GRID_CELLS[cols as keyof typeof GRID_CELLS];

    return (
        <button
            onClick={onClick}
            className={`group relative flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200 ${
                isActive
                    ? 'border-[#333] bg-gradient-to-b from-[#1A1A1A] to-[#141414]'
                    : 'border-[#222] bg-gradient-to-b from-[#111] to-[#0A0A0A] hover:border-[#333] hover:from-[#151515] hover:to-[#0F0F0F]'
            }`}>
            <div className='grid h-4 w-4 gap-[1px]' style={gridStyle}>
                {cells.map((i) => (
                    <div
                        key={i}
                        className={`rounded-[1px] border transition-all duration-200 ${
                            isActive ? 'border-[#444] bg-[#222]' : 'border-[#222] bg-[#181818] group-hover:border-[#333] group-hover:bg-[#1A1A1A]'
                        }`}
                    />
                ))}
            </div>
        </button>
    );
});

GridIcon.displayName = 'GridIcon';

// Base column options always available
const BASE_COLUMN_OPTIONS = [1, 2, 3, 4, 5];

export const GridControl = () => {
    const { updateBreakpoint, getGridClass, lastCols } = useGridStore();
    const [currentWidth, setCurrentWidth] = useState(0);
    const [selectedCols, setSelectedCols] = useState<number | null>(null);
    const [isClient, setIsClient] = useState(false);

    // Mark as client-side mounted
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Update width when main container changes
    const updateWidth = useCallback(() => {
        const main = document.querySelector('main');
        if (!main) return;

        const newWidth = main.clientWidth;
        // Only update if width actually changes to prevent unnecessary renders
        setCurrentWidth((prevWidth) => (newWidth !== prevWidth ? newWidth : prevWidth));
    }, []);

    // Initial width setup and resize observer
    useEffect(() => {
        updateWidth();
        const timer = setTimeout(updateWidth, 150);
        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(updateWidth);
        });
        const main = document.querySelector('main');
        if (main) {
            resizeObserver.observe(main);
        }
        return () => {
            resizeObserver.disconnect();
            clearTimeout(timer);
        };
    }, [updateWidth]);

    // Determine current columns based on width and selected/persisted state
    const currentCols = useMemo(() => {
        // Prefer explicitly selected columns first
        if (selectedCols !== null) {
            return selectedCols;
        }
        // Then use persisted lastCols if client is ready
        if (isClient && lastCols > 0) {
            return lastCols;
        }
        // Fallback based on width (or default 1 if width is 0)
        if (currentWidth > 0) {
            const gridClass = getGridClass(currentWidth);
            const match = gridClass.match(/grid-cols-(\d+)/);
            return match ? parseInt(match[1], 10) : 1;
        }
        return 1; // Default before width is known
    }, [selectedCols, isClient, lastCols, currentWidth, getGridClass]);

    // Determine if we should show the 5-column option based on width
    const showFiveColumns = currentWidth > 1400;

    // Handle clicking a grid button
    const handleClick = useCallback(
        (cols: number) => {
            if (currentWidth > 0) {
                setSelectedCols(cols);
                updateBreakpoint(currentWidth, cols);
            }
        },
        [currentWidth, updateBreakpoint]
    );

    // Reset selected cols when width changes significantly (causing currentCols to recalculate)
    useEffect(() => {
        // Resetting based on width changes might be too aggressive,
        // let's rely on the currentCols calculation instead.
        // setSelectedCols(null);
    }, [currentWidth]);

    return (
        <div className='flex items-center gap-2 px-2 py-1.5'>
            {BASE_COLUMN_OPTIONS.map((cols) => (
                <GridIcon
                    key={cols}
                    cols={cols}
                    // Only determine actual active state after mounting
                    isActive={isClient ? currentCols === cols : false}
                    onClick={() => handleClick(cols)}
                />
            ))}
            {showFiveColumns && (
                <GridIcon
                    cols={5}
                    // Only determine actual active state after mounting
                    isActive={isClient ? currentCols === 5 : false}
                    onClick={() => handleClick(5)}
                />
            )}
        </div>
    );
};
