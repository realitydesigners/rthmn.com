'use client';

import React, { useEffect, useState } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { ResoBox } from '@/components/ResoBox';
import { ResoChart } from '@/components/ResoChart';
import { BoxSlice, OHLC } from '@/types/types';
import { BoxColors } from '@/utils/localStorage';
import { INSTRUMENTS } from '@/utils/instruments';
import { useDashboard } from '@/providers/DashboardProvider/client';

const getInstrumentDigits = (pair: string): number => {
    for (const category of Object.values(INSTRUMENTS)) {
        if (pair in category) {
            const instrument = category[pair as keyof typeof category] as { point: number; digits: number };
            return instrument.digits;
        }
    }
    return 5;
};

const CollapsibleSection = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    // Use effect to sync with defaultOpen prop changes
    useEffect(() => {
        setIsOpen(defaultOpen);
    }, [defaultOpen]);

    return (
        <div className='rounded border border-[#181818] bg-[#0a0a0a]'>
            <button onClick={() => setIsOpen(!isOpen)} className='flex w-full items-center justify-between p-2 hover:bg-[#111111]'>
                <h4 className='text-[11px] font-medium text-gray-300'>{title}</h4>
                {isOpen ? <IoChevronUp size={14} /> : <IoChevronDown size={14} />}
            </button>
            {isOpen && (
                <div className='border-t border-[#181818] p-2'>
                    <div className='max-h-[500px] overflow-auto'>{children}</div>
                </div>
            )}
        </div>
    );
};

interface PairResoBoxProps {
    pair: string;
    boxSlice?: BoxSlice;
    currentOHLC?: OHLC;
    boxColors: BoxColors;
    isLoading?: boolean;
    pairData?: Record<string, any>;
    fetchBoxSlice?: Record<string, any>;
}

