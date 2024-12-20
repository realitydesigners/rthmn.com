'use client';
import React, { useState, useEffect } from 'react';
import { LuSettings } from 'react-icons/lu';
import { SettingsBar } from '@/components/SettingsBar';
import { useScrollLock } from '@/hooks/useScrollLock';
import { DraggableBorder } from '@/components/DraggableBorder';

export const Sidebar = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [width, setWidth] = useState(480);
    useScrollLock(isSettingsOpen);

    const handleResize = (newWidth: number) => {
        // Constrain width between 320px and 640px
        const constrainedWidth = Math.max(320, Math.min(640, newWidth));
        setWidth(constrainedWidth);
        // Update CSS variable for content pushing
        document.documentElement.style.setProperty('--sidebar-width', `${constrainedWidth}px`);
    };

    // Set initial CSS variable
    useEffect(() => {
        document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
        return () => {
            document.documentElement.style.removeProperty('--sidebar-width');
        };
    }, [width]);

    // Update main content margin when sidebar opens/closes
    useEffect(() => {
        const main = document.querySelector('main');
        if (main) {
            if (isSettingsOpen) {
                main.style.marginRight = `${width}px`;
            } else {
                main.style.marginRight = '0px';
            }
        }
    }, [isSettingsOpen, width]);

    return (
        <>
            {/* Mobile: Full screen modal */}
            <div className={`fixed inset-0 z-[1000] flex items-center justify-center lg:hidden ${!isSettingsOpen && 'hidden'}`}>
                <div className='fixed inset-0 bg-black/80 backdrop-blur-sm' onClick={() => setIsSettingsOpen(false)} />
                <SettingsBar isOpen={true} onToggle={() => setIsSettingsOpen(false)} variant='modal' />
            </div>

            {/* Desktop: Slide-out sidebar */}
            <div
                style={{ width: `${width}px` }}
                className={`fixed top-0 right-0 z-[90] hidden h-full transform bg-black transition-transform duration-300 ease-in-out lg:block ${
                    isSettingsOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <DraggableBorder onResize={(delta) => handleResize(width - delta)} />
                <SettingsBar isOpen={true} onToggle={() => setIsSettingsOpen(false)} variant='sidebar' />
            </div>

            {/* Settings button */}
            <div className='fixed right-4 bottom-4 z-[100] hidden lg:block'>
                <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className='group flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] transition-all duration-200 hover:from-[#444444] hover:to-[#282828]'>
                    <div className='flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818] text-[#818181] group-hover:text-white'>
                        <LuSettings size={20} />
                    </div>
                </button>
            </div>
        </>
    );
};
