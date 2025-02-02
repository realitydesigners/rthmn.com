'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaSearch } from 'react-icons/fa';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { useOnboardingStore } from '@/app/(user)/onboarding/onboarding';
import { cn } from '@/utils/cn';
import { FOREX_PAIRS, CRYPTO_PAIRS, EQUITY_PAIRS, ETF_PAIRS, INSTRUMENTS } from '@/utils/instruments';

const formatPrice = (price: number, instrument: string) => {
    let digits = 2;
    for (const category of Object.values(INSTRUMENTS)) {
        if (instrument in category) {
            digits = category[instrument].digits;
            break;
        }
    }
    return price.toFixed(digits);
};

interface LoadingSpinnerProps {
    color?: string;
    itemId: string;
}

const LoadingSpinner = ({ color = '#3b82f6', itemId }: LoadingSpinnerProps) => {
    const [showFallback, setShowFallback] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setShowFallback(true);
        }, 10000);

        return () => clearTimeout(timer);
    }, [itemId]);

    if (showFallback) {
        return <span className='font-mono text-[11px] tracking-wider opacity-50'>N/A</span>;
    }

    return (
        <div className='relative h-3 w-3'>
            <div className='absolute inset-0 rounded-full border-2' style={{ borderColor: `${color}20` }}></div>
            <div className='absolute inset-0 animate-spin rounded-full border-t-2' style={{ borderColor: color }}></div>
        </div>
    );
};

interface PairItemProps {
    item: string;
    isSelected?: boolean;
    onToggle: () => void;
    price?: number;
}

