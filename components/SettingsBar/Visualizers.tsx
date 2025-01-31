import React, { useState, useRef } from 'react';
import { cn } from '@/utils/cn';
import { Box } from '@/types/types';
import { BoxColors } from '@/utils/localStorage';
import { StyleControl } from './StyleControl';

interface PatternVisualizerProps {
    startIndex: number;
    maxBoxCount: number;
    boxes: Box[];
    onStyleChange: (property: string, value: number | boolean) => void;
    timeframeRange: { start: string; end: string };
}

export const TimeFrameVisualizer: React.FC<PatternVisualizerProps> = ({ startIndex, maxBoxCount, boxes, onStyleChange, timeframeRange }) => {
    const barContainerRef = useRef<HTMLDivElement>(null);
    const [dragState, setDragState] = useState<{
        isDragging: boolean;
        dragType: 'left' | 'right' | 'position' | null;
    }>({
        isDragging: false,
        dragType: null,
    });

    // Convert to reversed index for calculations
    const reversedStartIndex = 37 - (startIndex + maxBoxCount - 1);
    const reversedMaxBoxCount = maxBoxCount;

    const handleMouseDown = (e: React.MouseEvent, type: 'left' | 'right' | 'position') => {
        e.preventDefault();
        e.stopPropagation();

        if (!barContainerRef.current) return;

        const rect = barContainerRef.current.getBoundingClientRect();
        const barWidth = rect.width / 38;
        const startX = e.clientX;
        let previousIndex = type === 'left' ? reversedStartIndex : type === 'right' ? reversedMaxBoxCount : reversedStartIndex;

        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!barContainerRef.current) return;

            const totalDeltaX = e.clientX - startX;
            const newIndex = Math.round(totalDeltaX / barWidth);

            if (newIndex === 0) return;

            switch (type) {
                case 'left': {
                    if (newIndex < 0) {
                        // Dragging left - increase size
                        const newReversedStartIndex = Math.max(0, previousIndex + newIndex);
                        const newMaxBoxCount = reversedMaxBoxCount + Math.abs(newIndex);
                        const newStartIndex = 37 - (newReversedStartIndex + newMaxBoxCount - 1);
                        onStyleChange('startIndex', newStartIndex);
                        onStyleChange('maxBoxCount', Math.min(newMaxBoxCount, 38 - newReversedStartIndex));
                    } else {
                        // Dragging right - decrease size
                        const newReversedStartIndex = Math.min(previousIndex + newIndex, 36);
                        const newMaxBoxCount = Math.max(2, reversedMaxBoxCount - newIndex);
                        const newStartIndex = 37 - (newReversedStartIndex + newMaxBoxCount - 1);
                        onStyleChange('startIndex', newStartIndex);
                        onStyleChange('maxBoxCount', newMaxBoxCount);
                    }
                    break;
                }
                case 'right': {
                    if (newIndex > 0) {
                        // Dragging right - increase size
                        const newMaxBoxCount = Math.min(previousIndex + newIndex, 38 - reversedStartIndex);
                        const newStartIndex = 37 - (reversedStartIndex + newMaxBoxCount - 1);
                        onStyleChange('startIndex', newStartIndex);
                        onStyleChange('maxBoxCount', newMaxBoxCount);
                    } else {
                        // Dragging left - decrease size
                        const newMaxBoxCount = Math.max(2, previousIndex + newIndex);
                        const newStartIndex = 37 - (reversedStartIndex + newMaxBoxCount - 1);
                        onStyleChange('startIndex', newStartIndex);
                        onStyleChange('maxBoxCount', newMaxBoxCount);
                    }
                    break;
                }
                case 'position': {
                    const newReversedStartIndex = Math.max(0, Math.min(previousIndex + newIndex, 38 - reversedMaxBoxCount));
                    const newStartIndex = 37 - (newReversedStartIndex + reversedMaxBoxCount - 1);
                    onStyleChange('startIndex', newStartIndex);
                    break;
                }
            }
        };

        const handleGlobalMouseUp = () => {
            setDragState({ isDragging: false, dragType: null });
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);
    };

    return (
        <div className='space-y-4'>
            <div className='group relative flex flex-col overflow-hidden rounded-lg p-[1px] transition-all'>
                <div className='relative flex flex-col rounded-lg'>
                    {/* Main visualization area */}
                    <div className='relative h-full px-4 pt-4 pb-9'>
                        <div ref={barContainerRef} className='group/bars relative flex h-10 items-center rounded-lg bg-white/[0.02]'>
                            {Array.from({ length: 38 }).map((_, i) => {
                                const reversedI = i; // No need to reverse i anymore since we're already in reversed space
                                const isSelected = reversedI >= reversedStartIndex && reversedI < reversedStartIndex + reversedMaxBoxCount;
                                const isLeftEdge = reversedI === reversedStartIndex;
                                const isRightEdge = reversedI === reversedStartIndex + reversedMaxBoxCount - 1;
                                const isNearEdge = Math.abs(reversedI - reversedStartIndex) <= 1 || Math.abs(reversedI - (reversedStartIndex + reversedMaxBoxCount - 1)) <= 1;

                                return (
                                    <div
                                        key={i}
                                        className='flex h-full flex-1 items-center'
                                        onMouseDown={(e) => {
                                            if (isSelected) {
                                                handleMouseDown(e, 'position');
                                            } else if (Math.abs(reversedI - reversedStartIndex) <= 1) {
                                                handleMouseDown(e, 'left');
                                            } else if (Math.abs(reversedI - (reversedStartIndex + reversedMaxBoxCount - 1)) <= 1) {
                                                handleMouseDown(e, 'right');
                                            }
                                        }}>
                                        <div
                                            className={cn(
                                                'relative h-full w-full transition-all duration-300',
                                                isSelected
                                                    ? cn(
                                                          'bg-gradient-to-b from-white/[0.15] to-white/[0.08] shadow-[inset_0_0_20px_rgba(255,255,255,0.08)]',
                                                          isLeftEdge && 'rounded-l-md',
                                                          isRightEdge && 'rounded-r-md'
                                                      )
                                                    : cn(
                                                          'cursor-pointer',
                                                          isNearEdge && 'bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[inset_0_0_10px_rgba(255,255,255,0.04)]'
                                                      )
                                            )}>
                                            {isSelected && (
                                                <>
                                                    <div className='absolute inset-0 overflow-hidden'>
                                                        <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]' />
                                                    </div>
                                                    <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent' />
                                                    <div className='absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/50 to-transparent' />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Selection overlay with timeframe display */}
                            <div
                                className='pointer-events-none absolute inset-y-0 z-100 transition-all duration-300'
                                style={{
                                    left: `${(reversedStartIndex / 38) * 100}%`,
                                    width: `${(reversedMaxBoxCount / 38) * 100}%`,
                                }}>
                                {/* Edge handles with enhanced glow */}
                                <div
                                    className='group/left pointer-events-auto absolute -inset-y-3 -left-2 z-50 w-4 cursor-ew-resize'
                                    onMouseDown={(e) => handleMouseDown(e, 'left')}>
                                    <div className='absolute inset-y-3 right-[8px] w-[2px] bg-gradient-to-b from-white/50 via-white/40 to-white/50 shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-150 group-hover/left:from-white/70 group-hover/left:via-white/60 group-hover/left:to-white/70 group-hover/left:shadow-[0_0_15px_rgba(255,255,255,0.4)]' />
                                    <div className='absolute inset-y-3 right-[7px] w-[3px] bg-gradient-to-r from-white/0 to-white/10 opacity-0 transition-all duration-150 group-hover/left:opacity-100' />
                                </div>

                                <div
                                    className='group/right pointer-events-auto absolute -inset-y-3 -right-2 z-50 w-4 cursor-ew-resize'
                                    onMouseDown={(e) => handleMouseDown(e, 'right')}>
                                    <div className='absolute inset-y-3 left-[8px] w-[2px] bg-gradient-to-b from-white/50 via-white/40 to-white/50 shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-150 group-hover/right:from-white/70 group-hover/right:via-white/60 group-hover/right:to-white/70 group-hover/right:shadow-[0_0_15px_rgba(255,255,255,0.4)]' />
                                    <div className='absolute inset-y-3 left-[7px] w-[3px] bg-gradient-to-l from-white/0 to-white/10 opacity-0 transition-all duration-150 group-hover/right:opacity-100' />
                                </div>
                            </div>
                        </div>

                        {/* Integrated Timeframe Scale with Active Indicator */}
                        <div className='absolute inset-x-0 bottom-2 flex justify-between px-[10px]'>
                            <div className='font-kodemono font- relative flex w-full justify-between text-[8px] uppercase'>
                                {['D', '12H', '4H', '2H', '1H', '15m', '5m', '1m'].map((time, i) => {
                                    // More accurate position calculation
                                    const segmentWidth = 38 / 9; // Width of each timeframe segment
                                    const position = Math.round(i * segmentWidth); // Use normal i for position
                                    const nextPosition = Math.round((i + 1) * segmentWidth);

                                    // Check if this timeframe is in range in the reversed space
                                    const isInRange =
                                        (position >= reversedStartIndex && position <= reversedStartIndex + reversedMaxBoxCount) ||
                                        (nextPosition > reversedStartIndex && nextPosition <= reversedStartIndex + reversedMaxBoxCount) ||
                                        (position <= reversedStartIndex && nextPosition >= reversedStartIndex + reversedMaxBoxCount);

                                    return (
                                        <div key={time} className='relative flex flex-col items-center'>
                                            <div
                                                className={cn(
                                                    'mb-1 h-1 w-[1px] transition-all duration-300',
                                                    isInRange
                                                        ? 'bg-gradient-to-b from-white/60 to-transparent shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                                                        : 'bg-gradient-to-b from-white/20 to-transparent'
                                                )}
                                            />
                                            <span className={cn('transition-all duration-300', isInRange ? 'font-medium text-white' : 'text-white/30')}>{time}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface BoxVisualizerProps {
    borderRadius: number;
    shadowIntensity: number;
    opacity: number;
    showBorder: boolean;
    onStyleChange: (property: keyof BoxColors['styles'], value: number | boolean) => void;
}

export const BoxVisualizer: React.FC<BoxVisualizerProps> = ({ borderRadius, shadowIntensity, opacity, showBorder, onStyleChange }) => {
    return (
        <div className='space-y-2'>
            <div className='group relative flex flex-col overflow-hidden rounded-lg p-[1px] transition-all'>
                <div className='relative flex flex-col rounded-lg'>
                    {/* Refined Grid background */}
                    <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]' />

                    <div className='relative flex h-full items-center justify-center bg-black/30 p-8'>
                        {/* Enhanced Preview Box */}
                        <div
                            className='relative h-24 w-24 transition-all duration-300'
                            style={{
                                borderRadius: `${borderRadius}px`,
                                boxShadow: `
                                    inset 0 0 ${shadowIntensity * 50}px rgba(255, 255, 255, ${shadowIntensity * 0.3}),
                                    0 0 20px rgba(255, 255, 255, 0.05)
                                `,
                                backgroundColor: `rgba(255, 255, 255, ${opacity * 0.1})`,
                            }}>
                            <div
                                className='absolute inset-0 transition-all duration-300'
                                style={{
                                    borderRadius: `${borderRadius}px`,
                                    background: `
                                        radial-gradient(circle at center, 
                                            rgba(255, 255, 255, ${opacity * 0.05}),
                                            transparent 70%
                                        )
                                    `,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Controls Container */}
            <div className='space-y-2 rounded-lg bg-black/30 p-4'>
                <StyleControl label='Border Radius' value={borderRadius} onChange={(value) => onStyleChange('borderRadius', value)} min={0} max={16} step={1} unit='px' />
                <StyleControl label='Shadow Depth' value={shadowIntensity} onChange={(value) => onStyleChange('shadowIntensity', value)} min={0} max={1} step={0.05} />
                <StyleControl label='Opacity' value={opacity} onChange={(value) => onStyleChange('opacity', value)} min={0.01} max={1} step={0.05} />

                <div className='flex items-center justify-between px-1 py-2'>
                    <div className='space-y-1'>
                        <span className='text-[10px] font-medium tracking-wider text-white/50 uppercase'>Show Border</span>
                    </div>
                    <button
                        onClick={() => onStyleChange('showBorder', !showBorder)}
                        className={`relative h-6 w-11 rounded-full transition-all duration-300 ${showBorder ? 'bg-white/20' : 'bg-white/[0.03]'}`}>
                        <div
                            className={`absolute top-1 h-4 w-4 rounded-full transition-all duration-300 ${
                                showBorder ? 'left-6 bg-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'left-1 bg-white/50'
                            }`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};
