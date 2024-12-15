'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLongPress } from '@/hooks/useLongPress';
import Link from 'next/link';
import { useDashboard } from '@/providers/DashboardProvider';
import { useSwipeable } from 'react-swipeable';
import { FOREX_PAIRS, CRYPTO_PAIRS } from '@/components/Constants/instruments';
import { LuDollarSign, LuBitcoin, LuList, LuBookmark, LuSearch, LuTrash2, LuArrowRight, LuPlus } from 'react-icons/lu';

const navigationButtons = [
    { mode: 'favorites', label: 'Favorites', icon: LuBookmark },
    { mode: 'fx', label: 'FX', icon: LuDollarSign },
    { mode: 'crypto', label: 'Crypto', icon: LuBitcoin },
    { mode: 'all', label: 'All', icon: LuList },
];

const useIntersectionObserver = (scrollRef: React.RefObject<HTMLDivElement>, currentPairs: string[], setActiveIndex: (index: number) => void) => {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
                        const index = parseInt(entry.target.getAttribute('data-index') || '0');
                        setActiveIndex(index);
                    }
                });
            },
            {
                root: scrollRef.current,
                threshold: 0.7,
                rootMargin: '-35% 0px -35% 0px',
            }
        );

        const pairElements = document.querySelectorAll('.pair-item');
        pairElements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, [currentPairs, scrollRef, setActiveIndex]);
};

