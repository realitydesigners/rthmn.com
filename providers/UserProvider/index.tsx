'use client';

import React, { createContext, use, useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { getSelectedPairs, setSelectedPairs } from '@/utils/localStorage';
import { useColorStore, type BoxColors } from '@/stores/colorStore';

interface UserContextType {
    selectedPairs: string[];
    boxColors: BoxColors;
    isSidebarInitialized: boolean;
    togglePair: (pair: string) => void;
    updateBoxColors: (colors: Partial<BoxColors>) => void;
    handleSidebarClick: (e: React.MouseEvent) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [selectedPairs, setSelectedPairsState] = useState<string[]>([]);
    const [isSidebarInitialized, setIsSidebarInitialized] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { hasCompletedInitialOnboarding } = useOnboardingStore();

    // Get box colors from the store
    const boxColors = useColorStore((state) => state.boxColors);
    const updateBoxColors = useColorStore((state) => state.updateBoxColors);

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
            const storedPairs = getSelectedPairs();
            setSelectedPairsState(storedPairs);
            setIsSidebarInitialized(true);
        };

        initializeData();
    }, []);

    const togglePair = useCallback((pair: string) => {
        setSelectedPairsState((prev) => {
            const wasSelected = prev.includes(pair);
            const newSelected = wasSelected ? prev.filter((p) => p !== pair) : [...prev, pair];
            setSelectedPairs(newSelected);
            return newSelected;
        });
    }, []);

    const handleSidebarClick = useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.sidebar-toggle') || target.closest('.sidebar-content') || target.closest('.fixed-sidebar')) {
            return;
        }
        window.dispatchEvent(new Event('closeSidebars'));
    }, []);

    const value = useMemo(
        () => ({
            selectedPairs,
            boxColors,
            isSidebarInitialized,
            togglePair,
            updateBoxColors,
            handleSidebarClick,
        }),
        [selectedPairs, boxColors, isSidebarInitialized, togglePair, updateBoxColors, handleSidebarClick]
    );

    return (
        <UserContext.Provider value={value}>
            <div onClick={handleSidebarClick}>{children}</div>
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = use(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
