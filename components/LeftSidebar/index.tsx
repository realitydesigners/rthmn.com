'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DraggableBorder } from '@/components/DraggableBorder';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import { LuMenu, LuOrbit, LuLayoutDashboard, LuLineChart, LuLock, LuUnlock } from 'react-icons/lu';
import { FaTimes } from 'react-icons/fa';
import { FOREX_PAIRS, CRYPTO_PAIRS } from '@/components/Constants/instruments';
import { useDashboard } from '@/providers/DashboardProvider/client';

type ActivePanel = 'menu' | 'chart' | null;

export const LeftSidebar = () => {
    const [activePanel, setActivePanel] = useState<ActivePanel>(null);
    const [isLocked, setIsLocked] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const { selectedPairs, togglePair, pairData } = useDashboard();

    const handlePanelToggle = (panel: ActivePanel) => {
        setActivePanel((prev) => {
            if (prev === panel) {
                setIsLocked(false);
                return null;
            }
            return panel;
        });
    };

    const formatPrice = (price: number) => {
        return price.toFixed(price >= 100 ? 2 : 5);
    };

    const renderPanelContent = () => {
        switch (activePanel) {
            case 'menu':
            case 'chart':
                return (
                    <>
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
                                            className='group flex h-9 cursor-default items-center justify-between rounded-lg border border-transparent bg-[#111] px-3 transition-all select-none hover:border-[#333]'>
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
                                                    className='flex h-5 w-5 items-center justify-center rounded-md border border-red-400 bg-red-400/80 opacity-0 transition-all group-hover:opacity-100 hover:text-white'>
                                                    <FaTimes size={10} className='text-black' />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Available Pairs Sections */}
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
            default:
                return null;
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!isLocked && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                // Check if the click was inside any sidebar or sidebar toggle
                const isClickInAnySidebar = (event.target as Element).closest('.sidebar-content, .fixed-sidebar');
                if (!isClickInAnySidebar) {
                    setActivePanel(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLocked]);

    useEffect(() => {
        const handleCloseSidebars = () => {
            if (!isLocked) {
                setActivePanel(null);
            }
        };

        window.addEventListener('closeSidebars', handleCloseSidebars);
        return () => {
            window.removeEventListener('closeSidebars', handleCloseSidebars);
        };
    }, [isLocked]);

    return (
        <>
            <div ref={sidebarRef} className='sidebar-content'>
                <SidebarContent
                    isOpen={activePanel !== null}
                    onClose={() => !isLocked && setActivePanel(null)}
                    title={activePanel === 'menu' ? 'Menu' : 'Chart'}
                    isLocked={isLocked}
                    onLockToggle={() => setIsLocked(!isLocked)}>
                    {renderPanelContent()}
                </SidebarContent>
            </div>

            {/* Fixed Sidebar */}
            <div className='fixed-sidebar fixed top-14 bottom-0 left-0 z-[90] flex w-16 flex-col items-center justify-center py-4'>
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
                        onClick={() => handlePanelToggle('chart')}
                        className={cn(
                            'sidebar-toggle group flex h-10 w-10 items-center justify-center rounded-lg border bg-gradient-to-b transition-all',
                            activePanel === 'chart'
                                ? 'border-blue-500/20 from-blue-500/10 to-blue-500/5 text-blue-400'
                                : 'border-[#222] from-[#141414] to-[#0A0A0A] text-[#818181] hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F] hover:text-white'
                        )}>
                        <LuLineChart size={20} className='transition-colors' />
                    </button>
                </div>
            </div>
        </>
    );
};

interface SidebarContentProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: string;
    isLocked: boolean;
    onLockToggle: () => void;
}

export const SidebarContent = ({ isOpen, onClose, children, title, isLocked, onLockToggle }: SidebarContentProps) => {
    const [width, setWidth] = useState(275);

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
            className={cn(
                'fixed top-14 bottom-0 left-12 z-[90] flex transform transition-all duration-300',
                isOpen ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-[150%] opacity-0'
            )}
            style={{ width: `${width}px` }}>
            <div className='group relative my-4 ml-4 flex h-[calc(100%-2rem)] w-full rounded-2xl bg-gradient-to-b from-[#333]/30 via-[#222]/25 to-[#111]/30 p-[1px] transition-all duration-300 hover:from-[#333]/40 hover:via-[#222]/35 hover:to-[#111]/40'>
                <div className='relative flex h-full w-full flex-col rounded-2xl bg-[linear-gradient(to_bottom,rgba(10,10,10,0.95),rgba(17,17,17,0.95))] backdrop-blur-md'>
                    {/* Header Section */}
                    <div className='relative z-10 mb-2 flex h-12 items-center justify-between px-4'>
                        <div className='flex items-center gap-2'>
                            <h2 className='text-sm font-medium tracking-wide'>{title}</h2>
                            <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]'></div>
                        </div>
                        <button
                            onClick={onLockToggle}
                            className={cn(
                                'group flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-b transition-all duration-300',
                                isLocked
                                    ? 'from-blue-500/20 to-blue-400/10 text-blue-400 shadow-[0_0_15px_-3px_rgba(96,165,250,0.3)]'
                                    : 'from-[#222]/50 to-[#111]/50 text-[#666] hover:from-[#333]/50 hover:to-[#222]/50 hover:text-white/90'
                            )}>
                            {isLocked ? <LuLock size={14} /> : <LuUnlock size={14} />}
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className='scrollbar-none relative flex-1 touch-pan-y overflow-y-scroll scroll-smooth px-4 pb-4'>{children}</div>
                </div>

                <div
                    className='absolute top-0 -right-4 bottom-0 w-4 cursor-ew-resize opacity-0 transition-opacity duration-200 group-hover:opacity-100'
                    onMouseDown={(e) => {
                        e.preventDefault();
                        const startX = e.clientX;
                        const startWidth = width;

                        const handleMouseMove = (e: MouseEvent) => {
                            const delta = e.clientX - startX;
                            const newWidth = Math.max(360, Math.min(600, startWidth + delta));
                            handleResize(newWidth);
                        };

                        const handleMouseUp = () => {
                            window.removeEventListener('mousemove', handleMouseMove);
                            window.removeEventListener('mouseup', handleMouseUp);
                        };

                        window.addEventListener('mousemove', handleMouseMove);
                        window.addEventListener('mouseup', handleMouseUp);
                    }}></div>
            </div>
        </div>
    );
};
