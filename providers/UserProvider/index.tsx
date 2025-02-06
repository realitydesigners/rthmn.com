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

        const handleResize = () => {
            const main = document.querySelector('main');
            if (!main) return;

            const width = main.clientWidth;
            const baseClasses = 'grid w-full gap-4 transition-all duration-300 ';

            // Add appropriate grid-cols based on width
            if (width <= 600) {
                setGridClass(`${baseClasses} grid-cols-1`);
            } else if (width <= 1280) {
                setGridClass(`${baseClasses} grid-cols-2`);
            } else if (width <= 1600) {
                setGridClass(`${baseClasses} grid-cols-3`);
            } else {
                setGridClass(`${baseClasses} grid-cols-4`);
            }
        };

        // Set up resize observer for main element
        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(handleResize);
        });

        const main = document.querySelector('main');
        if (main) {
            resizeObserver.observe(main);
            handleResize(); // Initial measurement
        }

        // Listen for sidebar state changes
        const handleStorageChange = () => {
            // Wait for sidebar transition to complete before measuring
            setTimeout(handleResize, 150);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('sidebarStateChange', handleStorageChange);

        return () => {
            resizeObserver.disconnect();
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