const PairItem: React.FC<PairItemProps> = ({ item, isSelected = false, onToggle, price }) => {
    const { currentStepId } = useOnboardingStore();
    const { boxColors } = useDashboard();
    const isOnboardingActive = currentStepId === 'instruments';

    return (
        <div
            className={cn(
                'group/item relative flex h-10 items-center overflow-hidden transition-all duration-300 select-none',
                'after:absolute after:inset-0 after:rounded-lg after:transition-all after:duration-300',
                isSelected
                    ? ['bg-[#141414]/90', 'after:bg-gradient-to-r after:from-transparent after:via-[rgba(255,255,255,0.03)] after:to-transparent', 'after:animate-shimmer']
                    : [
                          'bg-[#0C0C0C]/90 hover:bg-[#111]/90',
                          'after:bg-gradient-to-r after:from-transparent after:via-transparent after:to-transparent',
                          'hover:after:via-[rgba(255,255,255,0.01)]',
                      ],
                'before:absolute before:inset-0 before:rounded-lg before:border before:border-transparent before:transition-all before:duration-300',
                isSelected ? 'before:border-[#222]' : 'hover:before:border-[#181818]',
                isOnboardingActive && isSelected && 'hover:border-blue-500/40'
            )}>
            <div className='relative flex w-full items-center px-3'>
                {/* Status indicator */}
                <div className='relative flex h-8 w-8 items-center justify-center'>
                    <div
                        className={cn('absolute h-4 w-4 rounded-full transition-all duration-300', isSelected ? 'opacity-10' : 'opacity-0 group-hover/item:opacity-5')}
                        style={{
                            background: isSelected ? `radial-gradient(circle at center, ${boxColors.positive}, ${boxColors.negative})` : '#333',
                        }}
                    />
                    <div
                        className={cn('h-1.5 w-1.5 rounded-full transition-all duration-300', isSelected ? 'scale-100' : 'scale-90 opacity-40')}
                        style={{
                            background: isSelected ? `linear-gradient(135deg, ${boxColors.positive}, ${boxColors.negative})` : '#333',
                        }}
                    />
                </div>

                {/* Instrument name */}
                <span
                    className={cn(
                        'font-outfit ml-3 flex-1 text-sm font-bold tracking-wide transition-all duration-300',
                        isSelected ? 'text-white' : 'text-[#666] group-hover/item:text-[#888]'
                    )}>
                    {item}
                </span>

                {/* Price */}
                <div className='flex items-center'>
                    <span
                        className={cn(
                            'font-kodemono w-[70px] text-right text-sm tracking-wider transition-all duration-300',
                            isSelected ? 'text-[#999]' : 'text-[#444] group-hover/item:text-[#666]',
                            'flex items-center justify-end'
                        )}>
                        {price ? formatPrice(price, item) : <LoadingSpinner key={`${item}-loading`} itemId={item} color={isSelected ? boxColors.positive : '#444'} />}
                    </span>

                    {/* Toggle button */}
                    <div className='z-90 ml-2 flex w-6 justify-center'>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggle();
                            }}
                            className={cn(
                                'relative inline-flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-200',
                                'invisible group-hover/item:visible',
                                isSelected
                                    ? ['border-[#333] bg-[#1A1A1A] text-[#666]', 'hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-400']
                                    : ['border-[#222] bg-[#141414] text-[#666]', 'hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-400']
                            )}>
                            {isSelected ? <FaTimes size={8} /> : <span className='text-[9px] font-medium'>+</span>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface PairGroupProps {
    label: string;
    items: React.ReactNode;
    count: number;
    isSelected?: boolean;
}

const PairGroup: React.FC<PairGroupProps> = ({ label, items, count, isSelected = false }) => {
    return (
        <div className='mb-4'>
            <div className='font-kodemono mb-2 flex h-8 items-center text-xs font-medium tracking-wider text-[#818181]'>
                <span className='uppercase'>{label}</span>
                <div className='ml-auto flex items-center gap-1.5'>
                    <div className={cn('h-1.5 w-1.5 rounded-full', isSelected ? 'bg-emerald-400/50' : 'bg-[#333]/50')}></div>
                    <span className='text-[#444]'>{count}</span>
                </div>
            </div>
            <div className='space-y-1'>{items}</div>
        </div>
    );
};

const SearchBar = ({ onSearchStateChange }: { onSearchStateChange: (isSearching: boolean) => void }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const { selectedPairs, togglePair, boxColors } = useDashboard();
    const { priceData } = useWebSocket();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
                onSearchStateChange(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onSearchStateChange]);

    useEffect(() => {
        onSearchStateChange(showResults && !!searchQuery);
    }, [showResults, searchQuery, onSearchStateChange]);

    const getFilteredPairs = () => {
        if (!searchQuery) return [];

        const allPairs = [...FOREX_PAIRS, ...CRYPTO_PAIRS, ...EQUITY_PAIRS, ...ETF_PAIRS];
        return allPairs
            .filter((pair) => pair.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                // Sort selected pairs to the top
                const aSelected = selectedPairs.includes(a);
                const bSelected = selectedPairs.includes(b);
                if (aSelected && !bSelected) return -1;
                if (!aSelected && bSelected) return 1;
                return 0;
            });
    };

    return (
        <div className='relative' ref={searchRef}>
            {/* Search Input */}
            <div className='group/search relative flex h-10 items-center overflow-hidden rounded-lg transition-all duration-300'>
                <div className='absolute inset-0 rounded-lg border border-[#222] bg-[#0C0C0C] transition-all duration-300 group-focus-within/search:border-[#333] group-focus-within/search:bg-[#111]' />

                {/* Search Icon */}
                <div className='relative ml-3 text-[#666] transition-colors duration-300 group-focus-within/search:text-[#888]'>
                    <FaSearch size={12} />
                </div>

                {/* Input */}
                <input
                    type='text'
                    spellCheck={false}
                    placeholder='Search instruments...'
                    value={searchQuery}
                    onChange={(e) => {
                        const value = e.target.value.toUpperCase().replace(/\s/g, '');
                        setSearchQuery(value);
                    }}
                    onFocus={() => setShowResults(true)}
                    className='font-outfit relative h-full flex-1 bg-transparent px-3 text-[13px] font-bold text-[#888] placeholder-[#666] transition-colors outline-none'
                />

                {/* Clear Button */}
                {searchQuery && (
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setShowResults(false);
                        }}
                        className='relative mr-3 flex h-5 w-5 items-center justify-center rounded-md border border-[#222] bg-[#141414] text-[#666] transition-all hover:border-[#333] hover:bg-[#1A1A1A] hover:text-[#888]'>
                        <FaTimes size={8} />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {showResults && searchQuery && (
                <div className='absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-lg border border-[#222] bg-[#0C0C0C] shadow-lg'>
                    <div className='max-h-[280px] overflow-y-auto'>
                        {getFilteredPairs().map((pair) => {
                            const isSelected = selectedPairs.includes(pair);
                            return (
                                <div
                                    key={pair}
                                    className={cn(
                                        'group/result relative flex h-10 items-center justify-between px-3 transition-all duration-300',
                                        isSelected ? 'bg-[#141414]/90' : 'hover:bg-[#111]/90'
                                    )}
                                    onClick={() => {
                                        togglePair(pair);
                                        setSearchQuery('');
                                        setShowResults(false);
                                    }}>
                                    {/* Left side */}
                                    <div className='flex items-center gap-3'>
                                        <div className='relative flex h-8 w-8 items-center justify-center'>
                                            <div
                                                className={cn(
                                                    'absolute h-4 w-4 rounded-full transition-all duration-300',
                                                    isSelected ? 'opacity-10' : 'opacity-0 group-hover/result:opacity-5'
                                                )}
                                                style={{
                                                    background: isSelected ? `radial-gradient(circle at center, ${boxColors.positive}, ${boxColors.negative})` : '#333',
                                                }}
                                            />
                                            <div
                                                className={cn('h-1.5 w-1.5 rounded-full transition-all duration-300', isSelected ? 'scale-100' : 'scale-90 opacity-40')}
                                                style={{
                                                    background: isSelected ? `linear-gradient(135deg, ${boxColors.positive}, ${boxColors.negative})` : '#333',
                                                }}
                                            />
                                        </div>
                                        <span
                                            className={cn(
                                                'font-outfit text-[13px] font-bold tracking-wide transition-colors',
                                                isSelected ? 'text-white' : 'text-[#666] group-hover/result:text-[#888]'
                                            )}>
                                            {pair}
                                        </span>
                                    </div>

                                    {/* Right side */}
                                    <div className='flex items-center gap-3'>
                                        <span
                                            className={cn(
                                                'font-kodemono text-[13px] tracking-wider transition-colors',
                                                isSelected ? 'text-[#999]' : 'text-[#444] group-hover/result:text-[#666]',
                                                'flex w-[70px] items-center justify-end'
                                            )}>
                                            {priceData[pair]?.price ? formatPrice(priceData[pair].price, pair) : 'N/A'}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                togglePair(pair);
                                                setSearchQuery('');
                                                setShowResults(false);
                                            }}
                                            className={cn(
                                                'relative inline-flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-200',
                                                'opacity-0 group-hover/result:opacity-100',
                                                isSelected
                                                    ? ['border-[#333] bg-[#1A1A1A] text-[#666]', 'hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-400']
                                                    : ['border-[#222] bg-[#141414] text-[#666]', 'hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-400']
                                            )}>
                                            {isSelected ? <FaTimes size={8} /> : <span className='text-[9px] font-medium'>+</span>}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {getFilteredPairs().length === 0 && (
                            <div className='flex h-20 items-center justify-center text-center text-[13px] text-[#666]'>No instruments found matching "{searchQuery}"</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export const InstrumentsView = () => {
    const { selectedPairs, togglePair } = useDashboard();
    const { priceData } = useWebSocket();
    const [isSearching, setIsSearching] = useState(false);

    // Render selected pairs
    const selectedPairsItems = selectedPairs.map((item) => <PairItem key={item} item={item} isSelected={true} onToggle={() => togglePair(item)} price={priceData[item]?.price} />);

    // Group available pairs by category
    const availablePairsGroups = [
        { label: 'FX', items: FOREX_PAIRS },
        { label: 'CRYPTO', items: CRYPTO_PAIRS },
        { label: 'STOCKS', items: EQUITY_PAIRS },
        { label: 'ETF', items: ETF_PAIRS },
    ].map((group) => {
        const availablePairs = group.items.filter((item) => !selectedPairs.includes(item));
        if (availablePairs.length === 0) return null;

        const items = availablePairs.map((item) => <PairItem key={item} item={item} isSelected={false} onToggle={() => togglePair(item)} price={priceData[item]?.price} />);

        return <PairGroup key={group.label} label={group.label} items={items} count={availablePairs.length} />;
    });

    return (
        <div className='flex h-full flex-col'>
            <div className='sticky top-0 z-0'>
                <SearchBar onSearchStateChange={setIsSearching} />
            </div>
            <div className='flex-1 overflow-y-auto'>
                <div className={cn('transition-opacity duration-200', isSearching ? 'opacity-30' : 'opacity-100')}>
                    {selectedPairs.length > 0 && <PairGroup label='Selected Pairs' items={selectedPairsItems} count={selectedPairs.length} isSelected={true} />}
                    {availablePairsGroups}
                </div>
            </div>
        </div>
    );
};
