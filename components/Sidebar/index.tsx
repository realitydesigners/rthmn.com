'use client';
import React, { useState } from 'react';
import { LuSettings } from 'react-icons/lu';
import { SettingsBar } from '@/components/SettingsBar';
import { useScrollLock } from '@/hooks/useScrollLock';

export const Sidebar = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    useScrollLock(isSettingsOpen);

    return (
        <>
            {isSettingsOpen && (
                <div className='fixed inset-0 z-[1000] flex items-center justify-center'>
                    <div className='fixed inset-0 backdrop-blur-sm' onClick={() => setIsSettingsOpen(false)} />
                    <SettingsBar isOpen={true} onToggle={() => setIsSettingsOpen(false)} />
                </div>
            )}

            <div className='fixed right-4 bottom-4 z-[100] hidden lg:block'>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className='group flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] transition-all duration-200 hover:from-[#444444] hover:to-[#282828]'>
                    <div className='flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818] text-[#818181] group-hover:text-white'>
                        <LuSettings size={20} />
                    </div>
                </button>
            </div>
        </>
    );
};
