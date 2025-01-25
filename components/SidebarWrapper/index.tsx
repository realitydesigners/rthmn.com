'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { LuLock, LuUnlock } from 'react-icons/lu';
import { getSidebarLocks, setSidebarLocks, getSidebarState, setSidebarState } from '@/utils/localStorage';
import { motion } from 'framer-motion';

interface SidebarContentProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: string;
    isLocked: boolean;
    onLockToggle: () => void;
    position: 'left' | 'right';
    initialWidth?: number;
    isCurrentTourStep?: boolean;
    isCompleted: boolean;
}

export const SidebarWrapper = ({ isOpen, onClose, children, title, isLocked, onLockToggle, position, initialWidth = 300, isCurrentTourStep, isCompleted }: SidebarContentProps) => {
    const [width, setWidth] = useState(initialWidth);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load initial state
        const state = getSidebarState();
        const locks = getSidebarLocks();

        // If the sidebar is locked but not open, we need to sync the states
        if (locks[position] && !state[position].isOpen) {
            setSidebarState({
                ...state,
                [position]: {
                    ...state[position],
                    isOpen: true,
                    locked: true,
                },
            });
            // Force the parent to update its state
            onLockToggle();
        }
    }, []);

    const handleResize = useCallback((newWidth: number) => {
        const constrainedWidth = Math.max(300, Math.min(600, newWidth));
        setWidth(constrainedWidth);
    }, []);

    const handleLockToggle = useCallback(() => {
        const locks = getSidebarLocks();
        const state = getSidebarState();

        // Update both locks and state, but keep isOpen unchanged
        setSidebarLocks({
            ...locks,
            [position]: !isLocked,
        });

        setSidebarState({
            ...state,
            [position]: {
                ...state[position],
                isOpen: isOpen, // Keep current open state
                locked: !isLocked,
            },
        });

        onLockToggle();
    }, [isLocked, onLockToggle, position, isOpen]);

    // Update main content margin and width when sidebar opens/closes or resizes
    useEffect(() => {
        if (!mounted) return;

        const main = document.querySelector('main');
        const container = document.getElementById('app-container');

        if (main && container) {
            // Find both sidebars
            const leftSidebar = document.querySelector('.sidebar-content [data-position="left"]');
            const rightSidebar = document.querySelector('.sidebar-content [data-position="right"]');

            // Calculate widths for both sidebars if they're open and locked
            const leftWidth = leftSidebar?.getAttribute('data-locked') === 'true' ? parseInt(leftSidebar?.getAttribute('data-width') || '0') : 0;
            const rightWidth = rightSidebar?.getAttribute('data-locked') === 'true' ? parseInt(rightSidebar?.getAttribute('data-width') || '0') : 0;

            if (isOpen && isLocked) {
                // When locked, adjust content width and margin
                if (position === 'left') {
                    main.style.marginLeft = `${width}px`;
                    main.style.width = `calc(100vw - ${width + rightWidth}px)`;
                    main.style.paddingLeft = '0'; // Reset padding when locked
                }

                if (position === 'right') {
                    main.style.marginRight = `${width}px`;
                    main.style.width = `calc(100vw - ${width + leftWidth}px)`;
                    main.style.paddingRight = '0'; // Reset padding when locked
                }
            } else {
                // When unlocked or closed, only respect the other locked sidebar
                if (position === 'left') {
                    main.style.marginLeft = '0';
                    main.style.width = rightWidth > 0 ? `calc(100vw - ${rightWidth}px)` : '100%';
                    main.style.paddingLeft = '64px'; // 16 * 4 = 64px for the fixed sidebar
                }

                if (position === 'right') {
                    main.style.marginRight = '0';
                    main.style.width = leftWidth > 0 ? `calc(100vw - ${leftWidth}px)` : '100%';
                    main.style.paddingRight = '64px'; // 16 * 4 = 64px for the fixed sidebar
                }
            }
            container.style.overflowX = 'hidden';
        }
    }, [isOpen, width, position, isLocked, mounted, title]);

    if (!mounted) return null;

    return (
        <motion.div
            initial={false}
            animate={{
                x: isOpen ? 0 : position === 'left' ? -width : width,
                opacity: isOpen ? 1 : 0,
                transition: {
                    x: {
                        type: 'tween',
                        duration: 0.2,
                        ease: [0.2, 1, 0.2, 1],
                    },
                    opacity: {
                        duration: 0.15,
                    },
                },
            }}
            className={cn(
                'sidebar-content top-14 bottom-0 hidden transform lg:fixed lg:flex',
                position === 'left' ? 'left-0' : 'right-0',
                isOpen ? 'pointer-events-auto' : 'pointer-events-none',
                isLocked ? 'z-[90]' : 'z-[110]' // Higher z-index when floating
            )}
            data-position={position}
            data-locked={isLocked}
            data-width={width}
            style={{ width: `${width}px` }}>
            <motion.div
                className={cn(
                    'group my- relative flex h-screen w-full transition-all duration-300 hover:from-[#333]/40 hover:via-[#222]/35 hover:to-[#111]/40',
                    position === 'left' ? 'ml-16' : 'mr-16'
                )}>
                <motion.div
                    initial={false}
                    animate={{
                        scale: isOpen ? 1 : 0.98,
                        opacity: isOpen ? 1 : 0.8,
                        transition: {
                            duration: 0.2,
                            ease: [0.2, 1, 0.2, 1],
                        },
                    }}
                    className={cn(
                        'relative flex h-full w-full flex-col bg-[#0a0a0a]',
                        position === 'left' ? 'border-r border-[#121212]' : 'border-l border-[#121212]',
                        isCurrentTourStep &&
                            !isCompleted &&
                            [
                                // Inner glow layers with increased depth
                                'shadow-[inset_0_0_60px_rgba(59,130,246,0.1)]',
                                'shadow-[inset_0_0_30px_rgba(59,130,246,0.25)]',
                                'shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]',
                                // Edge glow with even distribution
                                'before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/10 before:via-transparent before:to-transparent',
                                'after:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-t after:from-blue-500/20 after:via-transparent after:to-transparent',
                                // Ambient glow
                                'bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_50%)]',
                                // Outer glow for depth
                                'shadow-[0_0_40px_rgba(59,130,246,0.2)]',

                                'bg-gradient-to-b from-blue-500/[0.1] via-transparent to-blue-500/[0.05]',
                                'relative overflow-hidden',
                                // Extra edge highlights
                                'before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(to_right,rgba(59,130,246,0.2),transparent_10%,transparent_90%,rgba(59,130,246,0.2))]',
                                'after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(to_bottom,rgba(59,130,246,0.2),transparent_10%,transparent_90%,rgba(59,130,246,0.2))]',
                                // Pulsing animation
                                'animate-pulse-subtle',
                            ].join(' ')
                    )}>
                    {/* Header Section */}
                    <div className='relative z-10 flex h-12 items-center justify-between px-2'>
                        {position === 'right' && (
                            <button
                                onClick={handleLockToggle}
                                className={cn(
                                    'group flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-b transition-all duration-300',
                                    isLocked
                                        ? 'border-[#333] from-[#181818] to-[#0F0F0F] text-white hover:scale-105 hover:border-[#444] hover:from-[#1c1c1c] hover:to-[#141414] hover:shadow-lg hover:shadow-black/20'
                                        : 'border-[#222] from-[#141414] to-[#0A0A0A] text-[#818181] hover:scale-105 hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F] hover:text-white hover:shadow-lg hover:shadow-black/20'
                                )}>
                                {isLocked ? <LuLock size={14} /> : <LuUnlock size={14} />}
                            </button>
                        )}
                        <div className={cn('flex items-center justify-center gap-2', position === 'right' && 'flex-1 justify-end')}>
                            <h2 className='font-kodemono text-[10px] font-medium tracking-widest uppercase'>{title}</h2>
                        </div>
                        {position === 'left' && (
                            <button
                                onClick={handleLockToggle}
                                className={cn(
                                    'group flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-b transition-all duration-300',
                                    isLocked
                                        ? 'border-[#333] from-[#181818] to-[#0F0F0F] text-white hover:scale-105 hover:border-[#444] hover:from-[#1c1c1c] hover:to-[#141414] hover:shadow-lg hover:shadow-black/20'
                                        : 'border-[#222] from-[#141414] to-[#0A0A0A] text-[#818181] hover:scale-105 hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F] hover:text-white hover:shadow-lg hover:shadow-black/20'
                                )}>
                                {isLocked ? <LuLock size={14} /> : <LuUnlock size={14} />}
                            </button>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className='relative flex-1 touch-pan-y overflow-y-scroll px-2 pb-4 [-webkit-overflow-scrolling:touch] [scrollbar-color:rgba(255,255,255,0.1)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/[0.08] hover:[&::-webkit-scrollbar-thumb]:bg-white/[0.1] [&::-webkit-scrollbar-thumb:hover]:bg-white/[0.12] [&::-webkit-scrollbar-track]:bg-transparent'>
                        {children}
                    </div>
                </motion.div>

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
                            const newWidth = Math.max(300, Math.min(600, startWidth + (position === 'left' ? delta : -delta)));
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
            </motion.div>
        </motion.div>
    );
};
