'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { LuRotateCcw, LuChevronDown, LuChevronUp, LuBox, LuLayoutGrid } from 'react-icons/lu';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { fullPresets, type FullPreset } from '@/utils/localStorage';
import { BoxColors, DEFAULT_BOX_COLORS, DEFAULT_PAIRS } from '@/utils/localStorage';
import { cn } from '@/utils/cn';
import { PatternVisualizer, BoxVisualizer } from './Visualizers';
import { getTimeframeRange } from '@/utils/timeframe';

const useDebounce = (value: any, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const FullPresetButton = ({ preset, isSelected, onClick }: { preset: FullPreset; isSelected: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            'group relative flex h-[72px] flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border bg-gradient-to-b p-2 transition-all duration-200',
            isSelected
                ? 'border-[#333] from-[#181818] to-[#0F0F0F] shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-[#444] hover:from-[#1c1c1c] hover:to-[#141414]'
                : 'border-[#222] from-[#141414] to-[#0A0A0A] hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]'
        )}>
        {/* Main gradient preview */}
        <div className='relative h-8 w-8 overflow-hidden rounded-full shadow-xl'>
            <div
                className='absolute inset-0 transition-transform duration-200 group-hover:scale-110'
                style={{
                    background: `radial-gradient(circle at 30% 30%, ${preset.positive}, ${preset.negative})`,
                    boxShadow: `
                        inset 0 0 15px ${preset.positive}66,
                        inset 2px 2px 4px ${preset.positive}33,
                        0 0 20px ${preset.positive}22
                    `,
                }}
            />
        </div>

        {/* Content */}
        <div className='relative flex items-center gap-1.5'>
            <span className='font-kodemono text-[9px] font-medium tracking-widest text-[#666] uppercase transition-colors group-hover:text-[#818181]'>{preset.name}</span>
            {isSelected && <div className='h-1 w-1 rounded-full bg-blue-400/80 ring-1 shadow-[0_0_10px_rgba(96,165,250,0.5)] ring-blue-400/20' />}
        </div>
    </button>
);

