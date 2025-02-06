'use client';

import React, { useMemo, useState } from 'react';
import { LuBox, LuBoxes, LuChevronDown, LuChevronUp, LuLayoutGrid, LuLineChart, LuLock } from 'react-icons/lu';
import { useUser } from '@/providers/UserProvider';
import type { BoxColors } from '@/types/types';
import { cn } from '@/utils/cn';
import { TimeFrameVisualizer } from './Visualizers';

interface ChartStyleOptionProps {
    id: string;
    title: string;
    icon: React.ElementType;
    locked?: boolean;
    isActive?: boolean;
    onClick?: () => void;
}

// Constants
export const TIMEFRAMES = ['D', '12H', '4H', '2H', '1H', '15m', '5m', '1m'] as const;
export const SEGMENT_WIDTH = 38 / 9; // Width of each timeframe segment

export interface TimeframeRange {
    start: string;
    end: string;
}

/**
 * Converts start and end indices to timeframe range
 * Used by both PatternVisualizer and PairResoBox to ensure consistent timeframe display
 */
export const getTimeframeRange = (start: number, end: number): TimeframeRange => {
    // Calculate which segments we're in
    const startSegment = Math.floor(start / SEGMENT_WIDTH);
    const endSegment = Math.floor(end / SEGMENT_WIDTH);

    return {
        start: TIMEFRAMES[Math.min(startSegment, TIMEFRAMES.length - 1)] || 'D',
        end: TIMEFRAMES[Math.min(endSegment, TIMEFRAMES.length - 1)] || 'D',
    };
};

