'use client';

import { useUser } from '@/providers/UserProvider';
import type { BoxColors } from '@/stores/colorStore';
import React, { useCallback } from 'react';
import { ColorStyleOptions } from '../PanelComponents/ColorStyleOptions';
import { BoxVisualizer } from '../PanelComponents/BoxVisualizer';

// Memoized style change handler
const useHandleStyleChange = (boxColors: BoxColors, updateBoxColors: (colors: Partial<BoxColors>) => void) => {
    return useCallback(
        (property: keyof BoxColors['styles'], value: number | boolean) => {
            if (!boxColors.styles) return;
            updateBoxColors({
                styles: {
                    ...boxColors.styles,
                    [property]: value,
                },
            });
        },
        [boxColors.styles, updateBoxColors]
    );
};

export const BoxUXPanel = () => {
    const { boxColors, updateBoxColors } = useUser();
    const handleStyleChange = useHandleStyleChange(boxColors, updateBoxColors);

    return (
        <div className='flex h-full flex-col'>
            <div className='flex flex-1 flex-col gap-4'>
                <ColorStyleOptions />
                <BoxVisualizer
                    borderRadius={boxColors.styles?.borderRadius ?? 8}
                    shadowIntensity={boxColors.styles?.shadowIntensity ?? 0.25}
                    opacity={boxColors.styles?.opacity ?? 1}
                    showBorder={boxColors.styles?.showBorder ?? true}
                    onStyleChange={handleStyleChange}
                />
            </div>
        </div>
    );
};
