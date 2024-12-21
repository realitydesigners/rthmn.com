import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { LuLock, LuUnlock } from 'react-icons/lu';

interface SidebarContentProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: string;
    isLocked: boolean;
    onLockToggle: () => void;
    position: 'left' | 'right';
}

export const SidebarContent = ({ isOpen, onClose, children, title, isLocked, onLockToggle, position }: SidebarContentProps) => {
    const [width, setWidth] = useState(300);

    const handleResize = useCallback((newWidth: number) => {
        const constrainedWidth = Math.max(300, Math.min(450, newWidth));
        setWidth(constrainedWidth);
    }, []);

    // Update main content margin and width when sidebar opens/closes or resizes
    useEffect(() => {
        const main = document.querySelector('main');
        const container = document.getElementById('app-container');

        if (main && container) {
            // Find both sidebars
            const leftSidebar = document.querySelector('.sidebar-content [data-position="left"]');
            const rightSidebar = document.querySelector('.sidebar-content [data-position="right"]');

            // Calculate widths for both sidebars if they're open and locked
            const leftWidth = leftSidebar?.getAttribute('data-locked') === 'true' ? parseInt(leftSidebar?.getAttribute('data-width') || '0') + 16 : 0;
            const rightWidth = rightSidebar?.getAttribute('data-locked') === 'true' ? parseInt(rightSidebar?.getAttribute('data-width') || '0') + 16 : 0;

            if (isOpen && isLocked) {
                // When locked, adjust content width and margin
                const sidebarWidth = width + 0; // Add padding
                if (position === 'left') {
                    main.style.marginLeft = `${sidebarWidth}px`;
                    main.style.width = `calc(100vw - ${sidebarWidth + rightWidth}px)`;
                } else {
                    main.style.marginRight = `${sidebarWidth}px`;
                    main.style.width = `calc(100vw - ${leftWidth + sidebarWidth}px)`;
                }
            } else {
                // When unlocked or closed, only respect the other locked sidebar
                if (position === 'left') {
                    main.style.marginLeft = '0';
                    main.style.width = rightWidth > 0 ? `calc(100vw - ${rightWidth}px)` : '100%';
                } else {
                    main.style.marginRight = '0';
                    main.style.width = leftWidth > 0 ? `calc(100vw - ${leftWidth}px)` : '100%';
                }
            }
            container.style.overflowX = 'hidden';
        }
    }, [isOpen, width, position, isLocked]);

    return (
        <div
            className={cn(
                'fixed top-14 bottom-0 flex transform transition-all duration-300',
                position === 'left' ? 'left-0' : 'right-0',
                isOpen
                    ? 'translate-x-0 opacity-100'
                    : position === 'left'
                      ? 'pointer-events-none -translate-x-[150%] opacity-0'
                      : 'pointer-events-none translate-x-[150%] opacity-0',
                isLocked ? 'z-[90]' : 'z-[110]' // Higher z-index when floating
            )}
            data-position={position}
            data-locked={isLocked}
            data-width={width}
            style={{ width: `${width}px` }}>
            <div
                className={cn(
                    'group relative my-4 flex h-[calc(100%-2rem)] w-full rounded-lg bg-gradient-to-b from-[#333]/30 via-[#222]/25 to-[#111]/30 p-[1px] transition-all duration-300 hover:from-[#333]/40 hover:via-[#222]/35 hover:to-[#111]/40',
                    position === 'left' ? 'ml-16' : 'mr-16'
                )}>
                <div className='relative flex h-full w-full flex-col rounded-lg bg-[linear-gradient(to_bottom,rgba(10,10,10,0.95),rgba(17,17,17,0.95))] backdrop-blur-md'>
                    {/* Header Section */}
                    <div className='relative z-10 mb-2 flex h-12 items-center justify-between px-4'>
                        <div className='flex items-center gap-2'>
                            <h2 className='font-kodemono text-xs font-medium tracking-widest uppercase'>{title}</h2>
                            <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-white/20'></div>
                        </div>
                        <button
                            onClick={onLockToggle}
                            className={cn(
                                'group flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-b transition-all duration-300',
                                isLocked
                                    ? 'from-white/10 to-white/5 text-white'
                                    : 'from-[#1A1A1A]/40 via-[#151515]/40 to-[#111]/40 text-[#666] hover:from-[#1A1A1A]/50 hover:via-[#151515]/50 hover:to-[#111]/50 hover:text-white/90'
                            )}>
                            {isLocked ? <LuLock size={14} /> : <LuUnlock size={14} />}
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className='relative flex-1 touch-pan-y overflow-y-scroll px-2 pb-4 [-webkit-overflow-scrolling:touch] [scrollbar-color:rgba(255,255,255,0.1)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/[0.08] hover:[&::-webkit-scrollbar-thumb]:bg-white/[0.1] [&::-webkit-scrollbar-thumb:hover]:bg-white/[0.12] [&::-webkit-scrollbar-track]:bg-transparent'>
                        {children}
                    </div>
                </div>

                <div
                    className={cn(
                        'absolute top-0 bottom-0 w-4 cursor-ew-resize opacity-0 transition-opacity duration-200 group-hover:opacity-100',
                        position === 'left' ? '-right-4' : '-left-4'
                    )}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        const startX = e.clientX;
                        const startWidth = width;

                        const handleMouseMove = (e: MouseEvent) => {
                            const delta = e.clientX - startX;
                            const newWidth = Math.max(360, Math.min(600, startWidth + (position === 'left' ? delta : -delta)));
                            handleResize(newWidth);
                        };

                        const handleMouseUp = () => {
                            window.removeEventListener('mousemove', handleMouseMove);
                            window.removeEventListener('mouseup', handleMouseUp);
                        };

                        window.addEventListener('mousemove', handleMouseMove);
                        window.addEventListener('mouseup', handleMouseUp);
                    }}
                />
            </div>
        </div>
    );
};
