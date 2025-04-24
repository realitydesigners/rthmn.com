'use client';

import { useUser } from '@/providers/UserProvider';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { useGridStore } from '@/stores/gridStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { cn } from '@/utils/cn';
import { CRYPTO_PAIRS, EQUITY_PAIRS, ETF_PAIRS, FOREX_PAIRS, INSTRUMENTS } from '@/utils/instruments';
import { formatPrice } from '@/utils/instruments';
import { Reorder, useDragControls } from 'framer-motion';
import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState, useMemo, memo, useCallback } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

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

const PairItem = memo(({ item, isSelected = false, onToggle }: Omit<PairItemProps, 'price'>) => {
    const { currentStepId } = useOnboardingStore();
    const { boxColors } = useUser();
    const { priceData } = useWebSocket();
    const isOnboardingActive = currentStepId === 'instruments';
    const price = priceData[item]?.price;

    return (
        <div
            className={cn(
                'group/item relative flex h-10 w-full items-center rounded-lg transition-all duration-300 select-none',
                isSelected ? 'bg-[#141414] hover:bg-[#181818]' : 'bg-[#0C0C0C] hover:bg-[#111]'
            )}
            role='button'
            tabIndex={0}
        >
            <div className='relative flex w-full items-center px-3'>
                {/* Status indicator */}
                <div className='relative flex h-8 w-8 items-center justify-center'>
                    <div
                        className={cn(
                            'h-1.5 w-1.5 rounded-full transition-all duration-300',
                            isSelected ? 'opacity-100' : 'opacity-40'
                        )}
                        style={{
                            background: isSelected
                                ? `linear-gradient(135deg, ${boxColors.positive}, ${boxColors.negative})`
                                : '#333',
                        }}
                    />
                </div>

                {/* Instrument name */}
                <span
                    className={cn(
                        'font-outfit flex-1 text-sm font-bold tracking-wide transition-colors',
                        isSelected ? 'text-white' : 'text-[#666] group-hover/item:text-[#888]'
                    )}
                >
                    {item}
                </span>

                {/* Price */}
                <div className='flex items-center'>
                    <span
                        className={cn(
                            'font-kodemono w-[70px] text-right text-sm tracking-wider transition-colors',
                            isSelected ? 'text-[#999]' : 'text-[#444] group-hover/item:text-[#666]'
                        )}
                    >
                        {price ? (
                            formatPrice(price, item)
                        ) : (
                            <LoadingSpinner
                                key={`${item}-loading`}
                                itemId={item}
                                color={isSelected ? boxColors.positive : '#444'}
                            />
                        )}
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
                                'opacity-0 group-hover/item:opacity-100',
                                isSelected
                                    ? [
                                          'border-[#333] bg-[#1A1A1A] text-[#666]',
                                          'hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-400',
                                      ]
                                    : [
                                          'border-[#222] bg-[#141414] text-[#666]',
                                          'hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-400',
                                      ]
                            )}
                        >
                            {isSelected ? <FaTimes size={8} /> : <span className='text-[9px] font-medium'>+</span>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

interface PairGroupProps {
    label: string;
    items: React.ReactNode;
    count: number;
    isSelected?: boolean;
}

const PairGroup = memo(({ label, items, count, isSelected = false }: PairGroupProps) => {
    return (
        <div className='mb-4'>
            <div className='font-kodemono mb-2 flex h-8 items-center text-xs font-medium tracking-wider text-[#818181]'>
                <span className='uppercase'>{label}</span>
                <div className='ml-auto flex items-center gap-1.5'>
                    <div
                        className={cn('h-1.5 w-1.5 rounded-full', isSelected ? 'bg-emerald-400/50' : 'bg-[#333]/50')}
                    ></div>
                    <span className='text-[#444]'>{count}</span>
                </div>
            </div>
            <div className='space-y-1'>{items}</div>
        </div>
    );
});

// Memoized search result item component
const SearchResultItem = memo(
    ({ pair, isSelected, onSelect }: { pair: string; isSelected: boolean; onSelect: () => void }) => {
        const { boxColors } = useUser();
        const { priceData } = useWebSocket();
        const price = priceData[pair]?.price;

        return (
            <div
                className={cn(
                    'group/result relative flex h-10 items-center justify-between px-3 transition-all duration-300',
                    isSelected ? 'bg-[#141414]/90' : 'hover:bg-[#111]/90'
                )}
                onClick={onSelect}
            >
                {/* Left side */}
                <div className='flex items-center gap-3'>
                    <div className='relative flex h-8 w-8 items-center justify-center'>
                        <div
                            className={cn(
                                'absolute h-4 w-4 rounded-full transition-all duration-300',
                                isSelected ? 'opacity-10' : 'opacity-0 group-hover/result:opacity-5'
                            )}
                            style={{
                                background: isSelected
                                    ? `radial-gradient(circle at center, ${boxColors.positive}, ${boxColors.negative})`
                                    : '#333',
                            }}
                        />
                        <div
                            className={cn(
                                'h-1.5 w-1.5 rounded-full transition-all duration-300',
                                isSelected ? 'scale-100' : 'scale-90 opacity-40'
                            )}
                            style={{
                                background: isSelected
                                    ? `linear-gradient(135deg, ${boxColors.positive}, ${boxColors.negative})`
                                    : '#333',
                            }}
                        />
                    </div>
                    <span
                        className={cn(
                            'font-outfit text-[13px] font-bold tracking-wide transition-colors',
                            isSelected ? 'text-white' : 'text-[#666] group-hover/result:text-[#888]'
                        )}
                    >
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
                        )}
                    >
                        {price ? formatPrice(price, pair) : 'N/A'}
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect();
                        }}
                        className={cn(
                            'relative inline-flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-200',
                            'opacity-0 group-hover/result:opacity-100',
                            isSelected
                                ? [
                                      'border-[#333] bg-[#1A1A1A] text-[#666]',
                                      'hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-400',
                                  ]
                                : [
                                      'border-[#222] bg-[#141414] text-[#666]',
                                      'hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-400',
                                  ]
                        )}
                    >
                        {isSelected ? <FaTimes size={8} /> : <span className='text-[9px] font-medium'>+</span>}
                    </button>
                </div>
            </div>
        );
    }
);

