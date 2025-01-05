import React from 'react';
import { FOREX_PAIRS, CRYPTO_PAIRS, EQUITY_PAIRS, ETF_PAIRS, INSTRUMENTS } from '@/utils/instruments';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { useWebSocket } from '@/providers/WebsocketProvider';

const formatPrice = (price: number, instrument: string) => {
    // Get the digits for formatting from the INSTRUMENTS configuration
    let digits = 2; // default
    for (const category of Object.values(INSTRUMENTS)) {
        if (instrument in category) {
            digits = category[instrument].digits;
            break;
        }
    }
    return price.toFixed(digits);
};

export const AvailablePairs = () => {
    const { selectedPairs, togglePair } = useDashboard();
    const { priceData } = useWebSocket();

    return (
        <>
            {[
                { label: 'FX', items: FOREX_PAIRS },
                { label: 'CRYPTO', items: CRYPTO_PAIRS },
                { label: 'STOCKS', items: EQUITY_PAIRS },
                { label: 'ETF', items: ETF_PAIRS },
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
                                            {priceData[item]?.price ? formatPrice(priceData[item].price, item) : 'N/A'}
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
