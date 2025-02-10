import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useGridStore } from '@/stores/gridStore';
import { LuLayoutGrid } from 'react-icons/lu';

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
const BASE_COLUMN_OPTIONS = [1, 2, 3, 4];

export const GridControl = () => {
    const { updateBreakpoint, getGridClass } = useGridStore();
    const [currentWidth, setCurrentWidth] = useState(0);

    // Update width when main container changes
    const updateWidth = useCallback(() => {
        const main = document.querySelector('main');
        if (!main) return;

        const newWidth = main.clientWidth;
        if (Math.abs(newWidth - currentWidth) > 5) {
            setCurrentWidth(newWidth);
        }
    }, [currentWidth]);

    useEffect(() => {
        // Initial update
        updateWidth();

        // Watch for resize
        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(updateWidth);
        });

        const main = document.querySelector('main');
        if (main) {
            resizeObserver.observe(main);
        }

        return () => resizeObserver.disconnect();
    }, [updateWidth]);

    // Determine if we should show the 5-column option based on width
    const showFiveColumns = currentWidth > 1400;

    // Get the current column count directly from the grid class
    const currentCols = useMemo(() => {
        const gridClass = getGridClass(currentWidth);
        const match = gridClass.match(/grid-cols-(\d+)/);
        return match ? parseInt(match[1]) : 1;
    }, [getGridClass, currentWidth]);

    // Memoize click handlers
    const handleClick = useCallback(
        (cols: number) => {
            updateBreakpoint(currentWidth, cols);
        },
        [currentWidth, updateBreakpoint]
    );

    return (
        <div className='flex items-center gap-2 px-2 py-1.5'>
            {BASE_COLUMN_OPTIONS.map((cols) => (
                <GridIcon key={cols} cols={cols} isActive={currentCols === cols} onClick={() => handleClick(cols)} />
            ))}
            {showFiveColumns && <GridIcon cols={5} isActive={currentCols === 5} onClick={() => handleClick(5)} />}
        </div>
    );
};
