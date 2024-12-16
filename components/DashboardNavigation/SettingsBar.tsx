'use client';
import React, { useState } from 'react';
import { LuChevronRight, LuPipette } from 'react-icons/lu';
import { useDashboard } from '@/providers/DashboardProvider';
import { colorPresets } from '@/utils/colorPresets';
import { BoxColors } from '@/utils/localStorage';
import { cn } from '@/utils/cn';

type SettingsSection = 'colors' | 'boxStyles' | null;

interface SettingsBarProps {
    isOpen: boolean;
    onToggle: () => void;
}

const MenuButton = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`group flex w-full items-center justify-between rounded-full border ${
            isActive ? 'border-[#333] bg-[#181818] text-white' : 'border-[#222] bg-[#111] text-[#818181] hover:border-[#333] hover:bg-[#181818]'
        }`}>
        <div className='flex h-12 w-full items-center justify-between px-4'>
            <span className='text-sm font-medium'>{label}</span>
            <LuChevronRight className={cn('transition-transform duration-200', isActive && 'rotate-90')} size={16} />
        </div>
    </button>
);

const ColorPresetButton = ({ preset, isSelected, onClick }: { preset: { name: string; positive: string; negative: string }; isSelected: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            'group relative flex h-12 w-full items-center gap-3 rounded-lg border border-[#222] bg-[#141414] p-2 text-left transition-all hover:border-[#333] hover:bg-[#1A1A1A]',
            isSelected && 'border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.1)]'
        )}>
        <div className='flex gap-2'>
            <div className='h-8 w-8 rounded-md shadow-md transition-transform group-hover:scale-105' style={{ backgroundColor: preset.positive }} />
            <div className='h-8 w-8 rounded-md shadow-md transition-transform group-hover:scale-105' style={{ backgroundColor: preset.negative }} />
        </div>
        <span className='text-sm text-gray-400 group-hover:text-gray-300'>{preset.name}</span>
        {isSelected && (
            <div className='absolute top-1/2 right-3 -translate-y-1/2'>
                <div className='h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]' />
            </div>
        )}
    </button>
);

const ColorPicker = ({ label, color, onChange }: { label: string; color: string; onChange: (color: string) => void }) => (
    <div className='group flex items-center justify-between rounded-lg border border-[#222] bg-[#141414] p-3 transition-all hover:border-[#333] hover:bg-[#1A1A1A]'>
        <div className='flex items-center gap-3'>
            <div className='relative'>
                <div className='h-8 w-8 rounded-md shadow-md transition-all group-hover:scale-105' style={{ backgroundColor: color }} />
                <LuPipette className='absolute -right-1 -bottom-1 h-4 w-4 text-gray-400' />
            </div>
            <span className='text-sm text-gray-400 group-hover:text-gray-300'>{label}</span>
        </div>
        <input type='color' value={color} onChange={(e) => onChange(e.target.value)} className='invisible absolute h-8 w-8 cursor-pointer group-hover:visible' />
    </div>
);

interface StyleControlProps {
    label?: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    unit?: string;
    hideLabel?: boolean;
    preview?: React.ReactNode;
}

const StyleControl: React.FC<StyleControlProps> = ({ label, value, onChange, min, max, step, unit = '', hideLabel = false, preview }) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className='space-y-2'>
            {!hideLabel && (
                <div className='flex items-center justify-between px-1'>
                    <label className='text-xs font-medium text-gray-400'>{label}</label>
                    <span className='font-mono text-xs font-medium text-white/70'>
                        {step < 1 ? value.toFixed(2) : value}
                        {unit}
                    </span>
                </div>
            )}
            <div className='group relative'>
                {preview && <div className='mb-2 h-12 rounded-lg border border-[#222] bg-[#111]'>{preview}</div>}
                <div className='absolute inset-y-0 left-0 flex w-full items-center px-3'>
                    <div className='relative h-[2px] w-full bg-[#222]'>
                        <div className='absolute h-full bg-white/20' style={{ width: `${percentage}%` }} />
                        <div className='absolute h-full bg-white/40' style={{ width: `${percentage}%` }} />
                    </div>
                </div>
                <input
                    type='range'
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className='relative h-8 w-full cursor-pointer appearance-none rounded-lg bg-transparent transition-all hover:cursor-grab active:cursor-grabbing'
                    style={
                        {
                            '--thumb-size': '16px',
                            '--thumb-color': '#fff',
                        } as React.CSSProperties
                    }
                />
                <style jsx global>{`
                    input[type='range']::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        height: var(--thumb-size);
                        width: var(--thumb-size);
                        border-radius: 50%;
                        background: var(--thumb-color);
                        box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
                        border: 2px solid rgba(255, 255, 255, 0.1);
                        cursor: grab;
                        transition: all 0.15s ease;
                    }
                    input[type='range']::-webkit-slider-thumb:hover {
                        transform: scale(1.1);
                        box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
                    }
                    input[type='range']::-webkit-slider-thumb:active {
                        cursor: grabbing;
                        transform: scale(0.95);
                    }
                `}</style>
            </div>
        </div>
    );
};

