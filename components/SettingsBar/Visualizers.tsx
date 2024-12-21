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

export const PatternVisualizer: React.FC<PatternVisualizerProps> = ({ startIndex, maxBoxCount, boxes, onStyleChange }) => {
    const barContainerRef = useRef<HTMLDivElement>(null);
    const lastXRef = useRef(0);
    const [dragState, setDragState] = useState<{
        isDragging: boolean;
        dragType: 'left' | 'right' | 'position' | null;
    }>({
        isDragging: false,
        dragType: null,
    });

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

            // Calculate total movement from start position
            const totalDeltaX = e.clientX - startX;
            const newIndex = Math.round(totalDeltaX / barWidth);

            // Only update if there's a change
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
            <div className='relative h-36 overflow-hidden rounded-lg border border-[#1a1a1a] bg-black p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]'>
                {/* Enhanced Grid overlay */}
                <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px]' />

                {/* Scanner line effect */}
                <div className='absolute inset-0 overflow-hidden'>
                    <div
                        className='animate-scan absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent'
                        style={{
                            transform: 'translateY(-100%)',
                            animation: 'scan 4s linear infinite',
                        }}
                    />
                </div>

                {/* Enhanced Background bars */}
                <div ref={barContainerRef} className='group/bars relative mt-4 flex h-[calc(100%-24px)] items-center'>
                    {Array.from({ length: 38 }).map((_, i) => (
                        <div
                            key={i}
                            className='flex h-full flex-1 items-center px-[0.5px]'
                            onMouseDown={(e) => {
                                if (i >= startIndex && i < startIndex + maxBoxCount) {
                                    handleMouseDown(e, 'position');
                                } else if (Math.abs(i - startIndex) <= 1) {
                                    handleMouseDown(e, 'left');
                                } else if (Math.abs(i - (startIndex + maxBoxCount - 1)) <= 1) {
                                    handleMouseDown(e, 'right');
                                }
                            }}>
                            <div
                                className={cn(
                                    'z-90 h-12 w-full rounded-[1px] transition-all duration-300',
                                    i >= startIndex && i < startIndex + maxBoxCount
                                        ? 'bg-gradient-to-b from-[#222] to-[#111] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                                        : 'cursor-pointer bg-[#0A0A0A] hover:bg-[#111]'
                                )}
                            />
                        </div>
                    ))}

                    {/* Selection overlay with drag handles */}
                    <div
                        className='pointer-events-none absolute inset-y-0 z-100 ml-1 transition-all duration-300 group-hover/bars:shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_0_15px_rgba(59,130,246,0.2)]'
                        style={{
                            left: `${(startIndex / 38) * 100}%`,
                            width: `${(maxBoxCount / 38) * 100}%`,
                        }}>
                        {/* Selection overlay */}
                        <div className='absolute inset-0 bg-gradient-to-b from-blue-500/[0.02] to-transparent opacity-30' />

                        {/* Left edge line */}
                        <div className='group/left pointer-events-auto absolute -inset-y-4 -left-5 z-50 w-10 cursor-ew-resize' onMouseDown={(e) => handleMouseDown(e, 'left')}>
                            <div className='absolute inset-y-4 right-[18px] w-[2px] rounded-full bg-[#333] transition-all duration-150 group-hover/left:bg-blue-500/50 group-hover/left:shadow-[0_0_10px_rgba(59,130,246,0.5)]' />
                            <div className='absolute inset-y-4 right-3 w-[20px] opacity-0 transition-all duration-150 group-hover/left:opacity-100'>
                                <div className='absolute inset-0 rounded-l-lg bg-gradient-to-r from-blue-500/20 to-transparent' />
                            </div>
                        </div>

                        {/* Right edge line */}
                        <div className='group/right pointer-events-auto absolute -inset-y-4 -right-5 z-50 w-10 cursor-ew-resize' onMouseDown={(e) => handleMouseDown(e, 'right')}>
                            <div className='absolute inset-y-4 left-[18px] w-[2px] rounded-full bg-[#333] transition-all duration-150 group-hover/right:bg-blue-500/50 group-hover/right:shadow-[0_0_10px_rgba(59,130,246,0.5)]' />
                            <div className='absolute inset-y-4 left-3 w-[20px] opacity-0 transition-all duration-150 group-hover/right:opacity-100'>
                                <div className='absolute inset-0 rounded-r-lg bg-gradient-to-l from-blue-500/20 to-transparent' />
                            </div>
                        </div>

                        {/* Corner indicators */}
                        <div className='absolute -top-0.5 -left-0.5 h-2 w-2 border-t border-l border-[#222]' />
                        <div className='absolute -top-0.5 -right-0.5 h-2 w-2 border-t border-r border-[#222]' />
                        <div className='absolute -bottom-0.5 -left-0.5 h-2 w-2 border-b border-l border-[#222]' />
                        <div className='absolute -right-0.5 -bottom-0.5 h-2 w-2 border-r border-b border-[#222]' />

                        {/* Labels */}
                        <div className='absolute -top-3 left-0 z-30 -translate-x-1/2 text-center'>
                            <div className='rounded-md border border-[#222] bg-black/90 px-2.5 py-1.5 shadow-lg backdrop-blur-sm group-hover/bars:border-blue-500/20'>
                                <span className='font-mono text-sm font-medium text-[#666] group-hover/bars:text-blue-400'>{startIndex}</span>
                            </div>
                        </div>
                        <div className='absolute -top-3 right-0 z-30 translate-x-1/2 text-center'>
                            <div className='rounded-md border border-[#222] bg-black/90 px-2.5 py-1.5 shadow-lg backdrop-blur-sm group-hover/bars:border-blue-500/20'>
                                <span className='font-mono text-sm font-medium text-[#666] group-hover/bars:text-blue-400'>{startIndex + maxBoxCount - 1}</span>
                            </div>
                        </div>

                        {/* Start/End Labels */}
                        <div className='absolute -bottom-3 left-0 z-30 -translate-x-1/2 text-center'>
                            <div className='rounded-md border border-[#222] bg-black/90 px-2.5 py-1.5 shadow-lg backdrop-blur-sm'>
                                <div className='font-mono text-[10px] font-medium tracking-wider text-[#444]'>START</div>
                            </div>
                        </div>
                        <div className='absolute right-0 -bottom-3 z-30 translate-x-1/2 text-center'>
                            <div className='rounded-md border border-[#222] bg-black/90 px-2.5 py-1.5 shadow-lg backdrop-blur-sm'>
                                <div className='font-mono text-[10px] font-medium tracking-wider text-[#444]'>END</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes scan {
                    0% {
                        transform: translateY(-100%);
                    }
                    100% {
                        transform: translateY(100%);
                    }
                }
            `}</style>
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
