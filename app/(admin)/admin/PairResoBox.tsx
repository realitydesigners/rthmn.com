'use client';

import React, { useEffect, useState } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { ResoBox } from '@/components/Charts/ResoBox';
import { BoxSlice, OHLC } from '@/types/types';
import type { BoxColors } from '@/stores/colorStore';
import { INSTRUMENTS } from '@/utils/instruments';

const getInstrumentDigits = (pair: string): number => {
    for (const category of Object.values(INSTRUMENTS)) {
        if (pair in category) {
            const instrument = category[pair as keyof typeof category] as { point: number; digits: number };
            return instrument.digits;
        }
    }
    return 5;
};

interface PairResoBoxProps {
    pair: string;
    boxSlice?: BoxSlice;
    currentOHLC?: OHLC;
    boxColors: BoxColors;
    initialBoxData?: BoxSlice;
}

export const PairResoBox = ({ pair, boxSlice, currentOHLC, boxColors, initialBoxData }: PairResoBoxProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Sort boxes to ensure consistent order
    const sortedBoxes = boxSlice?.boxes?.sort((a, b) => Math.abs(a.value) - Math.abs(b.value)) || [];
    const sortedInitialBoxes = initialBoxData?.boxes?.sort((a, b) => Math.abs(a.value) - Math.abs(b.value)) || [];

    return (
        <div className='group relative flex w-full flex-col'>
            <div className='relative flex flex-col'>
                <div className='flex w-full gap-4 p-4'>
                    <div className='flex w-auto flex-col gap-4'>
                        {/* ResoBox Section */}
                        <div className='h-[300px] w-[300px] rounded border border-[#181818] bg-[#0a0a0a]'>
                            <div className='relative h-full overflow-hidden'>
                                {mounted && boxSlice && (
                                    <ResoBox
                                        slice={{
                                            ...boxSlice,
                                            boxes: sortedBoxes,
                                        }}
                                        className='h-[300px] w-full'
                                        boxColors={boxColors}
                                        pair={pair}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Market Price Section */}
                        <div className='rounded border border-[#181818] bg-[#0a0a0a] p-4'>
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
                        </div>
                    </div>

                    {/* Box Data Analysis Section */}
                    <div className='flex-1'>
                        <div className='h-[400px] rounded border border-[#181818] bg-[#0a0a0a]'>
                            <div className='flex h-full flex-col'>
                                {/* Fixed Header */}
                                <div className='border-b border-[#181818] p-4'>
                                    <table className='w-full text-xs'>
                                        <thead>
                                            <tr className='text-left text-gray-500'>
                                                <th className='p-2 whitespace-nowrap'>Box #</th>
                                                <th className='p-2'>
                                                    <div className='space-y-1'>
                                                        <div className='whitespace-nowrap'>Initial Box Data</div>
                                                        <div className='text-[10px] text-gray-600'>Raw WebSocket Response</div>
                                                        <div className='text-[10px] text-gray-600 italic'>
                                                            Initial timestamp: {initialBoxData?.timestamp ? new Date(initialBoxData.timestamp).toLocaleTimeString() : 'Loading...'}
                                                        </div>
                                                    </div>
                                                </th>
                                                <th className='p-2'>
                                                    <div className='space-y-1'>
                                                        <div className='whitespace-nowrap'>Current Box Data</div>
                                                        <div className='text-[10px] text-gray-600'>Processed by GridCalculator</div>
                                                        <div className='text-[10px] text-gray-600 italic'>Current price: {currentOHLC?.close.toFixed(5)}</div>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                    </table>
                                </div>

                                {/* Scrollable Body */}
                                <div className='flex-1 overflow-y-auto'>
                                    <table className='w-full text-xs'>
                                        <tbody>
                                            {sortedBoxes.map((box, idx) => {
                                                const initialBox = sortedInitialBoxes[idx];
                                                return (
                                                    <tr key={idx} className='border-b border-[#181818]/50 hover:bg-[#0f0f0f]'>
                                                        <td className='p-2 whitespace-nowrap text-gray-500'>Box {idx + 1}</td>

                                                        {/* Initial Box Data Column */}
                                                        <td className='p-2 whitespace-nowrap'>
                                                            <div className='flex items-center gap-4 font-mono'>
                                                                {initialBox ? (
                                                                    <>
                                                                        <div>
                                                                            <span className='text-gray-400'>H:</span>
                                                                            <span className='ml-1 text-gray-300'>{initialBox.high.toFixed(5)}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className='text-gray-400'>L:</span>
                                                                            <span className='ml-1 text-gray-300'>{initialBox.low.toFixed(5)}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className='text-gray-400'>V:</span>
                                                                            <span className={`ml-1 ${initialBox.value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                                {initialBox.value.toFixed(5)}
                                                                            </span>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <span className='text-gray-500'>Waiting for data...</span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Current Box Data Column */}
                                                        <td className='p-2 whitespace-nowrap'>
                                                            <div className='flex items-center gap-4 font-mono'>
                                                                <div>
                                                                    <span className='text-gray-400'>H:</span>
                                                                    <span className='ml-1 text-gray-300'>{box.high.toFixed(5)}</span>
                                                                </div>
                                                                <div>
                                                                    <span className='text-gray-400'>L:</span>
                                                                    <span className='ml-1 text-gray-300'>{box.low.toFixed(5)}</span>
                                                                </div>
                                                                <div>
                                                                    <span className='text-gray-400'>V:</span>
                                                                    <span className={`ml-1 ${box.value > 0 ? 'text-green-400' : 'text-red-400'}`}>{box.value.toFixed(5)}</span>
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