export const SettingsBar = () => {
    const { boxColors, updateBoxColors, togglePair, selectedPairs } = useDashboard();
    const [mounted, setMounted] = useState(false);
    const [localBoxColors, setLocalBoxColors] = useState(boxColors);
    const [showColors, setShowColors] = useState(true);
    const [showPattern, setShowPattern] = useState(true);
    const [showBoxStyle, setShowBoxStyle] = useState(true);

    const debouncedBoxColors = useDebounce(localBoxColors, 150);

    // Calculate timeframe range based on current settings
    const timeframeRange = useMemo(() => {
        const startIndex = localBoxColors.styles?.startIndex ?? 0;
        const maxBoxCount = localBoxColors.styles?.maxBoxCount ?? 10;
        return getTimeframeRange(startIndex, startIndex + maxBoxCount);
    }, [localBoxColors.styles?.startIndex, localBoxColors.styles?.maxBoxCount]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            updateBoxColors(debouncedBoxColors);
        }
    }, [debouncedBoxColors, mounted, updateBoxColors]);

    // Don't render anything until mounted to prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    const handleStyleChange = (property: keyof BoxColors['styles'], value: number | boolean) => {
        if (!localBoxColors.styles) return;
        setLocalBoxColors((prev) => ({
            ...prev,
            styles: {
                ...prev.styles,
                [property]: value,
            },
        }));
    };

    const handleFullPresetClick = (preset: FullPreset) => {
        setLocalBoxColors({
            positive: preset.positive,
            negative: preset.negative,
            styles: preset.styles,
        });
    };

    const handleResetSettings = () => {
        setLocalBoxColors(DEFAULT_BOX_COLORS);
        selectedPairs.forEach((pair) => {
            if (!DEFAULT_PAIRS.includes(pair)) {
                togglePair(pair);
            }
        });
        DEFAULT_PAIRS.forEach((pair) => {
            if (!selectedPairs.includes(pair)) {
                togglePair(pair);
            }
        });
    };

    const isFullPresetSelected = (preset: FullPreset) => {
        return (
            localBoxColors.positive === preset.positive &&
            localBoxColors.negative === preset.negative &&
            localBoxColors.styles?.borderRadius === preset.styles.borderRadius &&
            localBoxColors.styles?.maxBoxCount === preset.styles.maxBoxCount &&
            localBoxColors.styles?.shadowIntensity === preset.styles.shadowIntensity &&
            localBoxColors.styles?.opacity === preset.styles.opacity &&
            localBoxColors.styles?.showBorder === preset.styles.showBorder
        );
    };

    return (
        <div className='flex h-full flex-col'>
            <div className='flex-1 overflow-y-visible'>
                <div className='flex flex-col gap-2'>
                    {/* Colors Section Toggle */}
                    <div className='flex flex-col gap-2'>
                        <button
                            onClick={() => setShowColors(!showColors)}
                            className='group flex h-10 items-center justify-between rounded-lg border border-[#222] px-3 transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]'>
                            <div className='flex items-center gap-3'>
                                <div className='relative h-6 w-6 overflow-hidden rounded-full shadow-xl'>
                                    <div
                                        className='absolute inset-0'
                                        style={{
                                            background: `radial-gradient(circle at 30% 30%, ${localBoxColors.positive}, ${localBoxColors.negative})`,
                                            boxShadow: `
                                                inset 0 0 15px ${localBoxColors.positive}66,
                                                inset 2px 2px 4px ${localBoxColors.positive}33,
                                                0 0 20px ${localBoxColors.positive}22
                                            `,
                                        }}
                                    />
                                </div>
                                <span className='font-kodemono text-[10px] font-medium tracking-widest text-[#818181] uppercase transition-colors group-hover:text-white'>
                                    Colors
                                </span>
                            </div>
                            {showColors ? (
                                <LuChevronUp size={14} className='text-[#666] transition-colors group-hover:text-white' />
                            ) : (
                                <LuChevronDown size={14} className='text-[#666] transition-colors group-hover:text-white' />
                            )}
                        </button>

                        {/* Full Presets Grid */}
                        {showColors && (
                            <div className='grid grid-cols-3 gap-2'>
                                {fullPresets.map((preset) => (
                                    <FullPresetButton key={preset.name} preset={preset} isSelected={isFullPresetSelected(preset)} onClick={() => handleFullPresetClick(preset)} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Box Styles Section */}
                    <div className='flex flex-col gap-2'>
                        {/* Pattern Section */}
                        <div className='flex flex-col gap-2'>
                            <button
                                onClick={() => setShowPattern(!showPattern)}
                                className='group flex h-10 items-center justify-between rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] px-3 transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]'>
                                <div className='flex items-center gap-3'>
                                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#181818] to-[#0F0F0F] shadow-xl'>
                                        <LuLayoutGrid size={14} className='text-[#666] transition-colors group-hover:text-white' />
                                    </div>
                                    <span className='font-kodemono text-[10px] font-medium tracking-widest text-[#818181] uppercase transition-colors group-hover:text-white'>
                                        Pattern
                                    </span>
                                </div>
                                {showPattern ? (
                                    <LuChevronUp size={14} className='text-[#666] transition-colors group-hover:text-white' />
                                ) : (
                                    <LuChevronDown size={14} className='text-[#666] transition-colors group-hover:text-white' />
                                )}
                            </button>

                            {showPattern && (
                                <>
                                    <div className='flex items-center justify-between px-1 py-2'>
                                        <div className='space-y-1'>
                                            <span className='text-[10px] font-medium tracking-wider text-white/50 uppercase'>Global Control</span>
                                        </div>
                                        <button
                                            onClick={() => handleStyleChange('globalTimeframeControl', !localBoxColors.styles?.globalTimeframeControl)}
                                            className={`relative h-6 w-11 rounded-full transition-all duration-300 ${
                                                localBoxColors.styles?.globalTimeframeControl ? 'bg-white/20' : 'bg-white/[0.03]'
                                            }`}>
                                            <div
                                                className={`absolute top-1 h-4 w-4 rounded-full transition-all duration-300 ${
                                                    localBoxColors.styles?.globalTimeframeControl ? 'left-6 bg-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'left-1 bg-white/50'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <PatternVisualizer
                                        startIndex={localBoxColors.styles?.startIndex ?? 0}
                                        maxBoxCount={localBoxColors.styles?.maxBoxCount ?? 10}
                                        boxes={[]}
                                        onStyleChange={handleStyleChange}
                                        timeframeRange={timeframeRange}
                                    />
                                </>
                            )}
                        </div>

                        {/* Box Style Section */}
                        <div className='flex flex-col gap-2'>
                            <button
                                onClick={() => setShowBoxStyle(!showBoxStyle)}
                                className='group flex h-10 items-center justify-between rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] px-3 transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]'>
                                <div className='flex items-center gap-3'>
                                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#181818] to-[#0F0F0F] shadow-xl'>
                                        <LuBox size={14} className='text-[#666] transition-colors group-hover:text-white' />
                                    </div>
                                    <span className='font-kodemono text-[10px] font-medium tracking-widest text-[#818181] uppercase transition-colors group-hover:text-white'>
                                        Box Style
                                    </span>
                                </div>
                                {showBoxStyle ? (
                                    <LuChevronUp size={14} className='text-[#666] transition-colors group-hover:text-white' />
                                ) : (
                                    <LuChevronDown size={14} className='text-[#666] transition-colors group-hover:text-white' />
                                )}
                            </button>

                            {showBoxStyle && (
                                <BoxVisualizer
                                    borderRadius={localBoxColors.styles?.borderRadius ?? 8}
                                    shadowIntensity={localBoxColors.styles?.shadowIntensity ?? 0.25}
                                    opacity={localBoxColors.styles?.opacity ?? 1}
                                    showBorder={localBoxColors.styles?.showBorder ?? true}
                                    onStyleChange={handleStyleChange}
                                />
                            )}
                        </div>
                    </div>

                    <div className='flex h-12 items-center justify-between'>
                        <button
                            onClick={handleResetSettings}
                            className='group flex h-7 items-center gap-1.5 rounded-md border border-[#333] bg-gradient-to-b from-[#111] to-[#0A0A0A] px-2 text-[#818181] transition-all hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-500'>
                            <LuRotateCcw size={12} className='transition-transform group-hover:rotate-180' />
                            <span className='text-[11px] font-medium'>Reset</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
