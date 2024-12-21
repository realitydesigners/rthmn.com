'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { LuLayoutDashboard, LuOrbit, LuLineChart } from 'react-icons/lu';
import { FaTimes } from 'react-icons/fa';
import { cn } from '@/utils/cn';
import { FOREX_PAIRS, CRYPTO_PAIRS } from '@/components/Constants/instruments';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { SidebarContent } from '@/components/SidebarContent';

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
                    onLockToggle={() => setIsLocked(!isLocked)}
                    position='left'>
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
                                ? 'border-white/10 from-white/5 to-transparent text-white'
                                : 'border-[#222] from-[#141414] to-[#0A0A0A] text-[#818181] hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F] hover:text-white'
                        )}>
                        <LuLineChart size={20} className='transition-colors' />
                    </button>
                </div>
            </div>
        </>
    );
};