interface PatternVisualizerProps {
    startIndex: number;
    maxBoxCount: number;
    boxes: number[];
    onStyleChange: (property: keyof BoxColors['styles'], value: number | boolean) => void;
}

const PatternVisualizer: React.FC<PatternVisualizerProps> = ({ startIndex, maxBoxCount, boxes, onStyleChange }) => {
    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <span className='text-xs font-medium text-gray-400'>Pattern Range</span>
                <span className='font-mono text-xs font-medium text-white/70'>
                    {startIndex} → {startIndex + maxBoxCount - 1}
                </span>
            </div>

            {/* Visualization Container */}
            <div className='relative h-24 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-4'>
                {/* Background bars */}
                <div className='flex h-full items-center'>
                    {Array.from({ length: 38 }).map((_, i) => (
                        <div key={i} className='flex h-full flex-1 items-center px-[0.5px]'>
                            <div
                                className={cn(
                                    'h-8 w-full rounded-sm transition-all duration-200',
                                    i >= startIndex && i < startIndex + maxBoxCount ? 'bg-white/20' : 'bg-[#1a1a1a]'
                                )}
                            />
                        </div>
                    ))}
                </div>

                {/* Selection indicator */}
                <div
                    className='absolute inset-y-0 transition-all duration-200'
                    style={{
                        left: `${(startIndex / 38) * 100}%`,
                        width: `${(maxBoxCount / 38) * 100}%`,
                    }}>
                    {/* Vertical lines */}
                    <div className='absolute inset-y-4 left-0 w-[1px] bg-white/40' />
                    <div className='absolute inset-y-4 right-0 w-[1px] bg-white/40' />

                    {/* Labels */}
                    <div className='absolute -top-3 left-0 -translate-x-1/2 text-center'>
                        <div className='font-mono text-[10px] font-medium text-white/40'>Start</div>
                        <div className='font-mono text-[10px] font-medium text-white/70'>{startIndex}</div>
                    </div>
                    <div className='absolute -top-3 right-0 translate-x-1/2 text-center'>
                        <div className='font-mono text-[10px] font-medium text-white/40'>End</div>
                        <div className='font-mono text-[10px] font-medium text-white/70'>{startIndex + maxBoxCount - 1}</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2 rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-3'>
                    <div className='flex items-center justify-between'>
                        <span className='text-xs font-medium text-gray-400'>Length</span>
                        <span className='font-mono text-xs font-medium text-white/70'>{maxBoxCount}</span>
                    </div>
                    <StyleControl value={maxBoxCount} onChange={(value) => onStyleChange('maxBoxCount', value)} min={2} max={38} step={1} hideLabel />
                </div>

                <div className='space-y-2 rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-3'>
                    <div className='flex items-center justify-between'>
                        <span className='text-xs font-medium text-gray-400'>Start</span>
                        <span className='font-mono text-xs font-medium text-white/70'>{startIndex}</span>
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

const BoxVisualizer: React.FC<BoxVisualizerProps> = ({ borderRadius, shadowIntensity, opacity, showBorder, onStyleChange }) => {
    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <span className='text-xs font-medium text-gray-400'>Box Appearance</span>
            </div>

            {/* Preview Container */}
            <div className='h-auto rounded-lg border border-[#222] bg-[#111]'>
                <div className='relative flex h-full items-center justify-center p-6'>
                    {/* Background grid for better shadow visibility */}

                    {/* Preview Box */}
                    <div
                        className='relative h-40 w-40 border border-white/20 transition-all duration-200'
                        style={{
                            borderRadius: `${borderRadius}px`,
                            boxShadow: `inset 0 0 ${shadowIntensity * 50}px rgba(255, 255, 255, ${shadowIntensity * 0.3})`,
                            backgroundColor: `rgba(255, 255, 255, ${opacity * 0.1})`,
                        }}>
                        {/* Inner gradient for depth effect */}
                        <div
                            className='absolute inset-0 transition-all duration-200'
                            style={{
                                borderRadius: `${borderRadius}px`,
                                background: `radial-gradient(circle at center, transparent, rgba(0, 0, 0, ${shadowIntensity * 0.5}))`,
                            }}
                        />
                    </div>

                    {/* Dynamic Labels */}
                    <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                        <div className='absolute top-2 left-2 rounded-md bg-black/80 px-2 py-1 backdrop-blur-sm' style={{ transform: 'translate(50%, 50%)' }}>
                            <span className='font-mono text-xs text-white/70'>{borderRadius}px</span>
                        </div>

                        <div className='absolute right-2 bottom-2 rounded-md bg-black/80 px-2 py-1 backdrop-blur-sm' style={{ transform: 'translate(-50%, -50%)' }}>
                            <div className='flex items-center gap-1'>
                                <span className='font-mono text-xs text-white/70'>{(shadowIntensity * 100).toFixed(0)}%</span>
                            </div>
                        </div>

                        <div className='absolute top-2 right-2 rounded-md bg-black/80 px-2 py-1 backdrop-blur-sm' style={{ transform: 'translate(-50%, 50%)' }}>
                            <span className='font-mono text-xs text-white/70'>{(opacity * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className='space-y-3 pt-2'>
                <StyleControl label='Border Radius' value={borderRadius} onChange={(value) => onStyleChange('borderRadius', value)} min={0} max={16} step={1} unit='px' />

                <StyleControl label='Shadow Depth' value={shadowIntensity} onChange={(value) => onStyleChange('shadowIntensity', value)} min={0} max={1} step={0.05} />

                <StyleControl label='Opacity' value={opacity} onChange={(value) => onStyleChange('opacity', value)} min={0.01} max={1} step={0.05} />

                <div className='flex items-center justify-between rounded-lg border border-[#222] bg-[#141414] p-3'>
                    <span className='text-xs font-medium text-gray-400'>Show Border</span>
                    <button
                        onClick={() => onStyleChange('showBorder', !showBorder)}
                        className={`relative h-6 w-11 rounded-full transition-colors ${showBorder ? 'bg-white/20' : 'bg-[#222]'}`}>
                        <div className={`absolute top-1 h-4 w-4 rounded-full bg-white/90 transition-all ${showBorder ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const SettingsBar: React.FC<SettingsBarProps> = ({ isOpen, onToggle }) => {
    const { boxColors, updateBoxColors } = useDashboard();
    const [activeSection, setActiveSection] = useState<SettingsSection>(null);

    const handleStyleChange = (property: keyof BoxColors['styles'], value: number | boolean) => {
        updateBoxColors({
            ...boxColors,
            styles: {
                ...boxColors.styles,
                [property]: value,
            },
        });
    };

    return (
        <>
            <div className='fixed bottom-0 left-1/2 z-[1000] h-[90vh] w-screen -translate-x-1/2 bg-black'>
                <div className='absolute -top-4 right-0 left-0 h-20 rounded-[10em] border-t border-[#222] bg-black' />

                <div className='relative z-[96] h-[calc(100%-60px)] w-full overflow-hidden px-4'>
                    <div className='scrollbar-none flex h-full touch-pan-y flex-col overflow-y-scroll scroll-smooth'>
                        <div className='mb-[25vh] space-y-2 pt-2'>
                            <MenuButton label='Colors' isActive={activeSection === 'colors'} onClick={() => setActiveSection(activeSection === 'colors' ? null : 'colors')} />

                            {activeSection === 'colors' && (
                                <div className='space-y-4 px-2 py-3'>
                                    <div className='space-y-2'>
                                        <ColorPicker
                                            label='Positive Color'
                                            color={boxColors.positive}
                                            onChange={(color) =>
                                                updateBoxColors({
                                                    ...boxColors,
                                                    positive: color,
                                                })
                                            }
                                        />
                                        <ColorPicker
                                            label='Negative Color'
                                            color={boxColors.negative}
                                            onChange={(color) =>
                                                updateBoxColors({
                                                    ...boxColors,
                                                    negative: color,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className='relative py-3'>
                                        <div className='absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#222]' />
                                    </div>

                                    <div className='space-y-1'>
                                        <p className='px-1 text-xs font-medium text-gray-500'>Color Presets</p>
                                        <div className='grid grid-cols-1 gap-2'>
                                            {colorPresets.map((preset) => (
                                                <ColorPresetButton
                                                    key={preset.name}
                                                    preset={preset}
                                                    isSelected={boxColors.positive === preset.positive && boxColors.negative === preset.negative}
                                                    onClick={() => {
                                                        updateBoxColors({
                                                            ...boxColors,
                                                            positive: preset.positive,
                                                            negative: preset.negative,
                                                        });
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <MenuButton
                                label='Box Styles'
                                isActive={activeSection === 'boxStyles'}
                                onClick={() => setActiveSection(activeSection === 'boxStyles' ? null : 'boxStyles')}
                            />

                            {activeSection === 'boxStyles' && (
                                <div className='space-y-6 px-2 py-3'>
                                    <PatternVisualizer
                                        startIndex={boxColors.styles?.startIndex ?? 0}
                                        maxBoxCount={boxColors.styles?.maxBoxCount ?? 10}
                                        boxes={[]}
                                        onStyleChange={handleStyleChange}
                                    />

                                    <div className='relative py-3'>
                                        <div className='absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#222]' />
                                    </div>

                                    <BoxVisualizer
                                        borderRadius={boxColors.styles?.borderRadius ?? 8}
                                        shadowIntensity={boxColors.styles?.shadowIntensity ?? 0.25}
                                        opacity={boxColors.styles?.opacity ?? 1}
                                        showBorder={boxColors.styles?.showBorder ?? true}
                                        onStyleChange={handleStyleChange}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
