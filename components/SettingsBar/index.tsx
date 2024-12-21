'use client';
import React, { useState, useEffect } from 'react';
import { LuChevronRight, LuPipette, LuRotateCcw } from 'react-icons/lu';
import { useDashboard } from '@/providers/DashboardProvider';
import { colorPresets, fullPresets, type FullPreset } from '@/utils/localStorage';
import { BoxColors, DEFAULT_BOX_COLORS, DEFAULT_PAIRS } from '@/utils/localStorage';
import { cn } from '@/utils/cn';
import { PatternVisualizer, BoxVisualizer } from './Visualizers';

const ColorPicker = ({ label, color, onChange }: { label: string; color: string; onChange: (color: string) => void }) => (
    <div className='group relative flex h-8 items-center justify-between rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] px-2.5 transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]'>
        <div className='flex items-center gap-2'>
            <div className='relative'>
                <div
                    className='h-5 w-5 rounded-full shadow-lg transition-transform group-hover:scale-105'
                    style={{
                        background: `linear-gradient(45deg, ${color}, ${color}dd)`,
                        boxShadow: `0 0 10px ${color}33`,
                    }}
                />
                <LuPipette className='absolute -right-1 -bottom-1 h-2.5 w-2.5 text-gray-500' />
            </div>
            <span className='font-mono text-[11px] font-medium tracking-wide text-gray-400 group-hover:text-gray-300'>{label}</span>
        </div>
        <input type='color' value={color} onChange={(e) => onChange(e.target.value)} className='invisible absolute h-5 w-5 cursor-pointer group-hover:visible' />
    </div>
);

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
        <div className='relative h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-xl'>
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
            <div className='flex items-center gap-2 text-[10px] tracking-wider text-gray-500'>
                <span>{preset.styles.maxBoxCount}×</span>
                <span>•</span>
                <span>{preset.styles.borderRadius}r</span>
                <span>•</span>
                <span>{Math.round(preset.styles.opacity * 100)}%</span>
            </div>
        </div>
    </button>
);

export const SettingsBar = () => {
    const { boxColors, updateBoxColors, togglePair, selectedPairs } = useDashboard();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render anything until mounted to prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    const handleStyleChange = (property: keyof BoxColors['styles'], value: number | boolean) => {
        if (!boxColors.styles) return;
        const newColors = {
            ...boxColors,
            styles: {
                ...boxColors.styles,
                [property]: value,
            },
        };
        updateBoxColors(newColors);
    };

    const handleColorChange = (type: 'positive' | 'negative', color: string) => {
        const newColors = {
            ...boxColors,
            [type]: color,
        };
        updateBoxColors(newColors);
    };

    const handlePresetClick = (preset: { positive: string; negative: string }) => {
        updateBoxColors({
            ...boxColors,
            positive: preset.positive,
            negative: preset.negative,
        });
    };

    const handleResetSettings = () => {
        updateBoxColors(DEFAULT_BOX_COLORS);
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

    const handleFullPresetClick = (preset: FullPreset) => {
        updateBoxColors({
            positive: preset.positive,
            negative: preset.negative,
            styles: preset.styles,
        });
    };

    const isFullPresetSelected = (preset: FullPreset) => {
        return (
            boxColors.positive === preset.positive &&
            boxColors.negative === preset.negative &&
            boxColors.styles?.borderRadius === preset.styles.borderRadius &&
            boxColors.styles?.maxBoxCount === preset.styles.maxBoxCount &&
            boxColors.styles?.shadowIntensity === preset.styles.shadowIntensity &&
            boxColors.styles?.opacity === preset.styles.opacity &&
            boxColors.styles?.showBorder === preset.styles.showBorder
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
                        <div className='mb-2 flex items-center gap-2'>
                            <h3 className='text-[11px] font-medium text-gray-400'>Presets</h3>
                            <div className='h-px flex-1 bg-gradient-to-r from-blue-500/20 to-transparent' />
                        </div>
                        <div className='grid grid-cols-2 gap-2'>
                            {fullPresets.map((preset) => (
                                <FullPresetButton key={preset.name} preset={preset} isSelected={isFullPresetSelected(preset)} onClick={() => handleFullPresetClick(preset)} />
                            ))}
                        </div>
                    </div>

                    {/* Box Styles Section */}
                    <div>
                        <div className='mb-2 flex items-center gap-2'>
                            <h3 className='text-[11px] font-medium text-gray-400'>Box Styles</h3>
                            <div className='h-px flex-1 bg-gradient-to-r from-blue-500/20 to-transparent' />
                        </div>
                        <div className='p-2.5'>
                            <PatternVisualizer
                                startIndex={boxColors.styles?.startIndex ?? 0}
                                maxBoxCount={boxColors.styles?.maxBoxCount ?? 10}
                                boxes={[]}
                                onStyleChange={handleStyleChange}
                            />
                            <BoxVisualizer
                                borderRadius={boxColors.styles?.borderRadius ?? 8}
                                shadowIntensity={boxColors.styles?.shadowIntensity ?? 0.25}
                                opacity={boxColors.styles?.opacity ?? 1}
                                showBorder={boxColors.styles?.showBorder ?? true}
                                onStyleChange={handleStyleChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
