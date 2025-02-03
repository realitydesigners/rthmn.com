'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { LuArrowRight, LuBitcoin, LuBookmark, LuDollarSign, LuList, LuPlus, LuSearch, LuTrash2 } from 'react-icons/lu';
import { useSwipeable } from 'react-swipeable';
import { useLongPress } from '@/hooks/useLongPress';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { CRYPTO_PAIRS, FOREX_PAIRS } from '@/utils/instruments';

const useSound = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio('/click.wav');
        audioRef.current.volume = 0.5;
        return () => {
            if (audioRef.current) {
                audioRef.current = null;
            }
        };
    }, []);

    const play = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {
                // Ignore errors (e.g. if user hasn't interacted with page yet)
            });
        }
    }, []);

    return { play };
};

const navigationButtons = [
    { mode: 'favorites', label: 'Favorites', icon: LuBookmark },
    { mode: 'fx', label: 'FX', icon: LuDollarSign },
    { mode: 'crypto', label: 'Crypto', icon: LuBitcoin },
    { mode: 'all', label: 'All', icon: LuList },
];

const useIntersectionObserver = (scrollRef: React.RefObject<HTMLDivElement>, currentPairs: string[], setActiveIndex: (index: number) => void) => {
    const { play } = useSound();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (!scrollRef.current) return;

                // Find the entry closest to the center of the viewport
                let closestEntry = null;
                let minDistance = Infinity;

                entries.forEach((entry) => {
                    const rect = entry.boundingClientRect;
                    const viewportHeight = window.innerHeight;
                    const centerY = viewportHeight / 2;
                    const elementCenterY = rect.top + rect.height / 2;
                    const distance = Math.abs(centerY - elementCenterY);

                    if (distance < minDistance && entry.isIntersecting) {
                        minDistance = distance;
                        closestEntry = entry;
                    }
                });

                if (closestEntry && minDistance < 10) {
                    // Only trigger if very close to center
                    const index = parseInt(closestEntry.target.getAttribute('data-index') || '0');
                    setActiveIndex(index);
                    play();
                }
            },
            {
                root: scrollRef.current,
                threshold: [0.5, 0.6, 0.7, 0.8, 0.9, 1],
                rootMargin: '-40% 0px -40% 0px', // Tighter margin for more precise center detection
            }
        );

        const pairElements = document.querySelectorAll('.pair-item');
        pairElements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, [currentPairs, scrollRef, setActiveIndex, play]);
};

const PairFilters = ({ viewMode, setViewMode }: { viewMode: string; setViewMode: (mode: string) => void }) => (
    <div className='absolute right-0 bottom-22 left-0 z-[1000] flex items-center justify-center gap-2 py-2'>
        {navigationButtons.map((button) => (
            <PairFilterButtons key={button.mode} icon={button.icon} isActive={viewMode === button.mode} onClick={() => setViewMode(button.mode)} label={button.label} />
        ))}
    </div>
);

interface PairNavigatorProps {
    isModalOpen?: boolean;
}