export const PairResoBox = ({ pair, boxSlice, currentOHLC, boxColors, isLoading, pairData, fetchBoxSlice }: PairResoBoxProps) => {
    const [boxHistory, setBoxHistory] = useState<any[]>([]);
    const [isBoxValidationOpen, setIsBoxValidationOpen] = useState(false);

    // Validation helper function
    const validateBox = (box) => {
        const diff = Number((box.high - box.low).toFixed(5));
        const absValue = Math.abs(Number(box.value));
        const isValid = Math.abs(diff - absValue) < 0.00001;
        return isValid;
    };

    // Update box history when boxSlice changes
    useEffect(() => {
        if (boxSlice?.boxes) {
            setBoxHistory((prev) => {
                const newEntry = {
                    boxes: boxSlice.boxes,
                    timestamp: new Date().toISOString(),
                };
                return [newEntry, ...prev].slice(0, 50);
            });
        }
    }, [boxSlice]);

    const BoxValidationSection = () => {
        // Get the raw initial data directly from props
        const rawInitialData = fetchBoxSlice?.[pair];
        const rawInitialBoxes = rawInitialData?.boxes;
        const rawInitialTimestamp = rawInitialData?.timestamp;

        // Get real-time data from props
        const realtimeBoxes = boxSlice?.boxes;

        // Add debug logging to see data flow
        console.log('Data Flow:', {
            rawInitial: {
                data: rawInitialData,
                boxes: rawInitialBoxes,
                timestamp: rawInitialTimestamp,
            },
            realtime: {
                boxes: realtimeBoxes,
                currentPrice: currentOHLC?.close,
            },
        });

        return (
            <div className='flex flex-col gap-4 rounded-lg bg-[#0a0a0a] p-4'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-xs'>
                        <thead>
                            <tr className='border-b border-[#181818] text-left text-gray-500'>
                                <th className='p-2 whitespace-nowrap'>Box #</th>
                                <th className='p-2'>
                                    <div className='space-y-1'>
                                        <div className='whitespace-nowrap'>Initial Box Data</div>
                                        <div className='text-[10px] text-gray-600'>Raw data from API fetch</div>
                                        <div className='text-[10px] text-gray-600 italic'>
                                            Initial fetch: {rawInitialTimestamp ? new Date(rawInitialTimestamp).toLocaleTimeString() : 'Loading...'}
                                        </div>
                                    </div>
                                </th>
                                <th className='p-2'>
                                    <div className='space-y-1'>
                                        <div className='whitespace-nowrap'>Real-time Box Data</div>
                                        <div className='text-[10px] text-gray-600'>Processed by GridCalculator</div>
                                        <div className='text-[10px] text-gray-600 italic'>Current price: {currentOHLC?.close.toFixed(5)}</div>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {realtimeBoxes?.map((realtimeBox, idx) => {
                                const rawInitialBox = rawInitialBoxes?.[idx];
                                return (
                                    <tr key={idx} className='border-b border-[#181818]/50 hover:bg-[#0f0f0f]'>
                                        <td className='p-2 whitespace-nowrap text-gray-500'>Box {idx + 1}</td>

                                        {/* Raw Initial Box Data */}
                                        <td className='p-2 whitespace-nowrap'>
                                            <div className='flex items-center gap-4 font-mono'>
                                                {rawInitialBox ? (
                                                    <>
                                                        <div>
                                                            <span className='text-gray-400'>H:</span>
                                                            <span className='ml-1 text-gray-300'>{rawInitialBox.high.toFixed(5)}</span>
                                                        </div>
                                                        <div>
                                                            <span className='text-gray-400'>L:</span>
                                                            <span className='ml-1 text-gray-300'>{rawInitialBox.low.toFixed(5)}</span>
                                                        </div>
                                                        <div>
                                                            <span className='text-gray-400'>V:</span>
                                                            <span className={`ml-1 ${rawInitialBox.value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                {rawInitialBox.value.toFixed(5)}
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className='text-gray-500'>Waiting for initial data...</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Real-time Box Data */}
                                        <td className='p-2 whitespace-nowrap'>
                                            <div className='flex items-center gap-4 font-mono'>
                                                <div>
                                                    <span className='text-gray-400'>H:</span>
                                                    <span className='ml-1 text-gray-300'>{realtimeBox.high.toFixed(5)}</span>
                                                </div>
                                                <div>
                                                    <span className='text-gray-400'>L:</span>
                                                    <span className='ml-1 text-gray-300'>{realtimeBox.low.toFixed(5)}</span>
                                                </div>
                                                <div>
                                                    <span className='text-gray-400'>V:</span>
                                                    <span className={`ml-1 ${realtimeBox.value > 0 ? 'text-green-400' : 'text-red-400'}`}>{realtimeBox.value.toFixed(5)}</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className='group relative flex w-full flex-col'>
            <div className='relative flex flex-col'>
                <div className='flex w-full gap-4 p-4'>
                    <div className='flex w-auto flex-col gap-4'>
                        <div className='space-y-4'>
                            <CollapsibleSection key={`resobox-${pair}`} title='ResoBox' defaultOpen={true}>
                                <div className='relative h-full w-[300px]'>
                                    <ResoBox slice={boxSlice} className='h-full w-full' boxColors={boxColors} pair={pair} />
                                </div>
                            </CollapsibleSection>
                        </div>

                        {/* Market Price Section */}
                        <div className='space-y-4'>
                            <CollapsibleSection key={`market-price-${pair}`} title='Market Price' defaultOpen={true}>
                                <div className='space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-sm font-medium text-gray-300'>{pair}</span>
                                        <span className='font-mono text-sm text-gray-200'>{currentOHLC?.close.toFixed(getInstrumentDigits(pair || ''))}</span>
                                    </div>
                                    <div className='grid grid-cols-2 gap-2 text-xs'>
                                        <div>
                                            <span className='text-gray-500'>Open: </span>
                                            <span className='font-mono text-gray-300'>{currentOHLC?.open.toFixed(getInstrumentDigits(pair || ''))}</span>
                                        </div>
                                        <div>
                                            <span className='text-gray-500'>High: </span>
                                            <span className='font-mono text-green-400'>{currentOHLC?.high.toFixed(getInstrumentDigits(pair || ''))}</span>
                                        </div>
                                        <div>
                                            <span className='text-gray-500'>Low: </span>
                                            <span className='font-mono text-red-400'>{currentOHLC?.low.toFixed(getInstrumentDigits(pair || ''))}</span>
                                        </div>
                                        <div>
                                            <span className='text-gray-500'>Close: </span>
                                            <span className='font-mono text-gray-300'>{currentOHLC?.close.toFixed(getInstrumentDigits(pair || ''))}</span>
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleSection>
                        </div>
                    </div>

                    {/* Box Validation Section with Comprehensive Data */}
                    <div className='flex-1'>
                        <CollapsibleSection key={`box-data-${pair}`} title='Box Data Analysis' defaultOpen={true}>
                            <BoxValidationSection />
                        </CollapsibleSection>
                    </div>
                </div>
            </div>
        </div>
    );
};
