'use client';
import React, { useState, useEffect } from 'react';
import { LuRotateCcw } from 'react-icons/lu';
import { useDashboard } from '@/providers/DashboardProvider';
import { fullPresets, type FullPreset } from '@/utils/localStorage';
import { BoxColors, DEFAULT_BOX_COLORS, DEFAULT_PAIRS } from '@/utils/localStorage';
import { cn } from '@/utils/cn';
import { PatternVisualizer, BoxVisualizer } from './Visualizers';

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
            'group relative flex h-16 items-center gap-3 overflow-hidden rounded-lg border border-[#222] p-3 text-left transition-all hover:border-[#333]',
            isSelected ? 'from-[#181818] to-[#0A0A0A] shadow-[0_0_30px_rgba(0,0,0,0.5)]' : 'from-[#141414] to-[#0A0A0A]'
        )}
        style={{
            backgroundImage: isSelected ? `linear-gradient(135deg, #181818, #0A0A0A)` : `linear-gradient(135deg, ${preset.positive}11, ${preset.negative}11)`,
        }}>
        {/* Main gradient preview */}
        <div className='relative h-8 w-8 shrink-0 overflow-hidden rounded-full shadow-xl'>
            <div
                className='absolute inset-0 transition-transform group-hover:scale-110'
                style={{
                    background: `radial-gradient(circle at 30% 30%, ${preset.positive}, ${preset.negative})`,
                    boxShadow: `
                        inset 0 0 15px ${preset.positive}66,
                        inset 2px 2px 4px ${preset.positive}33,
                        0 0 20px ${preset.positive}22
                    `,
                }}
            />
            <div
                className='absolute inset-0 opacity-60'
                style={{
                    background: `conic-gradient(from 225deg at 40% 40%, transparent 0deg, ${preset.positive}22 90deg, transparent 180deg)`,
                }}
            />
        </div>

        {/* Content */}
        <div className='relative flex flex-1 flex-col justify-between gap-1'>
            <div className='flex items-center justify-between'>
                <span className='font-mono text-xs font-medium tracking-wider text-gray-300 group-hover:text-white'>{preset.name}</span>
                {isSelected && <div className='h-1.5 w-1.5 rounded-full bg-blue-400/80 ring-2 shadow-[0_0_10px_rgba(96,165,250,0.5)] ring-blue-400/20' />}
            </div>
        </div>
    </button>
);

export const SettingsBar = () => {
    const { boxColors, updateBoxColors, togglePair, selectedPairs } = useDashboard();
    const [mounted, setMounted] = useState(false);
    const [localBoxColors, setLocalBoxColors] = useState(boxColors);

    const debouncedBoxColors = useDebounce(localBoxColors, 150);

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
            <div className='flex h-12 items-center justify-between border-b border-[#222] px-3'>
                <div className='flex items-center gap-2'>
                    <h2 className='text-sm font-medium'>Settings</h2>
                    <div className='h-1 w-1 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' />
                </div>
                <button
                    onClick={handleResetSettings}
                    className='group flex h-7 items-center gap-1.5 rounded-md border border-[#333] bg-gradient-to-b from-[#111] to-[#0A0A0A] px-2 text-[#818181] transition-all hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-500'>
                    <LuRotateCcw size={12} className='transition-transform group-hover:rotate-180' />
                    <span className='text-[11px] font-medium'>Reset</span>
                </button>
            </div>

            <div className='scrollbar-none flex-1 touch-pan-y overflow-y-scroll scroll-smooth p-3'>
                <div className='space-y-4'>
                    {/* Full Presets Section */}
                    <div>
                        <div className='grid grid-cols-2 gap-2'>
                            {fullPresets.map((preset) => (
                                <FullPresetButton key={preset.name} preset={preset} isSelected={isFullPresetSelected(preset)} onClick={() => handleFullPresetClick(preset)} />
                            ))}
                        </div>
                    </div>

                    {/* Box Styles Section */}
                    <div>
                        <PatternVisualizer
                            startIndex={localBoxColors.styles?.startIndex ?? 0}
                            maxBoxCount={localBoxColors.styles?.maxBoxCount ?? 10}
                            boxes={[]}
                            onStyleChange={handleStyleChange}
                        />
                        <BoxVisualizer
                            borderRadius={localBoxColors.styles?.borderRadius ?? 8}
                            shadowIntensity={localBoxColors.styles?.shadowIntensity ?? 0.25}
                            opacity={localBoxColors.styles?.opacity ?? 1}
                            showBorder={localBoxColors.styles?.showBorder ?? true}
                            onStyleChange={handleStyleChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
