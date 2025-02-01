import React from 'react';
import { FOREX_PAIRS, CRYPTO_PAIRS, EQUITY_PAIRS, ETF_PAIRS, INSTRUMENTS } from '@/utils/instruments';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { LoadingSpinner } from './SelectedPairs';

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
                            <div className='ml-auto flex items-center gap-1.5'>
                                <div className='h-1.5 w-1.5 rounded-full bg-[#333]/50'></div>
                                <span className='text-[#444]'>{availablePairs.length}</span>
                            </div>
                        </div>
                        <div className='space-y-1'>
                            {availablePairs.map((item) => (
                                <div
                                    key={item}
                                    className='group/item relative flex h-10 items-center justify-between overflow-hidden rounded-lg border border-transparent bg-gradient-to-b from-[#111]/50 to-[#0A0A0A]/50 px-3 transition-all select-none hover:border-[#222] hover:from-[#141414]/50 hover:to-[#0F0F0F]/50'>
                                    {/* Inactive indicator line */}
                                    <div className='absolute inset-y-0 left-0 w-[2px] bg-[#222]'></div>
                                    <div className='flex items-center gap-3'>
                                        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#141414] to-[#0A0A0A] opacity-50'>
                                            <div className='h-1.5 w-1.5 rounded-full bg-[#333]'></div>
                                        </div>
                                        <div className='flex flex-col gap-0.5'>
                                            <span className='font-outfit text-[13px] font-bold tracking-wider text-[#666] transition-all group-hover/item:text-[#818181]'>
                                                {item}
                                            </span>
                                            <span className='font-kodemono text-[11px] font-medium tracking-wider text-[#444] transition-all group-hover/item:text-[#666]'>
                                                {priceData[item]?.price ? (
                                                    formatPrice(priceData[item].price, item)
                                                ) : (
                                                    <LoadingSpinner key={`${item}-loading`} itemId={item} color='#666666' />
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='flex items-center'>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                togglePair(item);
                                            }}
                                            className='flex h-5 w-5 items-center justify-center rounded-full border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] opacity-0 transition-all group-hover/item:opacity-100 hover:border-emerald-500/30 hover:from-emerald-500/10 hover:to-emerald-600/10'>
                                            <span className='text-[10px] font-medium text-[#666] transition-all hover:text-emerald-400'>+</span>
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
