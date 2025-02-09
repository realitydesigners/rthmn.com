import React, { useEffect, useState } from 'react';
import { useGridStore } from '@/stores/gridStore';
import { LuLayoutGrid } from 'react-icons/lu';

// Grid layout icons for different column counts
const GridIcon = ({ cols, isActive, onClick }: { cols: number; isActive: boolean; onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            className={`group relative flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200 ${
                isActive
                    ? 'border-[#333] bg-gradient-to-b from-[#1A1A1A] to-[#141414]'
                    : 'border-[#222] bg-gradient-to-b from-[#111] to-[#0A0A0A] hover:border-[#333] hover:from-[#151515] hover:to-[#0F0F0F]'
            }`}>
            <div className='grid h-4 w-4 gap-[1px]' style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {Array(cols)
                    .fill(0)
                    .map((_, i) => (
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
};

export const GridControl = () => {
    const { breakpoints, updateBreakpoint } = useGridStore();
    const [currentWidth, setCurrentWidth] = useState(0);

    useEffect(() => {
        const updateWidth = () => {
            const main = document.querySelector('main');
            if (!main) return;
            setCurrentWidth(main.clientWidth);
        };

        // Initial update
        updateWidth();

        // Handle resize
        const resizeObserver = new ResizeObserver(updateWidth);
        const main = document.querySelector('main');
        if (main) {
            resizeObserver.observe(main);
        }

        return () => resizeObserver.disconnect();
    }, []);

    const currentBreakpoint = breakpoints.find((bp) => currentWidth <= bp.width) || breakpoints[breakpoints.length - 1];

    return (
        <div className='flex items-center gap-2 px-2 py-1.5'>
            {[1, 2, 3, 4].map((cols) => (
                <GridIcon
                    key={cols}
                    cols={cols}
                    isActive={currentBreakpoint.cols === cols}
                    onClick={() => {
                        updateBreakpoint(currentBreakpoint.width, cols);
                    }}
                />
            ))}
        </div>
    );
};
