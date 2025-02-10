import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSelectedPairs } from '@/utils/localStorage';

export interface GridBreakpoint {
    width: number;
    cols: number;
}

interface GridState {
    breakpoints: GridBreakpoint[];
    orderedPairs: string[];
    updateBreakpoint: (width: number, cols: number) => void;
    getGridClass: (width: number) => string;
    lastWidth: number;
    lastCols: number;
    reorderPairs: (newOrder: string[]) => void;
    setInitialPairs: (pairs: string[]) => void;
    initialized: boolean;
}

// Initial default breakpoints
const DEFAULT_BREAKPOINTS: GridBreakpoint[] = [
    { width: 0, cols: 1 }, // Mobile/smallest screens
    { width: 640, cols: 2 }, // Small screens
    { width: 1024, cols: 3 }, // Medium screens
    { width: 1400, cols: 4 }, // Large screens
];

// Helper to save order to localStorage
const saveOrderToLocalStorage = (pairs: string[]) => {
    try {
        localStorage.setItem('rthmn-pairs-order', JSON.stringify(pairs));
    } catch (e) {
        console.error('Failed to save pairs order:', e);
    }
};

// Helper to get order from localStorage
const getOrderFromLocalStorage = (): string[] => {
    try {
        const saved = localStorage.getItem('rthmn-pairs-order');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Failed to get pairs order:', e);
        return [];
    }
};

export const useGridStore = create<GridState>()(
    persist(
        (set, get) => ({
            breakpoints: DEFAULT_BREAKPOINTS,
            orderedPairs: getOrderFromLocalStorage(),
            lastWidth: 0,
            lastCols: DEFAULT_BREAKPOINTS[0].cols,
            initialized: false,

            setInitialPairs: (pairs: string[]) => {
                const state = get();
                if (!state.initialized) {
                    set({
                        orderedPairs: pairs,
                        initialized: true,
                    });
                    saveOrderToLocalStorage(pairs);
                }
            },

            reorderPairs: (newOrder: string[]) => {
                set({ orderedPairs: newOrder });
                saveOrderToLocalStorage(newOrder);
            },

            updateBreakpoint: (width: number, cols: number) => {
                set((state) => {
                    const newBreakpoints = [...state.breakpoints];
                    const matchingIndex = newBreakpoints.findIndex((bp) => Math.abs(bp.width - width) <= 50);

                    if (matchingIndex !== -1) {
                        newBreakpoints[matchingIndex] = { width, cols };
                    } else {
                        const insertIndex = newBreakpoints.findIndex((bp) => bp.width > width);
                        if (insertIndex === -1) {
                            newBreakpoints.push({ width, cols });
                        } else {
                            newBreakpoints.splice(insertIndex, 0, { width, cols });
                        }
                    }

                    const cleanedBreakpoints = newBreakpoints.reduce((acc, curr, i, arr) => {
                        if (i === 0) return [curr];
                        const prev = acc[acc.length - 1];
                        if (prev.cols === curr.cols) return acc;
                        return [...acc, curr];
                    }, [] as GridBreakpoint[]);

                    return {
                        ...state,
                        breakpoints: cleanedBreakpoints,
                        lastWidth: width,
                        lastCols: cols,
                    };
                });
            },

            getGridClass: (width: number) => {
                const state = get();
                if (state.lastWidth === width) {
                    return `grid w-full gap-4 grid-cols-${state.lastCols}`;
                }
                const breakpoint = state.breakpoints.reduce((prev, curr) => {
                    if (width >= curr.width) return curr;
                    return prev;
                });
                return `grid w-full gap-4 grid-cols-${breakpoint.cols}`;
            },
        }),
        {
            name: 'grid-storage',
            merge: (persistedState: any, currentState: GridState) => ({
                ...currentState,
                ...persistedState,
                initialized: false,
                lastWidth: 0,
                lastCols: DEFAULT_BREAKPOINTS[0].cols,
            }),
        }
    )
);
