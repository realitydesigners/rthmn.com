'use client';

import React, { createContext, useEffect, useState, use } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useOnboardingStore } from '@/app/(user)/onboarding/onboarding';
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
    const router = useRouter();
    const pathname = usePathname();
    const { hasCompletedInitialOnboarding } = useOnboardingStore();

    // Onboarding check
    useEffect(() => {
        if (!pathname || pathname.includes('/onboarding')) return;
        if (pathname === '/signin' || pathname === '/signup' || pathname === '/pricing') return;
        if (!hasCompletedInitialOnboarding()) {
            router.replace('/onboarding');
        }
    }, [pathname, router, hasCompletedInitialOnboarding]);

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

            // Base classes with smooth transitions
            let classes = 'grid transition-[width,margin] duration-150 ease-in-out';

            // Add gap classes
            classes += ' gap-3 lg:gap-4';

            // Calculate available width based on sidebar state
            if (leftLocked && rightLocked) {
                classes += ' pr-[350px] pl-[350px]'; // Both sidebars
            } else if (leftLocked) {
                classes += ' pl-[350px]'; // Left sidebar
            } else if (rightLocked) {
                classes += ' pr-[350px]'; // Right sidebar
            }

            // Responsive grid with consistent 3-column layout
            const selectedPairsCount = selectedPairs.length;
            if (selectedPairsCount <= 3) {
                classes += ' grid-cols-3';
                // Center the content when less than 3 items
                if (selectedPairsCount < 3) {
                    const colSpan = Math.ceil(3 / selectedPairsCount);
                    classes += ` [&>*]:col-span-${colSpan}`;
                }
            } else {
                // For more than 3 pairs, maintain 3 columns but allow wrapping
                classes += ' grid-cols-3';
            }

            // Set consistent item size
            classes += ' auto-rows-[350px]';

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

    const togglePair = (pair: string) => {
        const wasSelected = selectedPairs.includes(pair);
        const newSelected = wasSelected ? selectedPairs.filter((p) => p !== pair) : [...selectedPairs, pair];
        setSelectedPairsState(newSelected);
        setSelectedPairs(newSelected);
    };

    const updateBoxColors = (colors: BoxColors) => {
        setBoxColors(colors);
        setBoxColorsState(colors);
    };

    const handleSidebarClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.sidebar-toggle') || target.closest('.sidebar-content') || target.closest('.fixed-sidebar')) {
            return;
        }
        window.dispatchEvent(new Event('closeSidebars'));
    };

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
