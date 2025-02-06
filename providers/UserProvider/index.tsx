'use client';

import React, { createContext, useEffect, useState, use } from 'react';
import { BoxColors } from '@/types/types';
import { DEFAULT_BOX_COLORS, FullPreset, fullPresets, getBoxColors, getSelectedPairs, getSidebarState, setBoxColors, setSelectedPairs } from '@/utils/localStorage';

interface UserContextType {
    selectedPairs: string[];
    boxColors: BoxColors;
    isSidebarInitialized: boolean;
    gridClass: string;
    togglePair: (pair: string) => void;
    updateBoxColors: (colors: BoxColors) => void;
    handleSidebarClick: (e: React.MouseEvent) => void;
    DEFAULT_BOX_COLORS: BoxColors;
    fullPresets: FullPreset[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = use(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export default function UserProvider({ children }: { children: React.ReactNode }) {
    const [selectedPairs, setSelectedPairsState] = useState<string[]>([]);
    const [boxColorsState, setBoxColorsState] = useState<BoxColors>(DEFAULT_BOX_COLORS);
    const [isSidebarInitialized, setIsSidebarInitialized] = useState(false);
    const [gridClass, setGridClass] = useState('');

    // Initialize state and fetch all initial data
    useEffect(() => {
        const initializeData = async () => {
            const storedColors = getBoxColors();
            const storedPairs = getSelectedPairs();
            setBoxColorsState(storedColors);
            setSelectedPairsState(storedPairs);
            setIsSidebarInitialized(true);
        };

        initializeData();
    }, []);

    // Grid layout management
    useEffect(() => {
        // Only update grid class after sidebars are initialized
        if (!isSidebarInitialized) {
            setGridClass('invisible');
            return;
        }

        const updateGridClass = () => {
            const sidebarState = getSidebarState();
            const leftLocked = sidebarState.left.locked && sidebarState.left.isOpen;
            const rightLocked = sidebarState.right.locked && sidebarState.right.isOpen;

            // Base classes for mobile and tablet
            let classes = 'grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4';

            // Tablet breakpoint
            classes += ' sm:grid-cols-[repeat(auto-fit,minmax(350px,1fr))]';

            // Desktop breakpoint with dynamic sidebar adjustments
            if (leftLocked && rightLocked) {
                classes += ' lg:grid-cols-[repeat(auto-fit,minmax(350px,1fr))]'; // Both sidebars
            } else if (leftLocked || rightLocked) {
                classes += ' lg:grid-cols-[repeat(auto-fit,minmax(375px,1fr))]'; // One sidebar
            } else {
                classes += ' lg:grid-cols-[repeat(auto-fit,minmax(400px,1fr))]'; // No sidebars
            }

            setGridClass(classes);
        };

        // Initial update
        updateGridClass();

        // Listen for sidebar state changes
        const handleStorageChange = () => {
            updateGridClass();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('sidebarStateChange', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('sidebarStateChange', handleStorageChange);
        };
    }, [isSidebarInitialized]);

    const togglePair = React.useCallback(
        (pair: string) => {
            const wasSelected = selectedPairs.includes(pair);
            const newSelected = wasSelected ? selectedPairs.filter((p) => p !== pair) : [...selectedPairs, pair];
            setSelectedPairsState(newSelected);
            setSelectedPairs(newSelected);
        },
        [selectedPairs]
    );

    const updateBoxColors = React.useCallback((colors: BoxColors) => {
        setBoxColors(colors);
        setBoxColorsState(colors);
    }, []);

    const handleSidebarClick = React.useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.sidebar-toggle') || target.closest('.sidebar-content') || target.closest('.fixed-sidebar')) {
            return;
        }
        window.dispatchEvent(new Event('closeSidebars'));
    }, []);

    return (
        <UserContext
            value={{
                selectedPairs,
                boxColors: boxColorsState,
                isSidebarInitialized,
                gridClass,
                togglePair,
                updateBoxColors,
                handleSidebarClick,
                DEFAULT_BOX_COLORS,
                fullPresets,
            }}>
            <div onClick={handleSidebarClick}>{children}</div>
        </UserContext>
    );
}
