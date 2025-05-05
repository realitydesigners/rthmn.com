'use client';
import { useTimeframeStore } from '@/stores/timeframeStore';
import React, { useCallback, useState } from 'react';
import { LuLineChart, LuLayoutGrid } from 'react-icons/lu';
import { ChartStyleOptions } from '../../Charts/ChartStyleOptions';
import { TimeFrameSlider } from '../PanelComponents/TimeFrameSlider';
import { PanelSection } from '../PanelComponents/PanelSection';

export const BoxDataPanel = () => {
    const [showTimeframe, setShowTimeframe] = useState(true);
    const [showChartStyle, setShowChartStyle] = useState(true);

    // Get state from stores
    const globalSettings = useTimeframeStore((state) => state.global.settings);
    const updateGlobalSettings = useTimeframeStore((state) => state.updateGlobalSettings);
    const startGlobalDrag = useTimeframeStore((state) => state.startGlobalDrag);
    const endGlobalDrag = useTimeframeStore((state) => state.endGlobalDrag);

    const handleTimeframeChange = useCallback(
        (property: string, value: number | boolean) => {
            updateGlobalSettings({ [property]: value });
        },
        [updateGlobalSettings]
    );

    return (
        <div className='no-select flex h-full flex-col'>
            <div className='flex-1 overflow-y-visible'>
                <div className='flex flex-col gap-2'>
                    {/* Chart Style Section */}
                    <PanelSection
                        title='Chart Style'
                        icon={LuLineChart}
                        isExpanded={showChartStyle}
                        onToggle={() => setShowChartStyle(!showChartStyle)}
                    >
                        <div className='p-2'>
                            <ChartStyleOptions noContainer className='w-full' />
                        </div>
                    </PanelSection>

                    {/* Timeframe Section */}
                    <PanelSection
                        title='Timeframe'
                        icon={LuLayoutGrid}
                        isExpanded={showTimeframe}
                        onToggle={() => setShowTimeframe(!showTimeframe)}
                    >
                        <div className='relative h-full w-full p-2 py-2'>
                            <TimeFrameSlider
                                startIndex={globalSettings.startIndex}
                                maxBoxCount={globalSettings.maxBoxCount}
                                boxes={[]}
                                onStyleChange={handleTimeframeChange}
                                onDragStart={startGlobalDrag}
                                onDragEnd={endGlobalDrag}
                            />
                        </div>
                    </PanelSection>
                </div>
            </div>
        </div>
    );
};
