import React, { useEffect, useState } from 'react';
import { useGridStore } from '@/stores/gridStore';
import { LuLayoutGrid } from 'react-icons/lu';

// Grid layout icons for different column counts
const GridIcon = ({ cols, isActive, onClick }: { cols: number; isActive: boolean; onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            className={`group relative flex h-10 w-10 items-center justify-center rounded border ${
                isActive ? 'border-blue-500 bg-blue-500/10' : 'border-[#222] bg-[#111] hover:border-[#333] hover:bg-[#181818]'
            }`}>
            <div className='grid h-6 w-6 gap-0.5' style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {Array(cols)
                    .fill(0)
                    .map((_, i) => (
                        <div key={i} className={`rounded-sm border border-[#333] bg-[#222] ${isActive ? 'border-blue-500/50' : 'group-hover:border-[#444]'}`} />
                    ))}
            </div>
            <span className='absolute -bottom-5 text-[10px] text-gray-500'>{cols}</span>
        </button>
    );
};

const getBreakpointLabel = (width: number, breakpoints: Array<{ width: number }>) => {
    const breakpoint = breakpoints.find((bp) => width <= bp.width);
    if (!breakpoint) return '> 1800px';

    switch (breakpoint.width) {
        case 600:
            return '≤ 600px';
        case 800:
            return '≤ 800px';
        case 900:
            return '≤ 900px';
        case 1000:
            return '≤ 1000px';
        case 1100:
            return '≤ 1100px';
        case 1200:
            return '≤ 1200px';
        case 1300:
            return '≤ 1300px';
        case 1400:
            return '≤ 1400px';
        case 1500:
            return '≤ 1500px';
        case 1600:
            return '≤ 1600px';
        case 1800:
            return '≤ 1800px';
        default:
            return '> 1800px';
    }
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
    const breakpointLabel = getBreakpointLabel(currentWidth, breakpoints);

    return (
        <div className='space-y-4 p-4'>
            <div className='flex items-center gap-3'>
                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#181818] to-[#0F0F0F] shadow-xl'>
                    <LuLayoutGrid size={14} className='text-[#666]' />
                </div>
                <div className='flex flex-col gap-1'>
                    <h3 className='font-kodemono text-[10px] font-medium tracking-widest text-[#818181] uppercase'>Grid Layout</h3>
                    <div className='flex items-center gap-2'>
                        <span className='text-[10px] text-gray-500'>{currentWidth}px</span>
                        <span className='text-[10px] text-gray-600'>•</span>
                        <span className='text-[10px] text-gray-500'>{breakpointLabel}</span>
                    </div>
                </div>
            </div>

            <div className='flex gap-2'>
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
        </div>
    );
};
