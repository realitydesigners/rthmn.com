import React, { memo, useCallback, useState } from 'react';
import { LuBox } from 'react-icons/lu';
import { StyleControl } from '@/components/Panels/PanelComponents/StyleControl';
import { Toggle } from '@/components/Panels/PanelComponents/Toggle/Toggle';
import { PanelSection } from '@/components/Panels/PanelComponents/PanelSection';
import { cn } from '@/utils/cn';
import { useTimeframeStore } from '@/stores/timeframeStore';

type BoxStyleProperty = 'borderRadius' | 'shadowIntensity' | 'opacity' | 'showBorder';

interface BoxVisualizerProps {
    borderRadius: number;
    shadowIntensity: number;
    opacity: number;
    showBorder: boolean;
    onStyleChange: (property: BoxStyleProperty, value: number | boolean) => void;
}

export const BoxVisualizer = memo(
    ({ borderRadius, shadowIntensity, opacity, showBorder, onStyleChange }: BoxVisualizerProps) => {
        const [isExpanded, setIsExpanded] = useState(true);
        const globalSettings = useTimeframeStore((state) => state.global.settings);
        const togglePriceLines = useTimeframeStore((state) => state.togglePriceLines);

        const handleBorderRadiusChange = useCallback(
            (value: number) => onStyleChange('borderRadius', value),
            [onStyleChange]
        );

        const handleShadowIntensityChange = useCallback(
            (value: number) => onStyleChange('shadowIntensity', value),
            [onStyleChange]
        );

        const handleOpacityChange = useCallback((value: number) => onStyleChange('opacity', value), [onStyleChange]);

        const handleBorderToggle = useCallback(
            () => onStyleChange('showBorder', !showBorder),
            [onStyleChange, showBorder]
        );

        return (
            <PanelSection
                title='Box Style'
                icon={LuBox}
                isExpanded={isExpanded}
                onToggle={() => setIsExpanded(!isExpanded)}
            >
                <div className='flex flex-col gap-2'>
                    {/* Preview Container */}
                    <div className='group relative flex flex-col overflow-hidden rounded-lg transition-all duration-300'>
                        <div className='relative flex flex-col rounded-lg'>
                            {/* Grid background */}
                            <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]' />

                            <div className='relative flex h-full items-center justify-center p-8'>
                                {/* Preview Box */}
                                <div
                                    className={cn(
                                        'relative h-24 w-24 transition-all duration-300',
                                        showBorder && 'border border-white/[0.02]'
                                    )}
                                    style={{
                                        borderRadius: `${borderRadius}px`,
                                        boxShadow: `
                                            inset 0 0 ${shadowIntensity * 50}px rgba(255, 255, 255, ${shadowIntensity * 0.3}),
                                            0 0 20px rgba(255, 255, 255, 0.05)
                                        `,
                                        backgroundColor: `rgba(255, 255, 255, ${opacity * 0.1})`,
                                    }}
                                >
                                    <div
                                        className='absolute inset-0 transition-all duration-300'
                                        style={{
                                            borderRadius: `${borderRadius}px`,
                                            background: `
                                                radial-gradient(circle at center, 
                                                    rgba(255, 255, 255, ${opacity * 0.05}),
                                                    transparent 70%
                                                )
                                            `,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controls Container */}
                    <div className='flex flex-col gap-2 p-4'>
                        <StyleControl
                            label='Border Radius'
                            value={borderRadius}
                            onChange={handleBorderRadiusChange}
                            min={0}
                            max={16}
                            step={1}
                            unit='px'
                        />
                        <StyleControl
                            label='Shadow Depth'
                            value={shadowIntensity}
                            onChange={handleShadowIntensityChange}
                            min={0}
                            max={1}
                            step={0.05}
                        />
                        <StyleControl
                            label='Opacity'
                            value={opacity}
                            onChange={handleOpacityChange}
                            min={0.01}
                            max={1}
                            step={0.05}
                        />

                        <div className='flex flex-col gap-2 px-1 py-2'>
                            <Toggle
                                isEnabled={showBorder}
                                onToggle={handleBorderToggle}
                                size='sm'
                                title='Show Border'
                            />
                            <Toggle
                                isEnabled={globalSettings.showPriceLines}
                                onToggle={() => togglePriceLines()}
                                size='sm'
                                title='Show Price Lines'
                            />
                        </div>
                    </div>
                </div>
            </PanelSection>
        );
    }
);

BoxVisualizer.displayName = 'BoxVisualizer';
