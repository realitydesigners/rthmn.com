import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { useWebSocket } from '@/providers/WebsocketProvider';

const formatPrice = (price: number) => {
    return price.toFixed(price >= 100 ? 2 : 5);
};

export const SelectedPairs = () => {
    const { selectedPairs, togglePair } = useDashboard();
    const { priceData } = useWebSocket();

    if (selectedPairs.length === 0) return null;

    return (
        <div className='mb-4'>
            <div className='font-kodemono mb-2 flex h-8 items-center text-xs font-medium tracking-wider text-[#818181]'>
                <span className='uppercase'>My Symbols</span>
            </div>
            <div className='space-y-1'>
                {selectedPairs.map((item) => (
                    <div
                        key={item}
                        className='group flex h-9 cursor-default items-center justify-between rounded-lg border border-transparent bg-[#111] px-3 transition-all select-none hover:border-[#333]'>
                        <div className='flex items-center overflow-hidden'>
                            <span className='font-outfit truncate text-[13px] font-bold tracking-wider text-white'>{item}</span>
                        </div>
                        <div className='flex shrink-0 items-center'>
                            <span className='font-kodemono text-[13px] font-medium tracking-wider text-[#666] transition-all group-hover:mr-3'>
                                {priceData[item]?.price ? formatPrice(priceData[item].price) : 'N/A'}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePair(item);
                                }}
                                className='flex h-5 w-5 items-center justify-center rounded-md border border-red-400 bg-red-400/80 opacity-0 transition-all group-hover:opacity-100 hover:text-white'>
                                <FaTimes size={10} className='text-black' />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
