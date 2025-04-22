'use client';

import { useEffect, useState } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { PriceData } from '@/types/types';
import { INSTRUMENTS } from '@/utils/instruments';

interface AdminSidebarProps {
    priceData: Record<string, PriceData>;
    selectedPairs: string[];
    onPairSelect: (pair: string) => void;
    selectedPair: string | null;
}

interface PairPriceSection {
    pair: string;
    isOpen: boolean;
    prices: PriceData[];
    lastPrice: number;
    previousPrice: number;
}

const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    } catch (e) {
        return '';
    }
};

const getInstrumentDigits = (pair: string): number => {
    for (const category of Object.values(INSTRUMENTS)) {
        if (pair in category) {
            const instrument = category[pair as keyof typeof category] as { point: number; digits: number };
            return instrument.digits;
        }
    }
    return 5;
};

export function AdminSidebar({ priceData, selectedPairs, onPairSelect, selectedPair }: AdminSidebarProps) {
    const [pairSections, setPairSections] = useState<PairPriceSection[]>([]);

    // Initialize sections when selectedPairs changes
    useEffect(() => {
        setPairSections(
            selectedPairs.map((pair) => ({
                pair,
                isOpen: false,
                prices: [],
                lastPrice: priceData[pair]?.price || 0,
                previousPrice: 0,
            }))
        );
    }, [selectedPairs]);

    const toggleSection = (pair: string) => {
        setPairSections((sections) => sections.map((section) => (section.pair === pair ? { ...section, isOpen: !section.isOpen } : section)));
    };

    // Update prices when priceData changes
    useEffect(() => {
        if (Object.keys(priceData).length === 0) return;

        setPairSections((sections) =>
            sections.map((section) => {
                const currentPrice = priceData[section.pair]?.price;
                if (currentPrice === undefined) return section;

                return {
                    ...section,
                    previousPrice: section.lastPrice,
                    lastPrice: currentPrice,
                    prices: [
                        {
                            price: currentPrice,
                            timestamp: priceData[section.pair]?.timestamp || new Date().toISOString(),
                        },
                        ...section.prices,
                    ].slice(0, 20),
                };
            })
        );
    }, [priceData]);

    if (pairSections.length === 0) {
        return (
            <div className='fixed top-0 left-0 h-screen w-[300px] border-r border-[#181818] bg-black p-4'>
                <h3 className='mb-4 text-lg font-medium text-neutral-200'>Market Prices</h3>
                <div className='text-neutral-400'>Loading pairs data...</div>
                <div className='mt-2 text-xs text-neutral-500'>Selected Pairs: {selectedPairs.join(', ')}</div>
            </div>
        );
    }

    return (
        <div className='fixed top-0 left-0 mt-14 h-screen w-[300px] border-r border-[#181818] bg-black p-4'>
            <h3 className='mb-4 text-lg font-medium text-neutral-200'>Market Prices</h3>

            <div className='space-y-2'>
                {pairSections.map((section) => (
                    <div key={section.pair} className={`rounded-lg border border-[#181818] ${selectedPair === section.pair ? 'bg-[#181818]' : ''}`}>
                        <button
                            onClick={() => {
                                toggleSection(section.pair);
                                onPairSelect(section.pair);
                            }}
                            className='flex w-full items-center justify-between p-3 hover:bg-[#111111]'>
                            <span className='text-sm font-medium text-neutral-300'>{section.pair}</span>
                            <div className='flex items-center gap-3'>
                                <span
                                    className={`text-sm ${
                                        section.lastPrice > section.previousPrice
                                            ? 'text-green-500'
                                            : section.lastPrice < section.previousPrice
                                              ? 'text-red-500'
                                              : 'text-neutral-300'
                                    }`}>
                                    {section.lastPrice.toFixed(getInstrumentDigits(section.pair))}
                                </span>
                                {section.isOpen ? <IoChevronUp size={16} /> : <IoChevronDown size={16} />}
                            </div>
                        </button>

                        {section.isOpen && (
                            <div className='border-t border-[#181818] p-2'>
                                <div className='max-h-[300px] space-y-1 overflow-y-auto'>
                                    {section.prices.map((price, idx) => (
                                        <div key={idx} className='flex items-center justify-between px-2 py-1 text-xs text-neutral-400'>
                                            <span>{formatTime(price.timestamp)}</span>
                                            <span>{price.price.toFixed(getInstrumentDigits(section.pair))}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
