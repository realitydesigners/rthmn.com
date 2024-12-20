'use client';
import React, { useState } from 'react';
import { LuChevronRight, LuPipette, LuRotateCcw } from 'react-icons/lu';
import { useDashboard } from '@/providers/DashboardProvider';
import { colorPresets } from '@/utils/localStorage';
import { BoxColors, setBoxColors, setSelectedPairs, DEFAULT_BOX_COLORS } from '@/utils/localStorage';
import { cn } from '@/utils/cn';
import { PatternVisualizer, BoxVisualizer } from './Visualizers';
import { useQueryClient } from '@tanstack/react-query';

type SettingsSection = 'colors' | 'boxStyles' | null;

// Default pairs from DashboardProvider
const defaultPairs = ['GBPUSD', 'USDJPY', 'AUDUSD'];

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

export const SettingsBar = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => {
    const { boxColors, updateBoxColors, togglePair, selectedPairs } = useDashboard();
    const [activeSection, setActiveSection] = useState<SettingsSection>(null);
    const queryClient = useQueryClient();

    const updateColorsAndRefresh = (newColors: BoxColors) => {
        // Update the state in DashboardProvider first
        updateBoxColors(newColors);

        // // Log the current settings
        // console.log('Current Settings:', {
        //     positive: newColors.positive,
        //     negative: newColors.negative,
        //     styles: {
        //         borderRadius: newColors.styles?.borderRadius,
        //         maxBoxCount: newColors.styles?.maxBoxCount,
        //         startIndex: newColors.styles?.startIndex,
        //         shadowIntensity: newColors.styles?.shadowIntensity,
        //         showBorder: newColors.styles?.showBorder,
        //         opacity: newColors.styles?.opacity,
        //     },
        // });

        // Force a refresh of the data
        queryClient.refetchQueries({ queryKey: ['allPairData'] });
    };

    const handleStyleChange = (property: keyof BoxColors['styles'], value: number | boolean) => {
        if (!boxColors.styles) return;
        const newColors = {
            ...boxColors,
            styles: {
                ...boxColors.styles,
                [property]: value,
            },
        };
        updateColorsAndRefresh(newColors);
    };

    const handleColorChange = (type: 'positive' | 'negative', color: string) => {
        const newColors = {
            ...boxColors,
            [type]: color,
        };
        updateColorsAndRefresh(newColors);
    };

    const handlePresetClick = (preset: { positive: string; negative: string }) => {
        const newColors = {
            ...boxColors,
            positive: preset.positive,
            negative: preset.negative,
        };
        updateColorsAndRefresh(newColors);
    };

    const handleResetSettings = () => {
        // Reset to defaults from localStorage.ts
        updateColorsAndRefresh(DEFAULT_BOX_COLORS);

        // Reset selected pairs
        selectedPairs.forEach((pair) => {
            if (!defaultPairs.includes(pair)) {
                togglePair(pair);
            }
        });
        defaultPairs.forEach((pair) => {
            if (!selectedPairs.includes(pair)) {
                togglePair(pair);
            }
        });

        setActiveSection(null);
    };

    return (
        <>
            <div className='fixed inset-0 z-[1000] flex items-center justify-center'>
                <div className='fixed inset-0 bg-black/80 backdrop-blur-sm' onClick={onToggle} />
                <div className='relative z-[1001] w-full max-w-4xl rounded-2xl border border-[#222] bg-black shadow-2xl'>
                    <div className='flex items-center justify-between border-b border-[#222] px-6 py-4'>
                        <h2 className='text-lg font-medium'>Settings</h2>
                        <div className='flex items-center gap-2'>
                            <button
                                onClick={handleResetSettings}
                                className='group flex items-center gap-2 rounded-lg border border-[#333] bg-[#111] px-3 py-2 text-[#818181] transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-500'>
                                <LuRotateCcw size={16} className='transition-transform group-hover:rotate-180' />
                                <span className='text-sm'>Reset All</span>
                            </button>
                            <button onClick={onToggle} className='rounded-lg p-2 text-[#818181] transition-colors hover:bg-white/5 hover:text-white'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='24'
                                    height='24'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'>
                                    <path d='M18 6 6 18' />
                                    <path d='m6 6 12 12' />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className='relative h-[calc(100vh-20rem)] overflow-hidden px-6 py-4'>
                        <div className='scrollbar-none flex h-full touch-pan-y flex-col overflow-y-scroll scroll-smooth'>
                            <div className='space-y-4'>
                                <MenuButton label='Colors' isActive={activeSection === 'colors'} onClick={() => setActiveSection(activeSection === 'colors' ? null : 'colors')} />

                                {activeSection === 'colors' && (
                                    <div className='space-y-4 rounded-xl border border-[#222] bg-[#111] p-4'>
                                        <div className='space-y-2'>
                                            <ColorPicker label='Positive Color' color={boxColors.positive} onChange={(color) => handleColorChange('positive', color)} />
                                            <ColorPicker label='Negative Color' color={boxColors.negative} onChange={(color) => handleColorChange('negative', color)} />
                                        </div>

                                        <div className='relative py-3'>
                                            <div className='absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#222]' />
                                        </div>

                                        <div className='space-y-2'>
                                            <p className='px-1 text-xs font-medium text-gray-500'>Color Presets</p>
                                            <div className='grid grid-cols-2 gap-2'>
                                                {colorPresets.map((preset) => (
                                                    <ColorPresetButton
                                                        key={preset.name}
                                                        preset={preset}
                                                        isSelected={boxColors.positive === preset.positive && boxColors.negative === preset.negative}
                                                        onClick={() => handlePresetClick(preset)}
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
                                    <div className='space-y-6 rounded-xl border border-[#222] bg-[#111] p-4'>
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
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