const ChartStyleOption: React.FC<ChartStyleOptionProps> = ({ id, title, icon: Icon, locked = false, isActive = false, onClick }) => {
    return (
        <button
            onClick={locked ? undefined : onClick}
            className={cn(
                'group relative flex h-[72px] flex-col items-center justify-center gap-2 rounded-lg border bg-gradient-to-b p-2 transition-all duration-200',
                isActive
                    ? 'border-[#333] from-[#181818]/80 to-[#0F0F0F]/90 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-[#444] hover:from-[#1c1c1c]/80 hover:to-[#141414]/90'
                    : 'border-[#222] from-[#141414]/30 to-[#0A0A0A]/40 hover:border-[#333] hover:from-[#181818]/40 hover:to-[#0F0F0F]/50',
                locked ? 'pointer-events-none opacity-90' : 'cursor-pointer'
            )}>
            {/* Background glow effect */}
            {isActive && !locked && <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_50%)]' />}
            {/* Diagonal stripes for locked state */}
            {locked && (
                <>
                    {/* Base dark stripes */}
                    <div
                        className='absolute inset-0 opacity-[0.06]'
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                                135deg,
                                #000,
                                #000 1px,
                                transparent 1.5px,
                                transparent 6px
                            )`,
                        }}
                    />
                    {/* Secondary dark stripes */}
                    <div
                        className='absolute inset-0 opacity-[0.04]'
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                                45deg,
                                #000,
                                #000 1px,
                                transparent 1.5px,
                                transparent 6px
                            )`,
                        }}
                    />
                    {/* Subtle light stripes */}
                    <div
                        className='absolute inset-0 opacity-[0.015]'
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                                135deg,
                                #fff,
                                #fff 1px,
                                transparent 1.5px,
                                transparent 6px
                            )`,
                        }}
                    />
                    {/* Overlay gradient for depth */}
                    <div className='absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/5' />
                </>
            )}
            {/* Lock icon */}
            {locked && (
                <div className='pointer-events-none absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-[#333] bg-gradient-to-b from-black/90 to-black/95 shadow-[0_2px_4px_rgba(0,0,0,0.4)] backdrop-blur-[1px]'>
                    <LuLock className='h-2.5 w-2.5 text-white/80' />
                </div>
            )}
            {/* Icon container with glow effect */}
            <div
                className={cn(
                    'relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b transition-all duration-300',
                    locked
                        ? 'from-[#181818]/70 to-[#0F0F0F]/70 shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
                        : isActive
                          ? 'from-[#222] to-[#111] shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
                          : 'from-[#181818] to-[#0F0F0F] shadow-[0_4px_12px_rgba(0,0,0,0.3)] group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
                )}>
                {/* Icon inner glow */}
                {!locked && isActive && <div className='absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]' />}
                <Icon
                    size={20}
                    className={cn(
                        'relative transition-all duration-300',
                        isActive ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]' : 'text-[#666]',
                        locked ? 'text-[#666] opacity-40' : 'group-hover:scale-110 group-hover:text-white'
                    )}
                />
            </div>
            {/* Title */}
            <span
                className={cn(
                    'font-kodemono text-[8px] font-medium tracking-widest uppercase transition-all duration-300',
                    locked ? 'text-[#666]/40' : isActive ? 'text-[#999]' : 'text-[#666] group-hover:text-[#818181]'
                )}>
                {title}
            </span>
        </button>
    );
};

export const VisualizersView = () => {
    const { boxColors, updateBoxColors } = useUser();
    const [showtimeframe, setShowtimeframe] = useState(true);
    const [showChartStyle, setShowChartStyle] = useState(true);

    // Calculate timeframe range based on current settings
    const timeframeRange = useMemo(() => {
        const startIndex = boxColors.styles?.startIndex ?? 0;
        const maxBoxCount = boxColors.styles?.maxBoxCount ?? 10;
        return getTimeframeRange(startIndex, startIndex + maxBoxCount);
    }, [boxColors.styles?.startIndex, boxColors.styles?.maxBoxCount]);

    const handleStyleChange = (property: keyof BoxColors['styles'], value: number | boolean) => {
        if (!boxColors.styles) return;
        updateBoxColors({
            ...boxColors,
            styles: {
                ...boxColors.styles,
                [property]: value,
            },
        });
    };

    const chartStyleOptions: ChartStyleOptionProps[] = [
        {
            id: 'box',
            title: 'Box',
            icon: LuBox,
            locked: false,
            isActive: !boxColors.styles?.showLineChart,
            onClick: () => handleStyleChange('showLineChart', false),
        },
        {
            id: 'line',
            title: 'Line',
            icon: LuLineChart,
            locked: true,
            isActive: boxColors.styles?.showLineChart,
        },
        {
            id: '3d',
            title: '3D',
            icon: LuBoxes,
            locked: true,
            isActive: false,
        },
    ];

    return (
        <div className='flex h-full flex-col'>
            <div className='flex-1 overflow-y-visible'>
                <div className='flex flex-col gap-2'>
                    {/* Colors Section Toggle */}

                    <div className='flex flex-col gap-2'>
                        <button
                            onClick={() => setShowChartStyle(!showChartStyle)}
                            className='group flex h-10 items-center justify-between rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] px-3 transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]'>
                            <div className='flex items-center gap-3'>
                                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#181818] to-[#0F0F0F] shadow-xl'>
                                    <LuLineChart size={14} className='text-[#666] transition-colors group-hover:text-white' />
                                </div>
                                <span className='font-kodemono text-[10px] font-medium tracking-widest text-[#818181] uppercase transition-colors group-hover:text-white'>
                                    Chart Style
                                </span>
                            </div>
                            {showChartStyle ? (
                                <LuChevronUp size={14} className='text-[#666] transition-colors group-hover:text-white' />
                            ) : (
                                <LuChevronDown size={14} className='text-[#666] transition-colors group-hover:text-white' />
                            )}
                        </button>

                        {showChartStyle && (
                            <div className='grid grid-cols-3 gap-2'>
                                {chartStyleOptions.map((option) => (
                                    <ChartStyleOption key={option.id} {...option} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Box Styles Section */}
                    <div className='flex flex-col gap-2'>
                        {/* timeframe Section */}
                        <div className='flex flex-col gap-2'>
                            <button
                                onClick={() => setShowtimeframe(!showtimeframe)}
                                className='group flex h-10 items-center justify-between rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] px-3 transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]'>
                                <div className='flex items-center gap-3'>
                                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#181818] to-[#0F0F0F] shadow-xl'>
                                        <LuLayoutGrid size={14} className='text-[#666] transition-colors group-hover:text-white' />
                                    </div>
                                    <span className='font-kodemono text-[10px] font-medium tracking-widest text-[#818181] uppercase transition-colors group-hover:text-white'>
                                        timeframe
                                    </span>
                                </div>
                                {showtimeframe ? (
                                    <LuChevronUp size={14} className='text-[#666] transition-colors group-hover:text-white' />
                                ) : (
                                    <LuChevronDown size={14} className='text-[#666] transition-colors group-hover:text-white' />
                                )}
                            </button>

                            {showtimeframe && (
                                <>
                                    <div className='flex items-center justify-between px-1 py-2'>
                                        <div className='space-y-1'>
                                            <span className='font-kodemono text-[10px] font-medium tracking-wider text-white/50 uppercase'>Global Control</span>
                                        </div>
                                        <button
                                            onClick={() => handleStyleChange('globalTimeframeControl', !boxColors.styles?.globalTimeframeControl)}
                                            className={`relative h-4 w-9 rounded-full transition-all duration-300 ${
                                                boxColors.styles?.globalTimeframeControl ? 'bg-white/20' : 'bg-white/[0.03]'
                                            }`}>
                                            <div
                                                className={`absolute top-0.5 right-0.5 h-3 w-3 rounded-full transition-all duration-300 ${
                                                    boxColors.styles?.globalTimeframeControl ? 'left-6 bg-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'left-1 bg-white/50'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <TimeFrameVisualizer
                                        startIndex={boxColors.styles?.startIndex ?? 0}
                                        maxBoxCount={boxColors.styles?.maxBoxCount ?? 10}
                                        boxes={[]}
                                        onStyleChange={handleStyleChange}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
