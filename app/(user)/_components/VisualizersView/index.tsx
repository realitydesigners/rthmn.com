'use client';

import React, { useCallback, useState } from 'react';
import { LuChevronDown, LuChevronUp, LuLayoutGrid, LuLineChart } from 'react-icons/lu';
import { useTimeframeStore } from '@/stores/timeframeStore';
import { TimeFrameSlider } from '../TimeFrameSlider';
import { CHART_STYLES, ChartStyleOption } from './ChartStyleOptions';

const VISUALIZER_TABS = {
    chartStyle: {
        id: 'chartStyle',
        title: 'Chart Style',
        icon: LuLineChart,
        content: (props: { showChartStyle: boolean; onToggle: () => void }) => (
            <>
                <button
                    onClick={props.onToggle}
                    className='group flex h-10 items-center justify-between rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] px-3 transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]'>
                    <div className='flex items-center gap-3'>
                        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#181818] to-[#0F0F0F] shadow-xl'>
                            <LuLineChart size={14} className='text-[#666] transition-colors group-hover:text-white' />
                        </div>
                        <span className='font-kodemono text-[10px] font-medium tracking-widest text-[#818181] uppercase transition-colors group-hover:text-white'>Chart Style</span>
                    </div>
                    {props.showChartStyle ? (
                        <LuChevronUp size={14} className='text-[#666] transition-colors group-hover:text-white' />
                    ) : (
                        <LuChevronDown size={14} className='text-[#666] transition-colors group-hover:text-white' />
                    )}
                </button>
                {props.showChartStyle && (
                    <div className='grid grid-cols-3 gap-2'>
                        {Object.values(CHART_STYLES).map((style) => (
                            <ChartStyleOption key={style.id} {...style} onClick={null} />
                        ))}
                    </div>
                )}
            </>
        ),
    },
    timeframe: {
        id: 'timeframe',
        title: 'Timeframe',
        icon: LuLayoutGrid,
        content: (props: {
            showTimeframe: boolean;
            onToggle: () => void;
            globalSettings: any;
            handleTimeframeChange: (property: string, value: number | boolean) => void;
            startGlobalDrag: (dragType: string) => void;
            endGlobalDrag: () => void;
        }) => (
            <div className='flex flex-col gap-2'>
                <button
                    onClick={props.onToggle}
                    className='group flex h-10 items-center justify-between rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] px-3 transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]'>
                    <div className='flex items-center gap-3'>
                        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#181818] to-[#0F0F0F] shadow-xl'>
                            <LuLayoutGrid size={14} className='text-[#666] transition-colors group-hover:text-white' />
                        </div>
                        <span className='font-kodemono text-[10px] font-medium tracking-widest text-[#818181] uppercase transition-colors group-hover:text-white'>Timeframe</span>
                    </div>
                    {props.showTimeframe ? (
                        <LuChevronUp size={14} className='text-[#666] transition-colors group-hover:text-white' />
                    ) : (
                        <LuChevronDown size={14} className='text-[#666] transition-colors group-hover:text-white' />
                    )}
                </button>
                <>
                    <div className='relative h-full w-full py-2'>
                        <TimeFrameSlider
                            startIndex={props.globalSettings.startIndex}
                            maxBoxCount={props.globalSettings.maxBoxCount}
                            boxes={[]}
                            onStyleChange={props.handleTimeframeChange}
                            onDragStart={props.startGlobalDrag}
                            onDragEnd={props.endGlobalDrag}
                        />
                    </div>
                </>
                {props.showTimeframe && (
                    <button
                        onClick={() => props.handleTimeframeChange('showPriceLines', !props.globalSettings.showPriceLines)}
                        className='group flex h-10 items-center justify-between rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] px-3 transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]'>
                        <div className='flex items-center gap-3'>
                            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#181818] to-[#0F0F0F] shadow-xl'>
                                <LuLineChart size={14} className='text-[#666] transition-colors group-hover:text-white' />
                            </div>
                            <span className='font-kodemono text-[10px] font-medium tracking-widest text-[#818181] uppercase transition-colors group-hover:text-white'>
                                Price Lines
                            </span>
                        </div>
                        <div className={`h-4 w-8 rounded-full transition-all duration-300 ${props.globalSettings.showPriceLines ? 'bg-emerald-500/20' : 'bg-[#333]'}`}>
                            <div
                                className={`h-4 w-4 rounded-full border border-[#444] bg-gradient-to-b from-[#222] to-[#111] transition-all duration-300 ${
                                    props.globalSettings.showPriceLines ? 'translate-x-4' : 'translate-x-0'
                                }`}
                            />
                        </div>
                    </button>
                )}
            </div>
        ),
    },
} as const;

export const VisualizersView = () => {
    const [showtimeframe, setShowtimeframe] = useState(true);
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
        <div className='flex h-full flex-col'>
            <div className='flex-1 overflow-y-visible'>
                <div className='flex flex-col gap-2'>
                    {/* Chart Style Section */}
                    <div className='flex flex-col gap-2'>
                        {VISUALIZER_TABS.chartStyle.content({
                            showChartStyle,
                            onToggle: () => setShowChartStyle(!showChartStyle),
                        })}
                    </div>

                    {/* Timeframe Section */}
                    <div className='flex flex-col gap-2'>
                        {VISUALIZER_TABS.timeframe.content({
                            showTimeframe: showtimeframe,
                            onToggle: () => setShowtimeframe(!showtimeframe),
                            globalSettings,
                            handleTimeframeChange,
                            startGlobalDrag,
                            endGlobalDrag,
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
