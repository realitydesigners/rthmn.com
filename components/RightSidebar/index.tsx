'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DraggableBorder } from '@/components/DraggableBorder';
import { cn } from '@/utils/cn';
import { LuSettings, LuGraduationCap, LuLock, LuUnlock } from 'react-icons/lu';
import { SettingsBar } from '@/components/SettingsBar';
import { Tutorial } from './Tutorial';

type ActivePanel = 'settings' | 'tutorial' | null;

export const RightSidebar = () => {
    const [activePanel, setActivePanel] = useState<ActivePanel>(null);
    const [isLocked, setIsLocked] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const handlePanelToggle = (panel: ActivePanel) => {
        setActivePanel((prev) => {
            if (prev === panel) {
                setIsLocked(false); // Reset lock state when closing
                return null;
            }
            return panel;
        });
    };

    const renderPanelContent = () => {
        switch (activePanel) {
            case 'settings':
                return (
                    <div className='flex h-full flex-col'>
                        <div className='flex h-12 items-center justify-between border-b border-[#222] px-3'>
                            <div className='flex items-center gap-2'>
                                <h2 className='text-sm font-medium'>Settings</h2>
                                <div className='h-1 w-1 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' />
                            </div>
                            <button
                                onClick={() => setIsLocked(!isLocked)}
                                className={cn(
                                    'group flex h-7 w-7 items-center justify-center rounded-md transition-all',
                                    isLocked ? 'bg-blue-500/10 text-blue-400' : 'text-[#666] hover:bg-white/5'
                                )}>
                                {isLocked ? <LuLock size={14} /> : <LuUnlock size={14} />}
                            </button>
                        </div>
                        <SettingsBar />
                    </div>
                );
            case 'tutorial':
                return (
                    <div className='flex h-full flex-col'>
                        <div className='flex h-12 items-center justify-between border-b border-[#222] px-3'>
                            <div className='flex items-center gap-2'>
                                <h2 className='text-sm font-medium'>Tutorial</h2>
                                <div className='h-1 w-1 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' />
                            </div>
                            <button
                                onClick={() => setIsLocked(!isLocked)}
                                className={cn(
                                    'group flex h-7 w-7 items-center justify-center rounded-md transition-all',
                                    isLocked ? 'bg-blue-500/10 text-blue-400' : 'text-[#666] hover:bg-white/5'
                                )}>
                                {isLocked ? <LuLock size={14} /> : <LuUnlock size={14} />}
                            </button>
                        </div>
                        <Tutorial />
                    </div>
                );
            default:
                return null;
        }
    };

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
            {/* Panel Content */}
            <div ref={sidebarRef} className='sidebar-content'>
                <SidebarContent isOpen={activePanel !== null} onClose={() => !isLocked && setActivePanel(null)}>
                    {renderPanelContent()}
                </SidebarContent>
            </div>

            {/* Fixed Sidebar */}
            <div className='fixed-sidebar fixed top-14 right-0 bottom-0 z-[90] flex w-14 flex-col items-center justify-between border-l border-[#222] bg-gradient-to-b from-black to-[#0A0A0A] py-4'>
                <div className='flex flex-col gap-2'>
                    <button
                        onClick={() => handlePanelToggle('tutorial')}
                        className={cn(
                            'sidebar-toggle group flex h-10 w-10 items-center justify-center rounded-lg border bg-gradient-to-b transition-all',
                            activePanel === 'tutorial'
                                ? 'border-blue-500/20 from-blue-500/10 to-blue-500/5 text-blue-400'
                                : 'border-[#222] from-[#141414] to-[#0A0A0A] text-[#818181] hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F] hover:text-white'
                        )}>
                        <LuGraduationCap size={20} className='transition-colors' />
                    </button>
                </div>
                {/* Settings button */}
                <button
                    onClick={() => handlePanelToggle('settings')}
                    className={cn(
                        'sidebar-toggle group flex h-10 w-10 items-center justify-center rounded-lg border bg-gradient-to-b transition-all',
                        activePanel === 'settings'
                            ? 'border-blue-500/20 from-blue-500/10 to-blue-500/5 text-blue-400'
                            : 'border-[#222] from-[#141414] to-[#0A0A0A] text-[#818181] hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F] hover:text-white'
                    )}>
                    <LuSettings size={20} className='transition-colors' />
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
