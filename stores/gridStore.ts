import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    { width: 1600, cols: 5 }, // Add a breakpoint for 5 columns
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

// Helper to save grid preferences to localStorage
const saveGridPreferences = (breakpoints: GridBreakpoint[], cols: number) => {
    try {
        localStorage.setItem('rthmn-grid-preferences', JSON.stringify({ breakpoints, lastCols: cols }));
        console.log('Grid preferences saved:', { breakpoints, cols });
    } catch (e) {
        console.error('Failed to save grid preferences:', e);
    }
};

// Helper to get grid preferences from localStorage
const getGridPreferences = (): { breakpoints: GridBreakpoint[]; lastCols: number } | null => {
    try {
        if (typeof window === 'undefined') return null; // Don't run on server
        const saved = localStorage.getItem('rthmn-grid-preferences');
        const prefs = saved ? JSON.parse(saved) : null;
        console.log('Grid preferences loaded:', prefs);
        return prefs;
    } catch (e) {
        console.error('Failed to get grid preferences:', e);
        return null;
    }
};

// Get saved preferences or use defaults
let savedPreferences: { breakpoints: GridBreakpoint[]; lastCols: number } | null = null;
if (typeof window !== 'undefined') {
    savedPreferences = getGridPreferences();
}
const INITIAL_BREAKPOINTS = savedPreferences?.breakpoints || DEFAULT_BREAKPOINTS;
const INITIAL_COLS = savedPreferences?.lastCols || DEFAULT_BREAKPOINTS[0].cols;

export const useGridStore = create<GridState>()(
    persist(
        (set, get) => ({
            breakpoints: INITIAL_BREAKPOINTS,
            orderedPairs: getOrderFromLocalStorage(),
            lastWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
            lastCols: INITIAL_COLS,
            initialized: false,

            setInitialPairs: (pairs: string[]) => {
                const state = get();
                if (!state.initialized && pairs.length > 0) {
                    const initialOrder = getOrderFromLocalStorage();
                    const finalOrder = initialOrder.length === pairs.length ? initialOrder : pairs;
                    set({
                        orderedPairs: finalOrder,
                        initialized: true,
                    });
                    if (initialOrder.length !== pairs.length) {
                        saveOrderToLocalStorage(finalOrder);
                    }
                }
            },

            reorderPairs: (newOrder: string[]) => {
                set({ orderedPairs: newOrder });
                saveOrderToLocalStorage(newOrder);
            },

            updateBreakpoint: (width: number, cols: number) => {
                set((state) => {
                    if (width <= 0) return state;

                    console.log(`Grid store - Updating cols to ${cols} for width ${width}`);
                    const newState = {
                        ...state,
                        lastWidth: width,
                        lastCols: cols,
                    };
                    saveGridPreferences(state.breakpoints, cols);
                    return newState;
                });
            },

            getGridClass: (width: number) => {
                const state = get();
                let calculatedCols = 1;
                for (let i = state.breakpoints.length - 1; i >= 0; i--) {
                    if (width >= state.breakpoints[i].width) {
                        calculatedCols = state.breakpoints[i].cols;
                        break;
                    }
                }
                const colsToUse = state.lastCols > 0 ? state.lastCols : calculatedCols;
                console.log(`Grid store - getGridClass: width=${width}, lastCols=${state.lastCols}, calculatedCols=${calculatedCols}, using=${colsToUse}`);
                return `grid w-full gap-4 grid-cols-${colsToUse}`;
            },
        }),
        {
            name: 'grid-storage',
            merge: (persistedState: any, currentState: GridState) => {
                console.log('Merging persisted state:', { persistedState, currentState });
                const mergedState = {
                    ...currentState,
                    ...(persistedState as Partial<GridState>),
                    initialized: currentState.initialized,
                };
                mergedState.lastCols = (persistedState as Partial<GridState>)?.lastCols || 1;
                console.log('Final merged state:', mergedState);
                return mergedState;
            },
        }
    )
);
