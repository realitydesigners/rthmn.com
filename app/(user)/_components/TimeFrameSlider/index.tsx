import React, { useRef, useState, useMemo, useCallback, memo, useEffect } from 'react';
import { Box } from '@/types/types';
import { cn } from '@/utils/cn';

// Dynamic time intervals in minutes
const TIME_INTERVALS = [
    { label: '1D', minutes: 1440 },
    { label: '12H', minutes: 720 },
    { label: '8H', minutes: 480 },
    { label: '6H', minutes: 360 },
    { label: '4H', minutes: 240 },
    { label: '2H', minutes: 120 },
    { label: '1H', minutes: 60 },
    { label: '30m', minutes: 30 },
    { label: '15m', minutes: 15 },
    { label: '5m', minutes: 5 },
    { label: '1m', minutes: 1 },
];

interface PatternVisualizerProps {
    startIndex: number;
    maxBoxCount: number;
    boxes: Box[];
    onStyleChange: (property: string, value: number | boolean) => void;
    onDragStart?: (type: 'left' | 'right' | 'position') => void;
    onDragEnd?: () => void;
}

export const TimeFrameSlider: React.FC<PatternVisualizerProps> = memo(({ startIndex, maxBoxCount, boxes, onStyleChange, onDragStart, onDragEnd }) => {
    const barContainerRef = useRef<HTMLDivElement>(null);
    const edgeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [dragState, setDragState] = useState<{
        isDragging: boolean;
        dragType: 'left' | 'right' | 'position' | null;
    }>({
        isDragging: false,
        dragType: null,
    });

    // Clear timeouts on unmount
    useEffect(() => {
        return () => {
            if (edgeTimeoutRef.current) clearTimeout(edgeTimeoutRef.current);
            if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
            window.removeEventListener('mousemove', handleGlobalMouseMove);
        };
    }, []);

    // Convert to reversed index for calculations
    const reversedStartIndex = useMemo(() => 37 - (startIndex + maxBoxCount - 1), [startIndex, maxBoxCount]);
    const reversedMaxBoxCount = maxBoxCount;

    // Memoize style calculations
    const selectionStyle = useMemo(
        () => ({
            transform: `translateX(${(reversedStartIndex / 38) * 100}%) scaleX(${reversedMaxBoxCount / 38})`,
            transformOrigin: 'left',
            width: '100%',
        }),
        [reversedStartIndex, reversedMaxBoxCount]
    );

    // Global mouse move handler for tracking position after drag
    const handleGlobalMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!barContainerRef.current || !edgeTimeoutRef.current) return;

            const rect = barContainerRef.current.getBoundingClientRect();
            const isNearSlider = e.clientX >= rect.left - 40 && e.clientX <= rect.right + 40 && e.clientY >= rect.top - 40 && e.clientY <= rect.bottom + 40;

            if (!isNearSlider) {
                // Mouse moved far from slider, trigger reset
                if (edgeTimeoutRef.current) {
                    clearTimeout(edgeTimeoutRef.current);
                    edgeTimeoutRef.current = null;
                }
                onDragEnd?.();
                window.removeEventListener('mousemove', handleGlobalMouseMove);
            }
        },
        [onDragEnd]
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent, type: 'left' | 'right' | 'position') => {
            e.preventDefault();
            e.stopPropagation();

            if (!barContainerRef.current) return;

            // Clear any existing timeouts
            if (edgeTimeoutRef.current) clearTimeout(edgeTimeoutRef.current);
            if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
            edgeTimeoutRef.current = null;
            resetTimeoutRef.current = null;

            // Remove any existing global mouse move listener
            window.removeEventListener('mousemove', handleGlobalMouseMove);

            onDragStart?.(type);

            const rect = barContainerRef.current.getBoundingClientRect();
            const barWidth = rect.width / 38;
            const startX = e.clientX;
            let previousIndex = type === 'left' ? reversedStartIndex : type === 'right' ? reversedMaxBoxCount : reversedStartIndex;

            const handleDragMouseMove = (e: MouseEvent) => {
                if (!barContainerRef.current) return;

                const totalDeltaX = e.clientX - startX;
                const newIndex = Math.round(totalDeltaX / barWidth);

                if (newIndex === 0) return;

                requestAnimationFrame(() => {
                    switch (type) {
                        case 'left': {
                            const newReversedStartIndex = Math.max(0, Math.min(36, previousIndex + newIndex));
                            const newMaxBoxCount = Math.max(2, Math.min(38 - newReversedStartIndex, reversedMaxBoxCount + (previousIndex - newReversedStartIndex)));
                            const newStartIndex = Math.min(37 - (newReversedStartIndex + newMaxBoxCount - 1), 36);
                            onStyleChange('startIndex', newStartIndex);
                            onStyleChange('maxBoxCount', newMaxBoxCount);
                            break;
                        }
                        case 'right': {
                            if (newIndex > 0) {
                                const newMaxBoxCount = Math.min(previousIndex + newIndex, 38 - reversedStartIndex);
                                const newStartIndex = 37 - (reversedStartIndex + newMaxBoxCount - 1);
                                onStyleChange('startIndex', newStartIndex);
                                onStyleChange('maxBoxCount', newMaxBoxCount);
                            } else {
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
                });
            };

            const handleDragMouseUp = () => {
                setDragState({ isDragging: false, dragType: null });
                window.removeEventListener('mousemove', handleDragMouseMove);
                window.removeEventListener('mouseup', handleDragMouseUp);

                if (type === 'left' || type === 'right') {
                    // Start tracking global mouse movement
                    window.addEventListener('mousemove', handleGlobalMouseMove);

                    // Set a longer timeout for eventual reset
                    resetTimeoutRef.current = setTimeout(() => {
                        if (edgeTimeoutRef.current) {
                            clearTimeout(edgeTimeoutRef.current);
                            edgeTimeoutRef.current = null;
                        }
                        onDragEnd?.();
                        window.removeEventListener('mousemove', handleGlobalMouseMove);
                    }, 2000); // 2 second inactivity timeout
                } else {
                    // For position drags, reset immediately
                    onDragEnd?.();
                }
            };

            window.addEventListener('mousemove', handleDragMouseMove);
            window.addEventListener('mouseup', handleDragMouseUp);
            setDragState({ isDragging: true, dragType: type });
        },
        [reversedStartIndex, reversedMaxBoxCount, onStyleChange, onDragStart, onDragEnd, handleGlobalMouseMove]
    );

    // Memoize time label calculations
    const getTimeLabel = useCallback((index: number) => {
        const position = index / 38;
        const intervalIndex = Math.floor(position * TIME_INTERVALS.length);
        return TIME_INTERVALS[Math.min(intervalIndex, TIME_INTERVALS.length - 1)];
    }, []);

    // Enhanced edge handles with more prominent visual feedback
    const renderEdgeHandles = useMemo(() => {
        return (
            <>
                <div
                    className='group/left pointer-events-auto absolute -inset-y-3 -left-2 z-10 w-4 cursor-ew-resize will-change-transform'
                    onMouseDown={(e) => handleMouseDown(e, 'left')}>
                    <div className='absolute inset-y-3 right-[8px] w-[2px] bg-gradient-to-b from-white/80 via-white/60 to-white/80 shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-200 group-hover/left:from-white/95 group-hover/left:via-white/80 group-hover/left:to-white/95 group-hover/left:shadow-[0_0_25px_rgba(255,255,255,0.7)]' />
                    <div className='absolute inset-y-3 right-[7px] w-[3px] bg-gradient-to-r from-white/0 to-white/20 opacity-0 transition-opacity duration-200 group-hover/left:opacity-100' />
                </div>

                <div
                    className='group/right pointer-events-auto absolute -inset-y-3 -right-2 z-10 w-4 cursor-ew-resize will-change-transform'
                    onMouseDown={(e) => handleMouseDown(e, 'right')}>
                    <div className='absolute inset-y-3 left-[8px] w-[2px] bg-gradient-to-b from-white/80 via-white/60 to-white/80 shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-200 group-hover/right:from-white/95 group-hover/right:via-white/80 group-hover/right:to-white/95 group-hover/right:shadow-[0_0_25px_rgba(255,255,255,0.7)]' />
                    <div className='absolute inset-y-3 left-[7px] w-[3px] bg-gradient-to-l from-white/0 to-white/20 opacity-0 transition-opacity duration-200 group-hover/right:opacity-100' />
                </div>
            </>
        );
    }, [handleMouseDown]);

    return (
        <div className='relative h-full px-2 pb-6'>
            {/* Main slider container */}
            <div ref={barContainerRef} className='group/bars relative flex h-8 items-center'>
                {/* Ambient glow effect */}
                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-50' />

                {/* Selection area with gradient */}
                <div
                    className='absolute h-full bg-gradient-to-b from-white/[0.15] to-white/[0.08] shadow-[inset_0_0_30px_rgba(255,255,255,0.1),0_0_15px_rgba(255,255,255,0.05)] will-change-transform'
                    style={selectionStyle}>
                    {/* Inner glow effect */}
                    <div className='absolute inset-0 overflow-hidden'>
                        <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]' />
                    </div>
                    {/* Top highlight */}
                    <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent' />
                    {/* Bottom shadow */}
                    <div className='absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent' />
                    {/* Side highlights */}
                    <div className='absolute inset-y-0 left-0 w-px bg-gradient-to-b from-white/40 via-white/25 to-white/40 shadow-[0_0_8px_rgba(255,255,255,0.2)]' />
                    <div className='absolute inset-y-0 right-0 w-px bg-gradient-to-b from-white/40 via-white/25 to-white/40 shadow-[0_0_8px_rgba(255,255,255,0.2)]' />
                </div>

                {/* Invisible click handlers */}
                <div className='relative flex h-full w-full'>
                    {Array.from({ length: 38 }).map((_, i) => (
                        <div
                            key={i}
                            className='flex h-full flex-1 items-center'
                            onMouseDown={(e) => {
                                const reversedI = i;
                                const isSelected = reversedI >= reversedStartIndex && reversedI < reversedStartIndex + reversedMaxBoxCount;
                                const isNearLeftEdge = Math.abs(reversedI - reversedStartIndex) <= 1;
                                const isNearRightEdge = Math.abs(reversedI - (reversedStartIndex + reversedMaxBoxCount - 1)) <= 1;

                                if (isSelected) {
                                    handleMouseDown(e, 'position');
                                } else if (isNearLeftEdge) {
                                    handleMouseDown(e, 'left');
                                } else if (isNearRightEdge) {
                                    handleMouseDown(e, 'right');
                                }
                            }}
                        />
                    ))}
                </div>

                {/* Edge handles */}
                <div className='pointer-events-none absolute inset-y-0 z-0 will-change-transform' style={selectionStyle}>
                    {renderEdgeHandles}
                </div>
            </div>

            {/* Dynamic Timeframe Scale */}
            <DynamicTimeScale reversedStartIndex={reversedStartIndex} reversedMaxBoxCount={reversedMaxBoxCount} getTimeLabel={getTimeLabel} />
        </div>
    );
});

