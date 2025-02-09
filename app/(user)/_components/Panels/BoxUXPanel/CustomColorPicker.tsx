import React, { memo, useCallback } from 'react';
import type { BoxColors } from '@/types/types';

interface CustomColorPickerProps {
    boxColors: BoxColors;
    onColorChange: (colors: BoxColors) => void;
}

interface ColorInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

const ColorInput = memo(({ label, value, onChange }: ColorInputProps) => (
    <div className='group flex flex-col gap-2'>
        <div className='relative h-10 w-full overflow-hidden rounded-lg border border-[#222] bg-[#0C0C0C] transition-all duration-200 hover:border-[#333] hover:bg-[#111]'>
            <div className='absolute inset-0 flex items-center px-3'>
                <span className='font-kodemono text-[10px] font-medium tracking-wider text-[#666] uppercase'>{label}</span>
                <div
                    className='ml-auto h-6 w-6 rounded-full shadow-lg'
                    style={{
                        background: value,
                        boxShadow: `0 0 10px ${value}33`,
                    }}
                />
            </div>
            <input type='color' value={value} onChange={(e) => onChange(e.target.value)} className='h-full w-full cursor-pointer opacity-0' />
        </div>
    </div>
));

export const CustomColorPicker = memo(({ boxColors, onColorChange }: CustomColorPickerProps) => {
    const handlePositiveChange = useCallback(
        (value: string) =>
            onColorChange({
                ...boxColors,
                positive: value,
            }),
        [boxColors, onColorChange]
    );

    const handleNegativeChange = useCallback(
        (value: string) =>
            onColorChange({
                ...boxColors,
                negative: value,
            }),
        [boxColors, onColorChange]
    );

    return (
        <div className='mt-4 flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
                <span className='font-kodemono text-[10px] font-medium tracking-wider text-[#666] uppercase'>Custom Colors</span>
            </div>
            <div className='grid grid-cols-2 gap-3'>
                <ColorInput label='Positive' value={boxColors.positive} onChange={handlePositiveChange} />
                <ColorInput label='Negative' value={boxColors.negative} onChange={handleNegativeChange} />
            </div>
        </div>
    );
});
