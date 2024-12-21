'use client';
import React, { useState } from 'react';
import { LuSettings } from 'react-icons/lu';
import { SettingsBar } from '@/components/SettingsBar';
import { useScrollLock } from '@/hooks/useScrollLock';
import { SidebarContent } from './SidebarContent';

export const Sidebar = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    useScrollLock(isSettingsOpen);

    return (
        <>
            {/* Settings Panel */}
            <SidebarContent isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
                <SettingsBar />
            </SidebarContent>

            {/* Fixed Sidebar */}
            <div className='fixed top-14 right-0 bottom-0 z-[90] flex w-14 flex-col items-center justify-between border-l border-[#222] bg-gradient-to-b from-black to-[#0A0A0A] py-4'>
                <div>{/* Top content if needed */}</div>
                {/* Settings button */}
                <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className='group flex h-10 w-10 items-center justify-center rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]'>
                    <LuSettings size={20} className='text-[#818181] transition-colors group-hover:text-white' />
                </button>
            </div>
        </>
    );
};