const EmptyFavorites = ({ viewMode, setViewMode }: { viewMode: string; setViewMode: (mode: string) => void }) => (
    <div className='fixed bottom-24 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 border-t border-[#222] bg-black backdrop-blur-sm'>
        <div className='flex h-full flex-col px-3'>
            <div className='flex flex-1 flex-col items-center justify-center text-sm text-[#818181]'>
                <span>No instruments added to watchlist</span>
                <span className='mt-1 text-xs'>Use the search bar to add pairs</span>
            </div>

            <PairFilters viewMode={viewMode} setViewMode={setViewMode} />
        </div>
    </div>
);

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
    const [showRemoveForPair, setShowRemoveForPair] = useState<string | null>(null);
    const [showAddForPair, setShowAddForPair] = useState<string | null>(null);
    const [selectedPairForModal, setSelectedPairForModal] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const lastScrollPosition = useRef(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const [resetStates, setResetStates] = useState(() => () => {
        setShowRemoveForPair(null);
        setShowAddForPair(null);
    });

    const currentPairs =
        viewMode === 'favorites'
            ? selectedPairs
            : viewMode === 'fx'
              ? [...FOREX_PAIRS]
              : viewMode === 'crypto'
                ? [...CRYPTO_PAIRS]
                : ([...FOREX_PAIRS, ...CRYPTO_PAIRS] as string[]);

    const handleScroll = useCallback(() => {
        if (scrollRef.current) {
            resetStates();
        }
    }, [resetStates]);

    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (scrollElement) {
            scrollElement.addEventListener('scroll', handleScroll, { passive: true });
            scrollElement.addEventListener('touchmove', handleScroll, {
                passive: true,
            });

            return () => {
                scrollElement.removeEventListener('scroll', handleScroll);
                scrollElement.removeEventListener('touchmove', handleScroll);
            };
        }
    }, [handleScroll]);

    const handleIndexChange = (index: number) => {
        setActiveIndex(index);

        requestAnimationFrame(() => {
            const element = document.querySelector(`[data-index="${index}"]`);
            const container = scrollRef.current;

            if (element && container) {
                const elementRect = element.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                const scrollTop = container.scrollTop + elementRect.top - containerRect.top - (containerRect.height - elementRect.height) / 2;

                container.scrollTo({
                    top: scrollTop,
                    behavior: 'smooth',
                });
            }
        });
    };

    const handlers = useSwipeable({
        onSwipedUp: () => {
            resetStates();
            const nextIndex = Math.min(activeIndex + 1, currentPairs.length - 1);
            handleIndexChange(nextIndex);
        },
        onSwipedDown: () => {
            resetStates();
            const prevIndex = Math.max(activeIndex - 1, 0);
            handleIndexChange(prevIndex);
        },
        onSwiping: () => {
            resetStates();
        },
        onTouchStartOrOnMouseDown: () => {
            // Reset on any touch/mouse interaction
            resetStates();
        },
        trackMouse: true,
        swipeDuration: 500,
        preventScrollOnSwipe: true,
        delta: 50,
    });

    useEffect(() => {
        setActiveIndex(0);
    }, [viewMode]);

    useIntersectionObserver(scrollRef, currentPairs, setActiveIndex);

    useEffect(() => {
        setShowRemoveForPair(null);
    }, [viewMode]);

    useEffect(() => {
        const scrollElement = scrollRef.current;

        const handleScroll = () => {
            if (scrollElement) {
                const currentScroll = scrollElement.scrollTop;
                const scrollDiff = Math.abs(currentScroll - lastScrollPosition.current);

                // If scrolled more than 2px, reset states
                if (scrollDiff > 2) {
                    resetStates();
                }

                lastScrollPosition.current = currentScroll;
            }
        };

        scrollElement?.addEventListener('scroll', handleScroll);

        // Also handle touch events
        const handleTouch = () => {
            resetStates();
        };

        scrollElement?.addEventListener('touchstart', handleTouch);
        scrollElement?.addEventListener('touchmove', handleTouch);

        return () => {
            scrollElement?.removeEventListener('scroll', handleScroll);
            scrollElement?.removeEventListener('touchstart', handleTouch);
            scrollElement?.removeEventListener('touchmove', handleTouch);
        };
    }, [resetStates]);

    useEffect(() => {
        const scrollElement = scrollRef.current;
        let scrollTimeout: NodeJS.Timeout;

        const handleScroll = () => {
            console.log('🔄 Scrolling detected');
            setIsScrolling(true);
            resetStates();

            // Clear previous timeout
            clearTimeout(scrollTimeout);

            // Set new timeout
            scrollTimeout = setTimeout(() => {
                console.log('⏹️ Scroll ended');
                setIsScrolling(false);
            }, 150);
        };

        if (scrollElement) {
            scrollElement.addEventListener('scroll', handleScroll, { passive: true });
            scrollElement.addEventListener('touchmove', handleScroll, {
                passive: true,
            });
        }

        return () => {
            if (scrollElement) {
                scrollElement.removeEventListener('scroll', handleScroll);
                scrollElement.removeEventListener('touchmove', handleScroll);
            }
            clearTimeout(scrollTimeout);
        };
    }, [resetStates]);

    if (viewMode === 'favorites' && selectedPairs.length === 0) {
        return <EmptyFavorites viewMode={viewMode} setViewMode={setViewMode} />;
    }

    return (
        <div
            className={`scrollbar-none fixed right-0 bottom-0 left-0 z-[90] rounded-t-3xl rounded-t-[3em] border-t border-[#222] bg-black/95 pt-4 transition-all duration-300 ${
                isModalOpen ? 'h-[175px] lg:hidden' : 'h-[66vh]'
            }`}>
            <div className='pointer-events-none absolute top-2 right-0 left-0 z-[98] h-24 rounded-t-[3em] bg-gradient-to-b from-black via-black/95 to-transparent' />
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <div ref={scrollRef} className='scrollbar-none relative z-[96] h-[calc(100%-60px)] w-full overflow-hidden px-4' {...handlers}>
                <div className='pointer-events-none absolute top-1/2 right-0 left-0 z-[97] flex -translate-y-1/2 items-center justify-between'>
                    <div className='h-[2px] w-4 bg-gradient-to-r from-white/20 to-transparent' />
                    <div className='h-[2px] w-4 bg-gradient-to-l from-white/20 to-transparent' />
                </div>

                <div
                    className='scrollbar-none h-full touch-pan-y flex-col overflow-y-scroll scroll-smooth'
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        scrollSnapType: 'y mandatory',
                        scrollPaddingTop: '50%',
                        scrollPaddingBottom: '50%',
                    }}>
                    <div className='h-[50vh]' />

                    {currentPairs.map((pair, index) => (
                        <PairItem
                            key={pair}
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
                            onLongPressReset={resetStates}
                            style={{
                                scrollSnapAlign: 'center',
                                height: '64px',
                            }}
                        />
                    ))}

                    <div className='h-[50vh]' />
                </div>
            </div>
            <div className='pointer-events-none absolute right-0 bottom-0 left-0 z-[180] h-40 bg-gradient-to-t from-black via-black/95 to-transparent' />
            {!isModalOpen && <PairFilters viewMode={viewMode} setViewMode={setViewMode} />}
        </div>
    );
};

export const PairFilterButtons = ({ icon: Icon, isActive, onClick, label }: { icon: any; isActive: boolean; onClick: () => void; label: string }) => {
    return (
        <button onClick={onClick} className='group relative flex items-center'>
            <div
                className={`group flex h-10 w-full items-center justify-center rounded-full bg-gradient-to-b p-[1px] transition-all duration-200 ${
                    isActive ? 'from-[#444444] to-[#282828]' : 'from-[#333333] to-[#181818] hover:from-[#444444] hover:to-[#282828]'
                }`}>
                <div
                    className={`font-outfit flex h-full w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818] py-2 pr-4 pl-3 text-sm font-medium ${
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
                    <div className='flex items-baseline gap-3'>
                        <h3 className={`font-outfit text-2xl font-bold tracking-tight transition-all duration-300 ${isActive ? 'scale-105 text-white' : 'scale-90 text-[#222]'}`}>
                            {pair.replace('_', '/')}
                        </h3>

                        {currentPrice && <PairPrice price={currentPrice} isJPY={pair.includes('JPY')} isActive={isActive} />}

                        {isFavorite && viewMode !== 'favorites' && (
                            <LuBookmark size={15} className='ml-1 inline-block text-blue-400/70' style={{ transform: 'translateY(-2px)' }} />
                        )}
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
