'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { DraggableBorder } from '@/components/DraggableBorder';
import { cn } from '@/utils/cn';
import { LuSettings, LuGraduationCap } from 'react-icons/lu';
import { SettingsBar } from '@/components/SettingsBar';
import { Tutorial } from './Tutorial';
import { useScrollLock } from '@/hooks/useScrollLock';

type ActivePanel = 'settings' | 'tutorial' | null;

export const RightSidebar = () => {
    const [activePanel, setActivePanel] = useState<ActivePanel>(null);
    useScrollLock(activePanel !== null);

    const handlePanelToggle = (panel: ActivePanel) => {
        setActivePanel((prev) => (prev === panel ? null : panel));
    };

    return (
        <>
            {/* Settings Panel */}
            <SidebarContent isOpen={activePanel === 'settings'} onClose={() => setActivePanel(null)}>
                <SettingsBar />
            </SidebarContent>

            {/* Tutorial Panel */}
            <SidebarContent isOpen={activePanel === 'tutorial'} onClose={() => setActivePanel(null)}>
                <Tutorial />
            </SidebarContent>

            {/* Fixed Sidebar */}
            <div className='fixed top-14 right-0 bottom-0 z-[90] flex w-14 flex-col items-center justify-between border-l border-[#222] bg-gradient-to-b from-black to-[#0A0A0A] py-4'>
                <div className='flex flex-col gap-2'>
                    <button
                        onClick={() => handlePanelToggle('tutorial')}
                        className={cn(
                            'group flex h-10 w-10 items-center justify-center rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]',
                            activePanel === 'tutorial' && 'border-blue-500/20 from-blue-500/10 to-blue-500/5'
                        )}>
                        <LuGraduationCap size={20} className={cn('transition-colors', activePanel === 'tutorial' ? 'text-blue-400' : 'text-[#818181] group-hover:text-white')} />
                    </button>
                </div>
                {/* Settings button */}
                <button
                    onClick={() => handlePanelToggle('settings')}
                    className={cn(
                        'group flex h-10 w-10 items-center justify-center rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]',
                        activePanel === 'settings' && 'border-blue-500/20 from-blue-500/10 to-blue-500/5'
                    )}>
                    <LuSettings size={20} className={cn('transition-colors', activePanel === 'settings' ? 'text-blue-400' : 'text-[#818181] group-hover:text-white')} />
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
                main.style.marginRight = `${width + 56}px`; // 56px = w-14 (sidebar width)
            } else {
                main.style.marginRight = '56px'; // w-14
            }
        }
        return () => {
            if (main) {
                main.style.marginRight = '0';
            }
        };
    }, [isOpen, width]);

    return (
        <div
            className={cn('fixed top-14 right-14 bottom-0 z-[90] flex transform transition-transform duration-300', isOpen ? 'translate-x-0' : 'translate-x-full')}
            style={{ width: `${width}px` }}>
            <DraggableBorder onResize={(delta) => handleResize(width - delta)} position='left' />
            <div className='relative flex h-full w-full flex-col border-l border-[#222] bg-gradient-to-b from-black to-[#0A0A0A] shadow-2xl'>{children}</div>
        </div>
    );
};
