'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useOnboardingStore } from '@/app/(user)/onboarding/onboarding';
import type { BoxColors } from '@/types/types';
import {
    DEFAULT_BOX_COLORS,
    FullPreset,
    fullPresets,
    getBoxColors as getStoredBoxColors,
    getSelectedPairs,
    setBoxColors as setStoredBoxColors,
    setSelectedPairs,
} from '@/utils/localStorage';

interface UserContextType {
    selectedPairs: string[];
    boxColors: BoxColors;
    isSidebarInitialized: boolean;
    gridClass: string;
    togglePair: (pair: string) => void;
    updateBoxColors: (colors: BoxColors) => void;
    handleSidebarClick: (e: React.MouseEvent) => void;
    fullPresets: FullPreset[];
    getComputedBoxColors: (value: number) => {
        baseColor: string;
        opacity: number;
        shadowIntensity: number;
        shadowY: number;
        shadowBlur: number;
        shadowColor: (alpha: number) => string;
    };
    getBoxStyles: (isFirstDifferent: boolean, value: number) => React.CSSProperties;
}

const UserContext = createContext<UserContextType | null>(null);

// Color computation cache
const colorCache = new Map<string, any>();
const styleCache = new Map<string, React.CSSProperties>();

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [selectedPairs, setSelectedPairsState] = useState<string[]>([]);
    const [boxColors, setBoxColorsState] = useState<BoxColors>(DEFAULT_BOX_COLORS);
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
            const storedColors = getStoredBoxColors();
            const storedPairs = getSelectedPairs();
            setBoxColorsState(storedColors);
            setSelectedPairsState(storedPairs);
            setIsSidebarInitialized(true);
        };

        initializeData();
    }, []);

    // Grid layout management
    useEffect(() => {
        if (!isSidebarInitialized) {
            setGridClass('invisible');
            return;
        }

        const handleResize = () => {
            const main = document.querySelector('main');
            if (!main) return;

            const width = main.clientWidth;
            const baseClasses = 'grid w-full gap-4 transition-all duration-300 ';

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

        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(handleResize);
        });

        const main = document.querySelector('main');
        if (main) {
            resizeObserver.observe(main);
            handleResize();
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [isSidebarInitialized]);

    // Memoized color computation function
    const getComputedBoxColors = useCallback(
        (value: number) => {
            const cacheKey = `${value}-${boxColors.positive}-${boxColors.negative}-${JSON.stringify(boxColors.styles)}`;

            if (colorCache.has(cacheKey)) {
                return colorCache.get(cacheKey);
            }

            const baseColor = value > 0 ? boxColors.positive : boxColors.negative;
            const opacity = boxColors.styles?.opacity ?? 0.2;
            const shadowIntensity = boxColors.styles?.shadowIntensity ?? 0.25;
            const shadowY = Math.floor(shadowIntensity * 16);
            const shadowBlur = Math.floor(shadowIntensity * 80);
            const shadowColor = (alpha: number) => (value > 0 ? boxColors.positive : boxColors.negative).replace(')', `, ${alpha})`);

            const computedColors = {
                baseColor,
                opacity,
                shadowIntensity,
                shadowY,
                shadowBlur,
                shadowColor,
            };

            colorCache.set(cacheKey, computedColors);
            if (colorCache.size > 1000) {
                const entries = Array.from(colorCache.entries());
                entries.slice(0, entries.length - 500).forEach(([k]) => colorCache.delete(k));
            }

            return computedColors;
        },
        [boxColors.positive, boxColors.negative, boxColors.styles?.opacity, boxColors.styles?.shadowIntensity]
    );

    // Memoized style computation function
    const getBoxStyles = useCallback(
        (isFirstDifferent: boolean, value: number) => {
            const cacheKey = `${isFirstDifferent}-${value}-${JSON.stringify(boxColors.styles)}`;

            if (styleCache.has(cacheKey)) {
                return styleCache.get(cacheKey)!;
            }

            const colors = getComputedBoxColors(value);
            const styles: React.CSSProperties = {
                borderRadius: `${boxColors.styles?.borderRadius ?? 0}px`,
                borderWidth: boxColors.styles?.showBorder ? '1px' : '0',
                transition: 'all 0.15s ease-out',
                background: `linear-gradient(to bottom right, ${colors.baseColor.replace(')', `, ${colors.opacity}`)} 100%, transparent 100%)`,
                opacity: colors.opacity,
                boxShadow: isFirstDifferent
                    ? `inset 0 2px 15px ${colors.shadowColor(0.2)}`
                    : `inset 0 ${colors.shadowY}px ${colors.shadowBlur}px ${colors.shadowColor(colors.shadowIntensity)}`,
            };

            styleCache.set(cacheKey, styles);
            if (styleCache.size > 1000) {
                const entries = Array.from(styleCache.entries());
                entries.slice(0, entries.length - 500).forEach(([k]) => styleCache.delete(k));
            }

            return styles;
        },
        [boxColors.styles, getComputedBoxColors]
    );

    const togglePair = useCallback((pair: string) => {
        setSelectedPairsState((prev) => {
            const wasSelected = prev.includes(pair);
            const newSelected = wasSelected ? prev.filter((p) => p !== pair) : [...prev, pair];
            setSelectedPairs(newSelected);
            return newSelected;
        });
    }, []);

    const updateBoxColors = useCallback((newColors: BoxColors) => {
        setBoxColorsState(newColors);
        setStoredBoxColors(newColors);
        colorCache.clear();
        styleCache.clear();
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
            gridClass,
            togglePair,
            updateBoxColors,
            handleSidebarClick,
            fullPresets,
            getComputedBoxColors,
            getBoxStyles,
        }),
        [selectedPairs, boxColors, isSidebarInitialized, gridClass, togglePair, updateBoxColors, handleSidebarClick, getComputedBoxColors, getBoxStyles]
    );

    return (
        <UserContext.Provider value={value}>
            <div onClick={handleSidebarClick}>{children}</div>
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
