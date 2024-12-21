'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { DraggableBorder } from '@/components/DraggableBorder';
import { cn } from '@/utils/cn';

interface SidebarContentProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const SidebarContent = ({ isOpen, onClose, children }: SidebarContentProps) => {
    const [width, setWidth] = useState(420);

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
