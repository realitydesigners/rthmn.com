'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { LuLayoutDashboard, LuOrbit, LuLineChart } from 'react-icons/lu';
import { cn } from '@/utils/cn';
import { SidebarContent } from '@/components/SidebarContent';
import { SelectedPairs } from '@/components/LeftSidebar/SelectedPairs';
import { AvailablePairs } from '@/components/LeftSidebar/AvailablePairs';

type ActivePanel = 'menu' | 'chart' | null;

export const LeftSidebar = () => {
    const [activePanel, setActivePanel] = useState<ActivePanel>(null);
    const [isLocked, setIsLocked] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const handlePanelToggle = (panel: ActivePanel) => {
        setActivePanel((prev) => {
            if (prev === panel) {
                setIsLocked(false);
                return null;
            }
            return panel;
        });
    };

    const renderPanelContent = () => {
        switch (activePanel) {
            case 'menu':
            case 'chart':
                return (
                    <>
                        <SelectedPairs />
                        <AvailablePairs />
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
            <div className='fixed-sidebar top-14 bottom-0 left-0 z-[120] hidden w-16 flex-col items-center justify-center py-4 lg:fixed lg:flex'>
                <div className='flex flex-col gap-2'>
                    <Link href='/dashboard'>
                        <button className='group relative z-[120] flex h-10 w-10 items-center justify-center rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] transition-all duration-200 hover:scale-105 hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F] hover:shadow-lg hover:shadow-black/20'>
                            <LuLayoutDashboard size={20} className='text-[#818181] transition-colors group-hover:text-white' />
                        </button>
                    </Link>
                    <Link href='/test'>
                        <button className='group relative z-[120] flex h-10 w-10 items-center justify-center rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] transition-all duration-200 hover:scale-105 hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F] hover:shadow-lg hover:shadow-black/20'>
                            <LuOrbit size={20} className='text-[#818181] transition-colors group-hover:text-white' />
                        </button>
                    </Link>
                    <button
                        onClick={() => handlePanelToggle('chart')}
                        className={cn(
                            'group relative z-[120] flex h-10 w-10 items-center justify-center rounded-lg border bg-gradient-to-b transition-all duration-200',
                            activePanel === 'chart'
                                ? 'border-[#333] from-[#181818] to-[#0F0F0F] text-white hover:scale-105 hover:border-[#444] hover:from-[#1c1c1c] hover:to-[#141414] hover:shadow-lg hover:shadow-black/20'
                                : 'border-[#222] from-[#141414] to-[#0A0A0A] text-[#818181] hover:scale-105 hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F] hover:text-white hover:shadow-lg hover:shadow-black/20'
                        )}>
                        <LuLineChart size={20} className='transition-colors' />
                    </button>
                </div>
            </div>
        </>
    );
};
