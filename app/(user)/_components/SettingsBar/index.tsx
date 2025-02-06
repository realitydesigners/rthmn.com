'use client';

import React, { useState } from 'react';
import { useUser } from '@/providers/UserProvider';
import type { BoxColors } from '@/types/types';
import { BoxVisualizer } from '@/app/(user)/_components/SidebarRight/BoxVisualizer';
import { ColorPresets } from './ColorPresets';
import { CustomColorPicker } from './CustomColorPicker';

export const SettingsBar = () => {
    const { boxColors, updateBoxColors, fullPresets } = useUser();
    const [showColors, setShowColors] = useState(true);
    const [showBoxStyle, setShowBoxStyle] = useState(true);

    const handleStyleChange = (property: keyof BoxColors['styles'], value: number | boolean) => {
        if (!boxColors.styles) return;
        updateBoxColors({
            ...boxColors,
            styles: {
                ...boxColors.styles,
                [property]: value,
            },
        });
    };

    const handleFullPresetClick = (preset: any) => {
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
    };

    const isFullPresetSelected = (preset: any) => {
        return (
            boxColors.positive === preset.positive &&
            boxColors.negative === preset.negative &&
            boxColors.styles?.borderRadius === preset.styles.borderRadius &&
            boxColors.styles?.shadowIntensity === preset.styles.shadowIntensity &&
            boxColors.styles?.opacity === preset.styles.opacity &&
            boxColors.styles?.showBorder === preset.styles.showBorder
        );
    };

    return (
        <div className='flex h-full flex-col'>
            <div className='flex flex-1 flex-col gap-4'>
                {/* Colors Section */}
                <div className='flex flex-col gap-2'>
                    {showColors && (
                        <>
                            <ColorPresets fullPresets={fullPresets} boxColors={boxColors} onPresetClick={handleFullPresetClick} isPresetSelected={isFullPresetSelected} />
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
