import React from 'react';
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
    return (
        <div className='space-y-4'>
            {/* Enhanced Header */}
            {/* <div className='flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#0A0A0A] p-3'>
                <div className='space-y-1'>
                    <span className='text-[10px] font-medium tracking-wider text-white/50 uppercase'>Pattern Configuration</span>
                    <div className='flex items-center gap-2'>
                        <span className='font-mono text-sm font-medium text-white/90'>
                            {startIndex} → {startIndex + maxBoxCount - 1}
                        </span>
                        <div className='h-3 w-[1px] bg-white/10' />
                        <span className='font-mono text-[10px] tracking-wider text-white/30'>RANGE</span>
                    </div>
                </div>
                <div className='flex h-8 items-center gap-2 rounded-md border border-white/[0.05] bg-white/[0.02] px-3 backdrop-blur'>
                    <div className='h-1 w-1 rounded-full bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.2)]' />
                    <span className='font-mono text-xs text-white/50'>ACTIVE</span>
                </div>
            </div> */}

            {/* Enhanced Visualization Container */}
            <div className='relative h-36 overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-to-b from-black to-[#0A0A0A] p-4'>
                {/* Refined Grid overlay */}
                <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]' />

                {/* Enhanced Background bars */}
                <div className='relative mt-4 flex h-[calc(100%-24px)] items-center'>
                    {Array.from({ length: 38 }).map((_, i) => (
                        <div key={i} className='flex h-full flex-1 items-center px-[0.5px]'>
                            <div
                                className={cn(
                                    'z-90 h-12 w-full rounded-[1px] transition-all duration-300',
                                    i >= startIndex && i < startIndex + maxBoxCount ? 'bg-gradient-to-b from-white/[0.25] to-white/[0.05]' : 'bg-white/[0.05]'
                                )}
                            />
                        </div>
                    ))}
                </div>

                {/* Enhanced Selection indicator */}
                <div
                    className='absolute inset-y-0 ml-1 transition-all duration-300'
                    style={{
                        left: `${(startIndex / 38) * 100}%`,
                        width: `${(maxBoxCount / 38) * 100}%`,
                    }}>
                    {/* Refined vertical lines */}
                    <div className='absolute inset-y-8 left-0 w-[1px] bg-white/20 shadow-[0_0_8px_rgba(255,255,255,0.1)]' />
                    <div className='absolute inset-y-8 right-0 w-[1px] bg-white/20 shadow-[0_0_8px_rgba(255,255,255,0.1)]' />

                    {/* Value Labels (Top) */}
                    <div className='absolute top-2 left-0 -translate-x-1/2 text-center'>
                        <div className='rounded-md px-2 py-0.5'>
                            <span className='font-mono text-sm font-medium text-white/90'>{startIndex}</span>
                        </div>
                    </div>
                    <div className='absolute top-2 right-0 translate-x-1/2 text-center'>
                        <div className='rounded-md px-2 py-0.5'>
                            <span className='font-mono text-sm font-medium text-white/90'>{startIndex + maxBoxCount - 1}</span>
                        </div>
                    </div>

                    {/* Start/End Labels (Bottom) */}
                    <div className='absolute bottom-4 left-0 -translate-x-1/2 text-center'>
                        <div className='font-mono text-[10px] font-medium tracking-wider text-white/40'>START</div>
                    </div>
                    <div className='absolute right-0 bottom-4 translate-x-1/2 text-center'>
                        <div className='font-mono text-[10px] font-medium tracking-wider text-white/40'>END</div>
                    </div>
                </div>
            </div>

            {/* Enhanced Controls */}
            <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2 rounded-lg border border-white/[0.08] bg-gradient-to-b from-[#0A0A0A] to-black p-3'>
                    <div className='flex items-center justify-between'>
                        <span className='text-[10px] font-medium tracking-wider text-white/50 uppercase'>Length</span>
                        <div className='flex items-center gap-2'>
                            <span className='font-mono text-sm text-white/90'>{maxBoxCount}</span>
                            <span className='font-mono text-[10px] tracking-wider text-white/30'>UNITS</span>
                        </div>
                    </div>
                    <StyleControl value={maxBoxCount} onChange={(value) => onStyleChange('maxBoxCount', value)} min={2} max={38} step={1} hideLabel />
                </div>

                <div className='space-y-2 rounded-lg border border-white/[0.08] bg-gradient-to-b from-[#0A0A0A] to-black p-3'>
                    <div className='flex items-center justify-between'>
                        <span className='text-[10px] font-medium tracking-wider text-white/50 uppercase'>Start</span>
                        <div className='flex items-center gap-2'>
                            <span className='font-mono text-sm text-white/90'>{startIndex}</span>
                            <span className='font-mono text-[10px] tracking-wider text-white/30'>INDEX</span>
                        </div>
                    </div>
                    <StyleControl
                        value={startIndex}
                        onChange={(value) => {
                            const maxStartIndex = Math.min(value, 38 - maxBoxCount);
                            onStyleChange('startIndex', maxStartIndex);
                        }}
                        min={0}
                        max={Math.min(36, 38 - maxBoxCount)}
                        step={1}
                        hideLabel
                    />
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
