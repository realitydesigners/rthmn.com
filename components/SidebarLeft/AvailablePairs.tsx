import React from 'react';
import { FOREX_PAIRS, CRYPTO_PAIRS } from '@/components/Constants/instruments';
import { useDashboard } from '@/providers/DashboardProvider/client';

const formatPrice = (price: number) => {
    return price.toFixed(price >= 100 ? 2 : 5);
};

export const AvailablePairs = () => {
    const { selectedPairs, togglePair, pairData } = useDashboard();

    return (
        <>
            {[
                { label: 'FX', items: FOREX_PAIRS },
                { label: 'CRYPTO', items: CRYPTO_PAIRS },
            ].map((group) => {
                const availablePairs = group.items.filter((item) => !selectedPairs.includes(item));
                if (availablePairs.length === 0) return null;

                return (
                    <div key={group.label} className='mb-4'>
                        <div className='font-kodemono mb-2 flex h-8 items-center text-xs font-medium tracking-wider text-[#818181]'>
                            <span className='uppercase'>{group.label}</span>
                        </div>
                        <div className='space-y-1'>
                            {availablePairs.map((item) => (
                                <div
                                    key={item}
                                    className='group flex h-9 cursor-default items-center justify-between rounded-lg border-l-2 border-transparent px-3 transition-all select-none hover:border-[#333] hover:bg-[#111]'>
                                    <div className='flex items-center'>
                                        <span className='font-outfit text-[13px] font-bold tracking-wider text-white'>{item}</span>
                                    </div>
                                    <div className='flex items-center'>
                                        <span className='font-kodemono text-[13px] font-medium tracking-wider text-[#666] transition-all group-hover:mr-3'>
                                            {pairData[item]?.currentOHLC?.close ? formatPrice(pairData[item]?.currentOHLC?.close) : 'N/A'}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                togglePair(item);
                                            }}
                                            className='flex h-5 w-5 items-center justify-center rounded-md border border-emerald-400 bg-emerald-400/80 opacity-0 transition-all group-hover:opacity-100 hover:text-white'>
                                            <span className='text-[12px] font-bold text-black'>+</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </>
    );
};
