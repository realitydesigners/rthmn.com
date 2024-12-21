'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { DraggableBorder } from '@/components/DraggableBorder';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import { LuMenu, LuOrbit, LuLayoutDashboard } from 'react-icons/lu';
import { useScrollLock } from '@/hooks/useScrollLock';

export const LeftSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    useScrollLock(isOpen);

    return (
        <>
            {/* Sidebar Content */}
            <SidebarContent isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <div className='flex h-full flex-col'>
                    <div className='flex h-12 items-center justify-between border-b border-[#222] px-3'>
                        <div className='flex items-center gap-2'>
                            <h2 className='text-sm font-medium'>Menu</h2>
                            <div className='h-1 w-1 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' />
                        </div>
                    </div>

                    <div className='scrollbar-none flex-1 touch-pan-y overflow-y-scroll scroll-smooth p-3'>{/* Add your menu content here */}</div>
                </div>
            </SidebarContent>

            {/* Fixed Sidebar */}
            <div className='fixed top-14 bottom-0 left-0 z-[90] flex w-14 flex-col items-center justify-between border-r border-[#222] bg-gradient-to-b from-black to-[#0A0A0A] py-4'>
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
                </div>
                {/* Menu button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className='group flex h-10 w-10 items-center justify-center rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]'>
                    <LuMenu size={20} className='text-[#818181] transition-colors group-hover:text-white' />
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
    const [width, setWidth] = useState(300);

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