// Memoized filtered pairs calculation
const useFilteredPairs = (searchQuery: string, selectedPairs: string[]) => {
    return useMemo(() => {
        if (!searchQuery) return [];

        const allPairs = [...FOREX_PAIRS, ...CRYPTO_PAIRS, ...EQUITY_PAIRS, ...ETF_PAIRS];
        return allPairs
            .filter((pair) => pair.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                const aSelected = selectedPairs.includes(a);
                const bSelected = selectedPairs.includes(b);
                if (aSelected && !bSelected) return -1;
                if (!aSelected && bSelected) return 1;
                return 0;
            });
    }, [searchQuery, selectedPairs]);
};

const SearchBar = memo(({ onSearchStateChange }: { onSearchStateChange: (isSearching: boolean) => void }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const { selectedPairs, togglePair } = useUser();
    const searchRef = useRef<HTMLDivElement>(null);

    const filteredPairs = useFilteredPairs(searchQuery, selectedPairs);

    const handleToggle = useCallback(
        (pair: string) => {
            togglePair(pair);
            setSearchQuery('');
            setShowResults(false);
        },
        [togglePair]
    );

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
                    className='font-outfit relative h-full flex-1 bg-transparent px-3 text-[13px] font-medium text-[#888] placeholder-[#666] transition-colors outline-none'
                />

                {/* Clear Button */}
                {searchQuery && (
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setShowResults(false);
                        }}
                        className='relative mr-3 flex h-5 w-5 items-center justify-center rounded-md border border-[#222] bg-[#141414] text-[#666] transition-all hover:border-[#333] hover:bg-[#1A1A1A] hover:text-[#888]'
                    >
                        <FaTimes size={8} />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {showResults && searchQuery && (
                <div className='absolute top-full right-0 left-0 z-10 overflow-hidden bg-[#0C0C0C] pt-2 shadow-lg'>
                    <div className='max-h-[280px] overflow-y-auto rounded-lg border border-[#222]'>
                        {filteredPairs.map((pair) => (
                            <SearchResultItem
                                key={pair}
                                pair={pair}
                                isSelected={selectedPairs.includes(pair)}
                                onSelect={() => handleToggle(pair)}
                            />
                        ))}
                        {filteredPairs.length === 0 && (
                            <div className='flex h-20 items-center justify-center text-center text-[13px] text-[#666]'>
                                No instruments found matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

// DraggableItem component to handle individual drag controls
const DraggableItem = memo(({ item, onToggle }: { item: string; onToggle: () => void }) => {
    const { boxColors } = useUser();
    const { priceData } = useWebSocket();
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={item}
            id={item}
            dragListener={false}
            dragControls={dragControls}
            className='group/drag mb-1'
            whileDrag={{ zIndex: 50 }}
            style={{ position: 'relative', zIndex: 0 }}
        >
            <motion.div
                className='relative flex w-full items-center rounded-lg'
                layout='position'
                transition={{ duration: 0.15 }}
                whileDrag={{ zIndex: 50 }}
            >
                <div className='w-full'>
                    {/* Drag Handle */}
                    <motion.button
                        className='absolute top-1/2 left-0 z-[100] -translate-y-1/2 cursor-grab active:cursor-grabbing'
                        onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dragControls.start(e);
                        }}
                    >
                        <div className='flex h-8 w-8 items-center justify-center opacity-0 transition-all duration-200 group-hover/drag:opacity-60'>
                            <svg width='14' height='14' viewBox='0 0 16 16' fill='none' className='pointer-events-none'>
                                <path d='M7 3H5V5H7V3Z' fill='#666' />
                                <path d='M7 7H5V9H7V7Z' fill='#666' />
                                <path d='M7 11H5V13H7V11Z' fill='#666' />
                                <path d='M11 3H9V5H11V3Z' fill='#666' />
                                <path d='M11 7H9V9H11V7Z' fill='#666' />
                                <path d='M11 11H9V13H11V11Z' fill='#666' />
                            </svg>
                        </div>
                    </motion.button>

                    {/* Item Content */}
                    <div className='group/item relative flex h-10 w-full items-center rounded-lg bg-[#141414] transition-all duration-300 select-none hover:bg-[#181818]'>
                        <div className='relative flex w-full items-center px-3'>
                            {/* Status indicator */}
                            <div className='relative flex h-8 w-8 items-center justify-center'>
                                <div
                                    className='h-1.5 w-1.5 rounded-full opacity-100 transition-all duration-300'
                                    style={{
                                        background: `linear-gradient(135deg, ${boxColors.positive}, ${boxColors.negative})`,
                                    }}
                                />
                            </div>

                            {/* Instrument name */}
                            <span className='font-outfit flex-1 text-sm font-bold tracking-wide text-white transition-colors'>
                                {item}
                            </span>

                            {/* Price */}
                            <div className='flex items-center'>
                                <span className='font-kodemono w-[70px] text-right text-sm tracking-wider text-[#999] transition-colors'>
                                    {priceData[item]?.price ? (
                                        formatPrice(priceData[item].price, item)
                                    ) : (
                                        <LoadingSpinner
                                            key={`${item}-loading`}
                                            itemId={item}
                                            color={boxColors.positive}
                                        />
                                    )}
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
                                            'opacity-0 group-hover/item:opacity-100',
                                            'border-[#333] bg-[#1A1A1A] text-[#666] hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-400'
                                        )}
                                    >
                                        <FaTimes size={8} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Reorder.Item>
    );
});

DraggableItem.displayName = 'DraggableItem';

export const InstrumentsPanel = () => {
    const { selectedPairs, togglePair } = useUser();
    const { priceData } = useWebSocket();
    const [isSearching, setIsSearching] = useState(false);
    const reorderPairs = useGridStore((state) => state.reorderPairs);

    // Memoized selected pairs items
    const selectedPairsItems = useMemo(
        () => selectedPairs.map((item) => <DraggableItem key={item} item={item} onToggle={() => togglePair(item)} />),
        [selectedPairs, togglePair]
    );

    // Memoized available pairs groups
    const availablePairsGroups = useMemo(
        () =>
            [
                { label: 'FX', items: FOREX_PAIRS },
                { label: 'CRYPTO', items: CRYPTO_PAIRS },
                { label: 'STOCKS', items: EQUITY_PAIRS },
                { label: 'ETF', items: ETF_PAIRS },
            ]
                .map((group) => {
                    const availablePairs = group.items.filter((item) => !selectedPairs.includes(item));
                    if (availablePairs.length === 0) return null;

                    const items = availablePairs.map((item) => (
                        <PairItem key={item} item={item} isSelected={false} onToggle={() => togglePair(item)} />
                    ));

                    return (
                        <PairGroup key={group.label} label={group.label} items={items} count={availablePairs.length} />
                    );
                })
                .filter(Boolean),
        [selectedPairs, togglePair]
    );

    return (
        <div className='flex h-full flex-col'>
            <div className='sticky top-0 z-10 bg-[#0a0a0a] pb-4'>
                <SearchBar onSearchStateChange={setIsSearching} />
            </div>
            <div className={cn('flex-1 overflow-y-auto', isSearching ? 'opacity-30' : 'opacity-100')}>
                {selectedPairs.length > 0 && (
                    <PairGroup
                        label='Selected Pairs'
                        items={
                            <Reorder.Group axis='y' values={selectedPairs} onReorder={reorderPairs}>
                                {selectedPairsItems}
                            </Reorder.Group>
                        }
                        count={selectedPairs.length}
                        isSelected={true}
                    />
                )}
                {availablePairsGroups}
            </div>
        </div>
    );
};
