import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { BoxColors } from '@/utils/localStorage';
import { StyleControl } from './StyleControl';

interface PatternVisualizerProps {
    startIndex: number;
    maxBoxCount: number;
    boxes: number[];
    onStyleChange: (property: keyof BoxColors['styles'], value: number | boolean) => void;
}

// Helper function to convert index to timeframe
const getTimeframeRange = (start: number, end: number) => {
    // Define timeframe ranges (these can be adjusted)
    const timeframes = [
        { min: '1m', max: '15m' },
        { min: '5m', max: '30m' },
        { min: '15m', max: '1H' },
        { min: '30m', max: '2H' },
        { min: '1H', max: '4H' },
        { min: '2H', max: '6H' },
        { min: '4H', max: '8H' },
        { min: '6H', max: '12H' },
        { min: '8H', max: 'D' },
        { min: '12H', max: '2D' },
        { min: 'D', max: '3D' },
    ];

    const startRange = Math.floor(start / 3.5);
    const endRange = Math.floor(end / 3.5);

    return {
        start: timeframes[Math.min(startRange, timeframes.length - 1)]?.min || 'D',
        end: timeframes[Math.min(endRange, timeframes.length - 1)]?.max || '3D',
    };
};

export const PatternVisualizer: React.FC<PatternVisualizerProps> = ({ startIndex, maxBoxCount, boxes, onStyleChange }) => {
    const barContainerRef = useRef<HTMLDivElement>(null);
    const [dragState, setDragState] = useState<{
        isDragging: boolean;
        dragType: 'left' | 'right' | 'position' | null;
    }>({
        isDragging: false,
        dragType: null,
    });

    // Get current timeframe range
    const timeframeRange = getTimeframeRange(startIndex, startIndex + maxBoxCount);

    const handleMouseDown = (e: React.MouseEvent, type: 'left' | 'right' | 'position') => {
        e.preventDefault();
        e.stopPropagation();

        if (!barContainerRef.current) return;

        const rect = barContainerRef.current.getBoundingClientRect();
        const barWidth = rect.width / 38;
        const startX = e.clientX;
        let previousIndex = type === 'left' ? startIndex : type === 'right' ? maxBoxCount : startIndex;

        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!barContainerRef.current) return;

            const totalDeltaX = e.clientX - startX;
            const newIndex = Math.round(totalDeltaX / barWidth);

            if (newIndex === 0) return;

            switch (type) {
                case 'left': {
                    const newStartIndex = Math.max(0, Math.min(previousIndex + newIndex, 36));
                    const rightEdge = startIndex + maxBoxCount;
                    const newMaxBoxCount = Math.max(2, rightEdge - newStartIndex);
                    onStyleChange('startIndex', newStartIndex);
                    onStyleChange('maxBoxCount', newMaxBoxCount);
                    break;
                }
                case 'right': {
                    const newMaxBoxCount = Math.max(2, Math.min(previousIndex + newIndex, 38 - startIndex));
                    onStyleChange('maxBoxCount', newMaxBoxCount);
                    break;
                }
                case 'position': {
                    const newPosition = Math.max(0, Math.min(previousIndex + newIndex, 38 - maxBoxCount));
                    onStyleChange('startIndex', newPosition);
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
            <div className='relative h-40 overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-to-b from-[#0A0A0A] to-black'>
                {/* Enhanced Ambient Background Effects */}
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.12),transparent_70%)]' />
                <div className='absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:12px_12px]' />
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.4),transparent_70%)]' />
                <div className='absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent' />

                {/* Trading Style Indicators */}
                <div className='absolute inset-x-0 top-3 flex justify-between px-6'>
                    <div className='flex w-full justify-between text-[11px] font-medium'>
                        <div className='flex flex-col items-center'>
                            <span className='text-white/60'>Scalping</span>
                            <div className='mt-1 h-[2px] w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent' />
                        </div>
                        <div className='flex flex-col items-center'>
                            <span className='text-white/60'>Intraday</span>
                            <div className='mt-1 h-[2px] w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent' />
                        </div>
                        <div className='flex flex-col items-center'>
                            <span className='text-white/60'>Swing</span>
                            <div className='mt-1 h-[2px] w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent' />
                        </div>
                    </div>
                </div>

                {/* Main visualization area */}
                <div className='relative h-full px-6 pt-14 pb-16'>
                    <div ref={barContainerRef} className='group/bars relative flex h-14 items-center rounded-lg bg-white/[0.02]'>
                        {Array.from({ length: 38 }).map((_, i) => {
                            const isSelected = i >= startIndex && i < startIndex + maxBoxCount;
                            const isLeftEdge = i === startIndex;
                            const isRightEdge = i === startIndex + maxBoxCount - 1;
                            const isNearEdge = Math.abs(i - startIndex) <= 1 || Math.abs(i - (startIndex + maxBoxCount - 1)) <= 1;

                            return (
                                <div
                                    key={i}
                                    className='flex h-full flex-1 items-center px-[0.5px]'
                                    onMouseDown={(e) => {
                                        if (isSelected) {
                                            handleMouseDown(e, 'position');
                                        } else if (Math.abs(i - startIndex) <= 1) {
                                            handleMouseDown(e, 'left');
                                        } else if (Math.abs(i - (startIndex + maxBoxCount - 1)) <= 1) {
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
                                        {/* Unselected state visualization */}
                                        {!isSelected && (
                                            <div className='absolute inset-0 flex flex-col justify-between py-1.5'>
                                                <div className={cn('h-1.5 w-full rounded-sm transition-all duration-300', isNearEdge ? 'bg-white/[0.06]' : 'bg-white/[0.02]')} />
                                                <div className={cn('h-1.5 w-full rounded-sm transition-all duration-300', isNearEdge ? 'bg-white/[0.06]' : 'bg-white/[0.02]')} />
                                            </div>
                                        )}

                                        {/* Selected state effects */}
                                        {isSelected && (
                                            <>
                                                <div className='absolute inset-0 overflow-hidden'>
                                                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]' />
                                                </div>
                                                <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent' />
                                                <div className='absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/50 to-transparent' />

                                                {/* Box pattern for selected state */}
                                                <div className='absolute inset-0 flex flex-col justify-between py-1.5'>
                                                    <div className='h-1.5 w-full rounded-sm bg-white/[0.1]' />
                                                    <div className='h-1.5 w-full rounded-sm bg-white/[0.1]' />
                                                </div>
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
                                left: `${(startIndex / 38) * 100}%`,
                                width: `${(maxBoxCount / 38) * 100}%`,
                            }}>
                            {/* Edge handles with enhanced glow */}
                            <div className='group/left pointer-events-auto absolute -inset-y-3 -left-2 z-50 w-4 cursor-ew-resize' onMouseDown={(e) => handleMouseDown(e, 'left')}>
                                <div className='absolute inset-y-3 right-[8px] w-[2px] bg-gradient-to-b from-white/50 via-white/40 to-white/50 shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-150 group-hover/left:from-white/70 group-hover/left:via-white/60 group-hover/left:to-white/70 group-hover/left:shadow-[0_0_15px_rgba(255,255,255,0.4)]' />
                                <div className='absolute inset-y-3 right-[7px] w-[3px] bg-gradient-to-r from-white/0 to-white/10 opacity-0 transition-all duration-150 group-hover/left:opacity-100' />
                            </div>

                            <div
                                className='group/right pointer-events-auto absolute -inset-y-3 -right-2 z-50 w-4 cursor-ew-resize'
                                onMouseDown={(e) => handleMouseDown(e, 'right')}>
                                <div className='absolute inset-y-3 left-[8px] w-[2px] bg-gradient-to-b from-white/50 via-white/40 to-white/50 shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-150 group-hover/right:from-white/70 group-hover/right:via-white/60 group-hover/right:to-white/70 group-hover/right:shadow-[0_0_15px_rgba(255,255,255,0.4)]' />
                                <div className='absolute inset-y-3 left-[7px] w-[3px] bg-gradient-to-l from-white/0 to-white/10 opacity-0 transition-all duration-150 group-hover/right:opacity-100' />
                            </div>

                            {/* Vertical highlight lines with enhanced glow */}
                            <div className='absolute -bottom-14 left-0 h-14 w-[2px] bg-gradient-to-b from-white/40 via-white/30 to-transparent shadow-[0_0_10px_rgba(255,255,255,0.2)]' />
                            <div className='absolute right-0 -bottom-14 h-14 w-[2px] bg-gradient-to-b from-white/40 via-white/30 to-transparent shadow-[0_0_10px_rgba(255,255,255,0.2)]' />
                        </div>
                    </div>

                    {/* Integrated Timeframe Scale with Active Indicator */}
                    <div className='absolute inset-x-0 bottom-4 flex justify-between px-0'>
                        <div className='relative flex w-full justify-between text-[11px] font-medium'>
                            {['1m', '5m', '15m', '30m', '1H', '2H', '4H', '8H', '12H', 'D'].map((time, i) => {
                                // Improved calculation for timeframe positions
                                const totalPositions = 38;
                                const position = Math.floor((i / 9) * totalPositions);
                                const nextPosition = Math.floor(((i + 1) / 9) * totalPositions);

                                // Check if any part of this timeframe's range is selected
                                const isInRange =
                                    (position >= startIndex && position <= startIndex + maxBoxCount) ||
                                    (nextPosition >= startIndex && nextPosition <= startIndex + maxBoxCount) ||
                                    (position <= startIndex && nextPosition >= startIndex + maxBoxCount);

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

                            {/* Sliding highlight effect */}
                            <div
                                className='absolute -top-1 h-8 rounded-md bg-gradient-to-t from-white/[0.08] to-transparent transition-all duration-300'
                                style={{
                                    left: `${(startIndex / 38) * 100}%`,
                                    width: `${(maxBoxCount / 38) * 100}%`,
                                    boxShadow: '0 0 20px rgba(255,255,255,0.1)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Vertical highlight lines */}
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
        <div className='space-y-4'>
            {/* Enhanced Header */}
            {/* <div className='flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#0A0A0A] p-3'>
                <div className='space-y-1'>
                    <span className='text-[10px] font-medium tracking-wider text-white/50 uppercase'>Visual Parameters</span>
                    <div className='flex items-center gap-2'>
                        <span className='font-mono text-sm font-medium text-white/90'>Box Appearance</span>
                    </div>
                </div>
                <div className='flex h-8 items-center gap-2 rounded-md border border-white/[0.05] bg-white/[0.02] px-3 backdrop-blur'>
                    <div className='h-1 w-1 rounded-full bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.2)]' />
                    <span className='font-mono text-xs text-white/50'>PREVIEW</span>
                </div>
            </div> */}

            {/* Enhanced Preview Container */}
            <div className='overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-to-b from-black to-[#0A0A0A]'>
                <div className='relative'>
                    {/* Refined Grid background */}
                    <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]' />

                    <div className='relative flex h-full items-center justify-center p-8'>
                        {/* Enhanced Preview Box */}
                        <div
                            className='relative h-48 w-48 border border-white/[0.15] transition-all duration-300'
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

                        {/* Enhanced Parameter Labels */}
                        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                            {/* Labels with consistent styling */}
                            <div className='absolute top-4 left-4 rounded-md border border-white/[0.08] bg-black/90 px-2 py-1 backdrop-blur'>
                                <div className='font-mono text-[10px] font-medium text-white/40'>RADIUS</div>
                                <span className='font-mono text-sm text-white/90'>{borderRadius}px</span>
                            </div>

                            <div className='absolute right-4 bottom-4 rounded-md border border-white/[0.08] bg-black/90 px-2 py-1 backdrop-blur'>
                                <div className='font-mono text-[10px] font-medium text-white/40'>SHADOW</div>
                                <span className='font-mono text-sm text-white/90'>{(shadowIntensity * 100).toFixed(0)}%</span>
                            </div>

                            <div className='absolute top-4 right-4 rounded-md border border-white/[0.08] bg-black/90 px-2 py-1 backdrop-blur'>
                                <div className='font-mono text-[10px] font-medium text-white/40'>OPACITY</div>
                                <span className='font-mono text-sm text-white/90'>{(opacity * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Controls Container */}
            <div className='space-y-3 rounded-lg border border-white/[0.08] bg-gradient-to-b from-[#0A0A0A] to-black p-4'>
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