interface DynamicTimeScaleProps {
    reversedStartIndex: number;
    reversedMaxBoxCount: number;
    getTimeLabel: (index: number) => { label: string; minutes: number };
}

// Enhanced DynamicTimeScale component
const DynamicTimeScale = memo(({ reversedStartIndex, reversedMaxBoxCount, getTimeLabel }: DynamicTimeScaleProps) => {
    const scaleMarks = useMemo(() => {
        return Array.from({ length: 11 }).map((_, i) => {
            const position = i * (38 / 10);
            const isInRange = position >= reversedStartIndex && position <= reversedStartIndex + reversedMaxBoxCount;
            const timeInfo = getTimeLabel(position);

            return (
                <div key={i} className='relative flex flex-col items-center'>
                    <div
                        className={cn(
                            'mb-1 h-2 w-[1px] will-change-transform',
                            isInRange ? 'bg-gradient-to-b from-white/90 to-transparent shadow-[0_0_12px_rgba(255,255,255,0.6)]' : 'bg-gradient-to-b from-white/20 to-transparent'
                        )}
                    />
                    <span
                        className={cn(
                            'font-kodemono text-[10px] tracking-wider will-change-transform',
                            isInRange ? 'font-medium text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-white/30'
                        )}>
                        {timeInfo.label}
                    </span>
                </div>
            );
        });
    }, [reversedStartIndex, reversedMaxBoxCount, getTimeLabel]);

    return (
        <div className='absolute inset-x-0 flex justify-between'>
            <div className='relative flex w-full justify-between'>{scaleMarks}</div>
        </div>
    );
});
