'use client';

import { useUser } from '@/providers/UserProvider';
import { usePresetStore, type BoxColors } from '@/stores/colorStore';
import React, { useCallback } from 'react';
import { ColorStyleOptions } from '../PanelComponents/ColorStyleOptions';
import { BoxVisualizer } from '../PanelComponents/BoxVisualizer';

// Memoized preset comparison function
const useIsPresetSelected = (boxColors: BoxColors) => {
    return useCallback(
        (preset: any) => {
            return (
                boxColors.positive === preset.positive &&
                boxColors.negative === preset.negative &&
                boxColors.styles?.borderRadius === preset.styles.borderRadius &&
                boxColors.styles?.shadowIntensity === preset.styles.shadowIntensity &&
                boxColors.styles?.opacity === preset.styles.opacity &&
                boxColors.styles?.showBorder === preset.styles.showBorder
            );
        },
        [
            boxColors.positive,
            boxColors.negative,
            boxColors.styles?.borderRadius,
            boxColors.styles?.shadowIntensity,
            boxColors.styles?.opacity,
            boxColors.styles?.showBorder,
        ]
    );
};

// Memoized style change handler
const useHandleStyleChange = (boxColors: BoxColors, updateBoxColors: (colors: BoxColors) => void) => {
    return useCallback(
        (property: keyof BoxColors['styles'], value: number | boolean) => {
            if (!boxColors.styles) return;
            updateBoxColors({
                ...boxColors,
                styles: {
                    ...boxColors.styles,
                    [property]: value,
                },
            });
        },
        [boxColors, updateBoxColors]
    );
};

export const SettingsBar = () => {
    const { boxColors, updateBoxColors } = useUser();
    const presets = usePresetStore((state) => state.presets);
    const isFullPresetSelected = useIsPresetSelected(boxColors);
    const handleStyleChange = useHandleStyleChange(boxColors, updateBoxColors);

    return (
        <div className='flex h-full flex-col'>
            <div className='flex flex-1 flex-col gap-4'>
                {/* Color Style Section */}
                <ColorStyleOptions
                    boxColors={boxColors}
                    presets={presets}
                    onColorChange={updateBoxColors}
                    isPresetSelected={isFullPresetSelected}
                />

                {/* Box Style Section */}
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
