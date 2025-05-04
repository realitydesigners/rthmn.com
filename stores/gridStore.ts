import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

// Create a safe storage object that works in both browser and server environments
const createSafeStorage = () => {
    if (typeof window !== 'undefined') {
        return window.localStorage;
    }
    return {
        getItem: () => null,
        setItem: () => undefined,
        removeItem: () => undefined,
    };
};

// Helper to safely interact with storage
const safeStorage = createSafeStorage();

// Helper to save order to storage
const saveOrderToStorage = (pairs: string[]) => {
    try {
        safeStorage.setItem('rthmn-pairs-order', JSON.stringify(pairs));
    } catch (e) {
        console.error('Failed to save pairs order:', e);
    }
};

// Helper to get order from storage
const getOrderFromStorage = (): string[] => {
    try {
        if (typeof window === 'undefined') return [];
        const saved = safeStorage.getItem('rthmn-pairs-order');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Failed to get pairs order:', e);
        return [];
    }
};

// Helper to save grid preferences to storage
const saveGridPreferences = (breakpoints: GridBreakpoint[], cols: number) => {
    try {
        safeStorage.setItem('rthmn-grid-preferences', JSON.stringify({ breakpoints, lastCols: cols }));
    } catch (e) {
        console.error('Failed to save grid preferences:', e);
    }
};

// Helper to get grid preferences from storage
const getGridPreferences = (): { breakpoints: GridBreakpoint[]; lastCols: number } | null => {
    try {
        if (typeof window === 'undefined') return null;
        const saved = safeStorage.getItem('rthmn-grid-preferences');
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error('Failed to get grid preferences:', e);
        return null;
    }
};

let store: ReturnType<typeof createStore> | null = null;

const createStore = () => {
    const savedPrefs = getGridPreferences();
    return create<GridState>()(
        persist(
            (set, get) => ({
                breakpoints: savedPrefs?.breakpoints || DEFAULT_BREAKPOINTS,
                orderedPairs: getOrderFromStorage(),
                lastWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
                lastCols: savedPrefs?.lastCols || DEFAULT_BREAKPOINTS[0].cols,
                initialized: false,

                setInitialPairs: (pairs: string[]) => {
                    const state = get();
                    if (!state.initialized && pairs.length > 0) {
                        const initialOrder = getOrderFromStorage();
                        const finalOrder = initialOrder.length === pairs.length ? initialOrder : pairs;
                        set({
                            orderedPairs: finalOrder,
                            initialized: true,
                        });
                        if (initialOrder.length !== pairs.length) {
                            saveOrderToStorage(finalOrder);
                        }
                    }
                },

                reorderPairs: (newOrder: string[]) => {
                    set({ orderedPairs: newOrder });
                    saveOrderToStorage(newOrder);
                },

                updateBreakpoint: (width: number, cols: number) => {
                    set((state) => {
                        if (width <= 0) return state;
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
                    return `grid w-full gap-4 grid-cols-${colsToUse}`;
                },
            }),
            {
                name: 'grid-storage',
                storage: createJSONStorage(() => createSafeStorage()),
                skipHydration: true,
                merge: (persistedState: any, currentState: GridState) => {
                    const mergedState = {
                        ...currentState,
                        ...(persistedState as Partial<GridState>),
                        initialized: currentState.initialized,
                    };
                    mergedState.lastCols = (persistedState as Partial<GridState>)?.lastCols || 1;
                    return mergedState;
                },
            }
        )
    );
};

// Initialize store only on client side
const initializeStore = () => {
    if (typeof window === 'undefined') return createStore();
    if (store === null) store = createStore();
    return store;
};

export const useGridStore = initializeStore();
