'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DraggableBorder } from '@/components/DraggableBorder';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import { LuMenu, LuOrbit, LuLayoutDashboard, LuLineChart, LuPin, LuPinOff } from 'react-icons/lu';
import { FaTimes } from 'react-icons/fa';
import { FOREX_PAIRS, CRYPTO_PAIRS } from '@/components/Constants/instruments';
import { useDashboard } from '@/providers/DashboardProvider/client';

interface InstrumentGroup {
    label: string;
    items: readonly string[];
}

const instrumentGroups: readonly InstrumentGroup[] = [
    { label: 'FX', items: FOREX_PAIRS },
    { label: 'CRYPTO', items: CRYPTO_PAIRS },
] as const;

export const LeftSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const { selectedPairs, togglePair, pairData } = useDashboard();
    const sidebarRef = useRef<HTMLDivElement>(null);

    const formatPrice = (price: number) => {
        return price.toFixed(price >= 100 ? 2 : 5);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!isPinned && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPinned]);

    useEffect(() => {
        const handleCloseSidebars = () => {
            if (!isPinned) {
                setIsOpen(false);
            }
        };

        window.addEventListener('closeSidebars', handleCloseSidebars);
        return () => {
            window.removeEventListener('closeSidebars', handleCloseSidebars);
        };
    }, [isPinned]);

    const handleToggleSidebar = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setIsPinned(false); // Reset pin state when opening
        }
    };

    return (
        <>
            {/* Sidebar Content */}
            <div ref={sidebarRef} className='sidebar-content'>
                <SidebarContent isOpen={isOpen} onClose={() => !isPinned && setIsOpen(false)}>
                    <div className='flex h-full flex-col'>
                        <div className='flex h-12 items-center justify-between border-b border-[#222] px-3'>
                            <div className='flex items-center gap-2'>
                                <h2 className='text-sm font-medium'>Menu</h2>
                                <div className='h-1 w-1 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' />
                            </div>
                            <button
                                onClick={() => setIsPinned(!isPinned)}
                                className={cn(
                                    'group flex h-7 w-7 items-center justify-center rounded-md transition-all',
                                    isPinned ? 'bg-blue-500/10 text-blue-400' : 'text-[#666] hover:bg-white/5'
                                )}>
                                {isPinned ? <LuPin size={14} /> : <LuPinOff size={14} />}
                            </button>
                        </div>

                        <div className='scrollbar-none flex-1 touch-pan-y overflow-y-scroll scroll-smooth p-3'>
                            {/* Selected Pairs Section */}
                            {selectedPairs.length > 0 && (
                                <div className='mb-4'>
                                    <div className='font-kodemono mb-2 flex h-8 items-center text-xs font-medium tracking-wider text-[#818181]'>
                                        <span className='uppercase'>My Symbols</span>
                                    </div>
                                    <div className='space-y-1'>
                                        {selectedPairs.map((item) => (
                                            <div
                                                key={item}
                                                className='group flex h-9 cursor-default items-center justify-between rounded border border-transparent bg-[#111] px-2 transition-all select-none hover:border-[#333]'>
                                                <div className='flex items-center overflow-hidden'>
                                                    <span className='font-outfit truncate text-[13px] font-bold tracking-wider text-white'>{item}</span>
                                                </div>
                                                <div className='flex shrink-0 items-center'>
                                                    <span className='font-kodemono text-[13px] font-medium tracking-wider text-[#666] transition-all group-hover:mr-3'>
                                                        {pairData[item]?.currentOHLC?.close ? formatPrice(pairData[item]?.currentOHLC?.close) : 'N/A'}
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
                            )}

                            {/* Available Pairs Sections */}
                            {instrumentGroups.map((group) => {
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
                                                    className='group flex h-9 cursor-default items-center justify-between border-l-2 border-transparent px-2 transition-all select-none hover:border-[#333] hover:bg-[#111]'>
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
                                                            className='flex h-5 w-5 items-center justify-center rounded border border-emerald-400 bg-emerald-400/80 opacity-0 transition-all group-hover:opacity-100 hover:text-white'>
                                                            <span className='text-[12px] font-bold text-black'>+</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SidebarContent>
            </div>

            {/* Fixed Sidebar */}
            <div className='fixed-sidebar fixed top-14 bottom-0 left-0 z-[90] flex w-14 flex-col items-center justify-between border-r border-[#222] bg-gradient-to-b from-black to-[#0A0A0A] py-4'>
                <div className='flex flex-col gap-2'>
                    <Link href='/dashboard'>
                        <button className='group flex h-10 w-10 items-center justify-center rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]'>
                            <LuLayoutDashboard size={20} className='text-[#818181] transition-colors group-hover:text-white' />
                        </button>
                    </Link>
                    <Link href='/test'>
                        <button className='group flex h-10 w-10 items-center justify-center rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]'>
                            <LuOrbit size={20} className='text-[#818181] transition-colors group-hover:text-white' />
                        </button>
                    </Link>
                    <button
                        onClick={handleToggleSidebar}
                        className={cn(
                            'sidebar-toggle group flex h-10 w-10 items-center justify-center rounded-lg border bg-gradient-to-b transition-all',
                            isOpen
                                ? 'border-blue-500/20 from-blue-500/10 to-blue-500/5 text-blue-400'
                                : 'border-[#222] from-[#141414] to-[#0A0A0A] text-[#818181] hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F] hover:text-white'
                        )}>
                        <LuLineChart size={20} className='transition-colors' />
                    </button>
                </div>
                {/* Menu button */}
                <button
                    onClick={handleToggleSidebar}
                    className={cn(
                        'sidebar-toggle group flex h-10 w-10 items-center justify-center rounded-lg border bg-gradient-to-b transition-all',
                        isOpen
                            ? 'border-blue-500/20 from-blue-500/10 to-blue-500/5 text-blue-400'
                            : 'border-[#222] from-[#141414] to-[#0A0A0A] text-[#818181] hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F] hover:text-white'
                    )}>
                    <LuMenu size={20} className='transition-colors' />
                </button>
            </div>
        </>
    );
};

interface SidebarContentProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const SidebarContent = ({ isOpen, onClose, children }: SidebarContentProps) => {
    const [width, setWidth] = useState(200);

    const handleResize = useCallback((newWidth: number) => {
        const constrainedWidth = Math.max(360, Math.min(600, newWidth));
        setWidth(constrainedWidth);
    }, []);

    // Update main content margin when sidebar opens/closes or resizes
    useEffect(() => {
        const main = document.querySelector('main');
        if (main) {
            if (isOpen) {
                main.style.marginLeft = `${width + 56}px`; // 56px = w-14 (sidebar width)
            } else {
                main.style.marginLeft = '56px'; // w-14
            }
        }
        return () => {
            if (main) {
                main.style.marginLeft = '0';
            }
        };
    }, [isOpen, width]);

    return (
        <div
            className={cn('fixed top-14 bottom-0 left-14 z-[90] flex transform transition-transform duration-300', isOpen ? 'translate-x-0' : '-translate-x-full')}
            style={{ width: `${width}px` }}>
            <div className='relative flex h-full w-full flex-col border-r border-[#222] bg-gradient-to-b from-black to-[#0A0A0A] shadow-2xl'>{children}</div>
            <DraggableBorder onResize={(delta) => handleResize(width + delta)} position='right' />
        </div>
    );
};
