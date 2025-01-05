'use client';
import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaTimes, FaChevronDown } from 'react-icons/fa';
import { FOREX_PAIRS, CRYPTO_PAIRS } from '@/utils/instruments';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { useWebSocket } from '@/providers/WebsocketProvider';

interface SearchBarProps {
    selectedPairs: string[];
}

interface InstrumentGroup {
    label: string;
    items: readonly string[];
}

const instrumentGroups: readonly InstrumentGroup[] = [
    { label: 'FX', items: FOREX_PAIRS },
    { label: 'CRYPTO', items: CRYPTO_PAIRS },
] as const;

const GroupHeader = ({ label }: { label: string }) => (
    <div className='font-kodemono flex h-8 items-center justify-between border-b border-[#222] px-4 text-xs font-medium tracking-wider text-[#818181]'>
        <div className='flex items-center gap-2'>
            <span className='uppercase'>{label}</span>
            <FaChevronDown size={8} className='opacity-50' />
        </div>
    </div>
);

export const SearchBar: React.FC<SearchBarProps> = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const { selectedPairs, togglePair } = useDashboard();
    const { priceData } = useWebSocket();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getFilteredGroups = () => {
        if (!searchQuery) return instrumentGroups;

        return instrumentGroups
            .map((group) => ({
                ...group,
                items: group.items.filter((item) => item.toLowerCase().includes(searchQuery.toLowerCase())),
            }))
            .filter((group) => group.items.length > 0);
    };

    const formatPrice = (price: number) => {
        return price.toFixed(price >= 100 ? 2 : 5);
    };

    const renderPairRow = (item: string) => {
        const isSelected = selectedPairs.includes(item);
        const currentPrice = priceData[item]?.price;

        return (
            <div
                key={item}
                className='group flex h-9 cursor-default items-center justify-between border-l-2 border-transparent px-2 transition-all select-none hover:border-[#333] hover:bg-[#111]'>
                <div className='flex w-[140px] items-center'>
                    <span className='font-outfit text-[13px] font-bold tracking-wider text-white'>{item}</span>
                </div>
                <div className='flex items-center'>
                    <span className='font-kodemono text-[13px] font-medium tracking-wider text-[#666] transition-all group-hover:mr-3'>
                        {currentPrice ? formatPrice(currentPrice) : 'N/A'}
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            togglePair(item);
                        }}
                        className={`flex h-5 w-5 items-center justify-center rounded border opacity-0 transition-all group-hover:opacity-100 ${
                            isSelected ? 'border-red-400 bg-red-400/80 hover:text-white' : 'border-emerald-400 bg-emerald-400/80 hover:text-white'
                        }`}>
                        {isSelected ? <FaTimes size={10} className='text-black' /> : <span className='text-[12px] font-bold text-black'>+</span>}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className='relative flex-1 px-32' ref={searchRef}>
            {showResults && <div className='fixed inset-0 z-[85] mt-14 bg-black/50 backdrop-blur-sm' onClick={() => setShowResults(false)} />}

            <div className='relative mx-auto max-w-60'>
                <div className='relative z-[95] flex items-center rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] transition-all duration-200 hover:from-[#444444] hover:to-[#282828]'>
                    <div className='flex h-9 w-full items-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#121212]'>
                        <FaSearch className='ml-4 text-[#666]' />
                        <input
                            type='text'
                            placeholder='Search instruments...'
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowResults(true);
                            }}
                            onFocus={() => setShowResults(true)}
                            className='font-outfit w-full bg-transparent px-3 py-2 text-sm text-white placeholder-[#666] focus:outline-none'
                        />
                    </div>
                </div>

                {showResults && (
                    <div className='absolute left-1/2 z-[95] mt-[20px] w-[750px] -translate-x-1/2 overflow-hidden rounded-md border border-[#222] bg-black/95 shadow-xl backdrop-blur-sm'>
                        {/* Selected Pairs Section */}
                        {selectedPairs.length > 0 && (
                            <div className='border-b border-[#222]'>
                                <GroupHeader label='My Symbols' />
                                <div className='max-h-[180px] overflow-y-auto p-2'>
                                    <div className='grid grid-cols-4 gap-1'>
                                        {selectedPairs.map((item) => (
                                            <div
                                                key={item}
                                                className='group flex h-9 cursor-default items-center justify-between rounded border border-transparent bg-[#111] px-2 transition-all select-none hover:border-[#333]'>
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
                                                        className='flex h-5 w-5 items-center justify-center rounded border border-red-400 bg-red-400/80 opacity-0 transition-all group-hover:opacity-100 hover:text-white'>
                                                        <FaTimes size={10} className='text-black' />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Available Pairs Section */}
                        <div className='flex divide-x divide-[#222]'>
                            {getFilteredGroups().map((group) => {
                                const availablePairs = group.items.filter((item) => !selectedPairs.includes(item));

                                if (availablePairs.length === 0) return null;

                                return (
                                    <div key={group.label} className='flex-1'>
                                        <GroupHeader label={group.label} />
                                        <div className='max-h-[300px] overflow-y-auto px-2'>{availablePairs.map(renderPairRow)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
