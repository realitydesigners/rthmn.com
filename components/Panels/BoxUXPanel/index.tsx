'use client';

import React, { useState, useCallback } from 'react';
import { BoxVisualizer } from '@/components/Panels/PanelComponents/BoxVisualizer';
import { ColorPresets } from './ColorPresets';
import { CustomColorPicker } from './CustomColorPicker';
import { useUser } from '@/providers/UserProvider';
import { usePresetStore } from '@/stores/presetStore';
import type { BoxColors } from '@/stores/colorStore';

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
        [boxColors.positive, boxColors.negative, boxColors.styles?.borderRadius, boxColors.styles?.shadowIntensity, boxColors.styles?.opacity, boxColors.styles?.showBorder]
    );
};

// Memoized preset click handler
const useHandlePresetClick = (updateBoxColors: (colors: BoxColors) => void, boxColors: BoxColors) => {
    return useCallback(
        (preset: any) => {
            updateBoxColors({
                positive: preset.positive,
                negative: preset.negative,
                styles: {
                    ...boxColors.styles,
                    borderRadius: preset.styles.borderRadius,
                    shadowIntensity: preset.styles.shadowIntensity,
                    opacity: preset.styles.opacity,
                    showBorder: preset.styles.showBorder,
                    showLineChart: preset.styles.showLineChart,
                    globalTimeframeControl: boxColors.styles?.globalTimeframeControl ?? false,
                },
            });
        },
        [updateBoxColors, boxColors.styles?.globalTimeframeControl]
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
    const [showColors, setShowColors] = useState(true);
    const [showBoxStyle, setShowBoxStyle] = useState(true);

    const handleStyleChange = useHandleStyleChange(boxColors, updateBoxColors);
    const handleFullPresetClick = useHandlePresetClick(updateBoxColors, boxColors);
    const isFullPresetSelected = useIsPresetSelected(boxColors);

    return (
        <div className='flex h-full flex-col'>
            <div className='flex flex-1 flex-col gap-4'>
                {/* Colors Section */}
                <div className='flex flex-col gap-2'>
                    {showColors && (
                        <>
                            <ColorPresets fullPresets={presets} boxColors={boxColors} onPresetClick={handleFullPresetClick} isPresetSelected={isFullPresetSelected} />
                            <CustomColorPicker boxColors={boxColors} onColorChange={updateBoxColors} />
                        </>
                    )}
                </div>

                {/* Box Style Section */}
                <div className='flex flex-col gap-2'>
                    {showBoxStyle && (
                        <BoxVisualizer
                            borderRadius={boxColors.styles?.borderRadius ?? 8}
                            shadowIntensity={boxColors.styles?.shadowIntensity ?? 0.25}
                            opacity={boxColors.styles?.opacity ?? 1}
                            showBorder={boxColors.styles?.showBorder ?? true}
                            onStyleChange={handleStyleChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