export const PairNavigator = ({ isModalOpen }: PairNavigatorProps) => {
    const { selectedPairs, togglePair, pairData } = useDashboard();
    const [activeIndex, setActiveIndex] = useState(0);
    const [viewMode, setViewMode] = useState<string>('favorites');
    const scrollRef = useRef<HTMLDivElement>(null);
    const { play } = useSound();
    const [showRemoveForPair, setShowRemoveForPair] = useState<string | null>(null);
    const [showAddForPair, setShowAddForPair] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const currentPairs =
        viewMode === 'favorites'
            ? selectedPairs
            : viewMode === 'fx'
              ? [...FOREX_PAIRS]
              : viewMode === 'crypto'
                ? [...CRYPTO_PAIRS]
                : ([...FOREX_PAIRS, ...CRYPTO_PAIRS] as string[]);

    const handleIndexChange = (index: number) => {
        if (index >= 0 && index < currentPairs.length) {
            setActiveIndex(index);
            play();
        }
    };

    // Handle scroll events to determine active item
    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;

        const container = scrollRef.current;
        const containerRect = container.getBoundingClientRect();
        const centerY = containerRect.top + containerRect.height / 2;

        // Find the item closest to the center
        const items = container.getElementsByClassName('pair-item');
        let closestItem = null;
        let minDistance = Infinity;

        Array.from(items).forEach((item) => {
            const rect = item.getBoundingClientRect();
            const distance = Math.abs(rect.top + rect.height / 2 - centerY);
            if (distance < minDistance) {
                minDistance = distance;
                closestItem = item;
            }
        });

        if (closestItem) {
            const index = parseInt(closestItem.getAttribute('data-index') || '0');
            if (index !== activeIndex) {
                handleIndexChange(index);
            }
        }
    }, [activeIndex, handleIndexChange]);

    useEffect(() => {
        const container = scrollRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    return (
        <div
            className={`scrollbar-none fixed right-0 bottom-0 left-0 z-[90] rounded-t-3xl rounded-t-[3em] border-t border-[#222] bg-gradient-to-b from-[#010101] via-[#0a0a0a] to-[#010101] pt-3 transition-all duration-300 ${
                isModalOpen ? 'h-[175px] lg:hidden' : 'h-[50vh]'
            }`}>
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            {/* Main container */}
            <div className='relative h-[calc(100%-120px)]'>
                {/* Scrollable list */}
                <div
                    ref={scrollRef}
                    className='scrollbar-none absolute inset-0 overflow-y-scroll'
                    style={{
                        scrollSnapType: 'y mandatory',
                        WebkitOverflowScrolling: 'touch',
                    }}>
                    {/* Top spacer */}
                    <div className='h-[calc(40vh-32px)]' />

                    {/* Pairs list */}
                    <div className='space-y-0 px-4'>
                        {currentPairs.map((pair, index) => (
                            <div
                                key={pair}
                                data-index={index}
                                className='pair-item'
                                style={{
                                    scrollSnapAlign: 'center',
                                    scrollSnapStop: 'always',
                                }}>
                                <PairItem
                                    pair={pair}
                                    index={index}
                                    isActive={activeIndex === index}
                                    isFavorite={selectedPairs.includes(pair)}
                                    currentPrice={pairData[pair]?.currentOHLC?.close}
                                    showRemove={showRemoveForPair === pair}
                                    showAdd={showAddForPair === pair}
                                    onIndexChange={handleIndexChange}
                                    onRemove={() => {
                                        togglePair(pair);
                                        setShowRemoveForPair(null);
                                    }}
                                    onCancelRemove={() => setShowRemoveForPair(null)}
                                    setShowRemoveForPair={setShowRemoveForPair}
                                    setShowAddForPair={setShowAddForPair}
                                    toggleFavorite={() => togglePair(pair)}
                                    viewMode={viewMode}
                                    onViewClick={() => {}}
                                    onLongPressReset={() => {}}
                                    style={{
                                        height: '50px',
                                        opacity: activeIndex === index ? 1 : 0.3,
                                        transform: `scale(${activeIndex === index ? 1 : 0.95})`,
                                        transition: 'all 0.2s ease-out',
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Bottom spacer */}
                    <div className='h-[calc(40vh-32px)]' />
                </div>
            </div>

            {!isModalOpen && <PairFilters viewMode={viewMode} setViewMode={setViewMode} />}
        </div>
    );
};

export const PairFilterButtons = ({ icon: Icon, isActive, onClick, label }: { icon: any; isActive: boolean; onClick: () => void; label: string }) => {
    return (
        <button onClick={onClick} className='group relative flex items-center'>
            <div
                className={`group flex h-9 w-full items-center justify-center rounded-full bg-gradient-to-b p-[1px] transition-all duration-200 ${
                    isActive ? 'from-[#444444] to-[#282828]' : 'from-[#333333] to-[#181818] hover:from-[#444444] hover:to-[#282828]'
                }`}>
                <div
                    className={`font-outfit flex h-full w-full items-center justify-center gap-1 rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818] py-2 pr-4 pl-3 text-sm font-medium ${
                        isActive ? 'text-gray-200' : 'text-[#818181]'
                    }`}>
                    <Icon size={14} />
                    {label}
                </div>
            </div>
        </button>
    );
};

export const SearchBar = ({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (query: string) => void }) => {
    return (
        <div className='relative z-[99] flex justify-center px-4'>
            <div className='relative flex w-full items-center rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] shadow-xl transition-all duration-200 hover:from-[#444444] hover:to-[#282828] sm:max-w-[300px] lg:max-w-[300px]'>
                <div className='flex h-12 w-full items-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818]'>
                    <LuSearch className='ml-4 h-5 w-5 text-[#666]' />
                    <input
                        type='text'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder='Search instruments...'
                        className='font-outfit text-md ml-2 w-full bg-transparent pr-3 text-white placeholder-[#666] focus:outline-none'
                    />
                </div>
            </div>
        </div>
    );
};

// Extract action buttons into separate components
const ViewButton = ({ pair }: { pair: string }) => (
    <Link
        href={`/pair/${pair}`}
        as={`/pair/${pair}`}
        prefetch={false}
        onClick={(e) => e.stopPropagation()}
        className='-webkit-tap-highlight-color-transparent flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-gray-300 transition-all outline-none hover:bg-white/20 hover:text-white focus:outline-none'
        style={{ WebkitTapHighlightColor: 'transparent' }}>
        <LuArrowRight size={24} />
    </Link>
);

const RemoveActions = ({ onCancel, onRemove }: { onCancel: (e: React.MouseEvent) => void; onRemove: (e: React.MouseEvent) => void }) => (
    <div className='-webkit-tap-highlight-color-transparent bg-red-500/05 flex h-11 w-11 items-center justify-center rounded-full text-red-400 transition-all hover:bg-red-500/20 hover:text-white'>
        {/* <ActionButton onClick={onCancel} icon={<LuX size={22} />} /> */}
        <ActionButton onClick={onRemove} icon={<LuTrash2 size={24} />} variant='danger' />
    </div>
);

const AddActions = ({ onCancel, onAdd }: { onCancel: (e: React.MouseEvent) => void; onAdd: (e: React.MouseEvent) => void }) => (
    <div className='-webkit-tap-highlight-color-transparent bg-emerald-500/05 flex h-11 w-11 items-center justify-center rounded-full text-emerald-400 transition-all hover:bg-emerald-500/20 hover:text-white'>
        {/* <ActionButton onClick={onCancel} icon={<LuX size={22} />} /> */}
        <ActionButton onClick={onAdd} icon={<LuPlus size={24} />} variant='success' />
    </div>
);

const PairPrice = ({ price, isJPY, isActive }: { price: number; isJPY: boolean; isActive: boolean }) => (
    <div className={`font-kodemono ml-2 text-sm ${isActive ? 'text-white' : 'text-[#222]'}`}>{price.toFixed(isJPY ? 3 : 5)}</div>
);

export const PairItem = ({
    pair,
    index,
    isActive,
    isFavorite,
    currentPrice,
    showRemove,
    showAdd,
    onIndexChange,
    onRemove,
    onCancelRemove,
    setShowRemoveForPair,
    setShowAddForPair,
    toggleFavorite,
    viewMode,
    onViewClick,
    onLongPressReset,
    style,
}: {
    pair: string;
    index: number;
    isActive: boolean;
    isFavorite: boolean;
    currentPrice: number;
    showRemove: boolean;
    showAdd: boolean;
    onIndexChange: (index: number) => void;
    onRemove: () => void;
    onCancelRemove: () => void;
    setShowRemoveForPair: (pair: string) => void;
    setShowAddForPair: (pair: string | null) => void;
    toggleFavorite: () => void;
    viewMode: string;
    onViewClick: (pair: string) => void;
    onLongPressReset: () => void;
    style?: React.CSSProperties;
}) => {
    const { isPressed, handlers } = useLongPress(() => {
        setTimeout(() => {
            onIndexChange(index);

            if (isFavorite) {
                setShowRemoveForPair(pair);
            } else if (viewMode !== 'favorites') {
                setShowAddForPair(pair);
            }
        }, 50);
    });

    useEffect(() => {
        setShowAddForPair(null);
    }, [onLongPressReset]);

    const renderActions = () => {
        if (showRemove) {
            return (
                <RemoveActions
                    onCancel={(e) => {
                        e.stopPropagation();
                        onCancelRemove();
                    }}
                    onRemove={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                />
            );
        }

        if (showAdd) {
            return (
                <AddActions
                    onCancel={(e) => {
                        e.stopPropagation();
                        setShowAddForPair(null);
                    }}
                    onAdd={(e) => {
                        e.stopPropagation();
                        toggleFavorite();
                        setShowAddForPair(null);
                    }}
                />
            );
        }

        if (isActive) {
            return <ViewButton pair={pair} />;
        }

        return null;
    };

    return (
        <div
            data-index={index}
            className={`pair-item relative shrink-0 cursor-pointer touch-none px-2 py-4 transition-all duration-300 select-none ${isPressed ? 'scale-[0.98]' : ''}`}
            style={{
                scrollSnapAlign: 'center',
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                touchAction: 'manipulation',
                WebkitTouchCallout: 'none',
                ...style,
            }}
            onClick={() => !showRemove && !showAdd && onIndexChange(index)}
            {...handlers}>
            <div className='relative z-10 flex flex-col'>
                <div className='group flex w-full items-center justify-between'>
                    <div className='flex items-baseline gap-2'>
                        <h3 className={`font-outfit text-2xl font-bold tracking-tight transition-all duration-300 ${isActive ? 'scale-105 text-white' : 'scale-90 text-[#444]'}`}>
                            {pair.replace('_', '/')}
                        </h3>

                        {currentPrice && <PairPrice price={currentPrice} isJPY={pair.includes('JPY')} isActive={isActive} />}

                        {isFavorite && viewMode !== 'favorites' && <LuBookmark size={15} className='ml-1 inline-block text-blue-400/70' />}
                    </div>

                    <div className='flex items-center gap-3'>{renderActions()}</div>
                </div>

                {isActive && !showRemove && !showAdd && <PairIndicator type='active' />}
                {showRemove && <PairIndicator type='remove' />}
                {showAdd && <PairIndicator type='add' />}
            </div>
        </div>
    );
};

const ActionButton = ({ onClick, icon, variant = 'default' }: { onClick: (e: React.MouseEvent) => void; icon: React.ReactNode; variant?: 'default' | 'danger' | 'success' }) => {
    const variantStyles = {
        default: 'bg-white/10 hover:bg-white/20 text-gray-300',
        danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
        success: 'bg-green-500/10 text-green-400 hover:bg-green-500/20',
    };

    return (
        <button onClick={onClick} className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${variantStyles[variant]}`}>
            {icon}
        </button>
    );
};

const PairIndicator = ({ type }: { type: 'active' | 'remove' | 'add' }) => {
    const styles = {
        active: 'bg-gradient-to-r from-white/20 to-transparent',
        remove: 'animate-pulse bg-gradient-to-r from-red-400/20 to-transparent',
        add: 'animate-pulse bg-gradient-to-r from-green-400/20 to-transparent',
    };

    return <div className={`absolute top-1/2 -left-4 h-[2px] w-3 -translate-y-1/2 ${styles[type]}`} />;
};
