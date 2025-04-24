import type { Preset } from '@/stores/presetStore';
import type { BoxColors } from '@/types/types';
import { cn } from '@/utils/cn';
import React, { memo } from 'react';

interface ColorPresetsProps {
    fullPresets: Preset[];
    boxColors: BoxColors;
    onPresetClick: (preset: Preset) => void;
    isPresetSelected: (preset: Preset) => boolean;
}

const PresetButton = memo(
    ({ preset, isSelected, onClick }: { preset: Preset; isSelected: boolean; onClick: () => void }) => (
        <button
            onClick={onClick}
            className={cn(
                'group relative flex h-[72px] flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border bg-gradient-to-b p-2 transition-all duration-200',
                isSelected
                    ? 'border-[#333] from-[#181818]/80 to-[#0F0F0F]/90 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-[#444] hover:from-[#1c1c1c]/80 hover:to-[#141414]/90'
                    : 'border-[#222] from-[#141414]/30 to-[#0A0A0A]/40 hover:border-[#333] hover:from-[#181818]/40 hover:to-[#0F0F0F]/50'
            )}
            style={{
                backgroundImage: `radial-gradient(circle at 30% 30%, ${preset.positive}${isSelected ? '11' : '05'}, ${preset.negative}${isSelected ? '22' : '08'})`,
                backdropFilter: 'blur(20px)',
            }}
        >
            {/* Background gradient overlay */}
            <div
                className={cn('absolute inset-0', isSelected ? 'opacity-50' : 'opacity-20')}
                style={{
                    background: `radial-gradient(circle at 30% 30%, ${preset.positive}${isSelected ? '22' : '11'}, ${preset.negative}${isSelected ? '33' : '15'})`,
                }}
            />

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
            <div className='relative flex flex-col items-center'>
                <span className='font-kodemono text-[8px] font-medium tracking-widest text-[#666] uppercase transition-colors group-hover:text-[#818181]'>
                    {preset.name}
                </span>
            </div>
        </button>
    )
);

export const ColorPresets = memo(({ fullPresets, boxColors, onPresetClick, isPresetSelected }: ColorPresetsProps) => {
    return (
        <div className='grid grid-cols-3 gap-2'>
            {fullPresets.map((preset) => (
                <PresetButton
                    key={preset.name}
                    preset={preset}
                    isSelected={isPresetSelected(preset)}
                    onClick={() => onPresetClick(preset)}
                />
            ))}
        </div>
    );
});
