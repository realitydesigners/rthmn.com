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
            orderedPairs: getOrderFromLocalStorage(), // Initialize with saved order
            lastWidth: 0,
            lastCols: DEFAULT_BREAKPOINTS[0].cols,
            initialized: false,

            setInitialPairs: (pairs: string[]) => {
                const state = get();
                const savedOrder = getOrderFromLocalStorage();

                // If already initialized and pairs haven't changed, do nothing
                if (state.initialized && state.orderedPairs.length === pairs.length && state.orderedPairs.every((p) => pairs.includes(p))) {
                    return;
                }

                let newOrder: string[];

                if (savedOrder.length > 0) {
                    // Keep pairs in saved order if they still exist
                    const orderedExisting = savedOrder.filter((pair) => pairs.includes(pair));
                    // Add any new pairs that weren't in the saved order
                    const newPairs = pairs.filter((pair) => !savedOrder.includes(pair));
                    newOrder = [...orderedExisting, ...newPairs];
                } else {
                    newOrder = [...pairs];
                }

                set({
                    orderedPairs: newOrder,
                    initialized: true,
                });
                saveOrderToLocalStorage(newOrder);
            },

            reorderPairs: (newOrder: string[]) => {
                const currentOrder = get().orderedPairs;

                // If arrays are identical, do nothing
                if (currentOrder.length === newOrder.length && currentOrder.every((pair, index) => pair === newOrder[index])) {
                    return;
                }

                // Validate the new order contains all the same pairs
                const currentSet = new Set<string>(currentOrder);
                const newSet = new Set<string>(newOrder);

                if (currentSet.size !== newSet.size) {
                    console.error('Invalid reorder: different number of pairs');
                    return;
                }

                // Check if all current pairs exist in the new order
                const missingPairs = Array.from(currentSet).filter((pair) => !newSet.has(pair));
                if (missingPairs.length > 0) {
                    console.error('Invalid reorder: missing pairs', missingPairs);
                    return;
                }

                // Update both store and localStorage
                set({ orderedPairs: [...newOrder] });
                saveOrderToLocalStorage([...newOrder]);

                // Debug log
                console.log('Reordered pairs saved:', newOrder);
            },

            updateBreakpoint: (width: number, cols: number) => {
                set((state) => {
                    const newBreakpoints = [...state.breakpoints];

                    // Find matching breakpoint within 50px
                    const matchingIndex = newBreakpoints.findIndex((bp) => Math.abs(bp.width - width) <= 50);

                    if (matchingIndex !== -1) {
                        // Update existing breakpoint
                        newBreakpoints[matchingIndex] = { width, cols };
                    } else {
                        // Add new breakpoint at the correct position
                        const insertIndex = newBreakpoints.findIndex((bp) => bp.width > width);
                        if (insertIndex === -1) {
                            newBreakpoints.push({ width, cols });
                        } else {
                            newBreakpoints.splice(insertIndex, 0, { width, cols });
                        }
                    }

                    // Clean up redundant breakpoints
                    const cleanedBreakpoints = newBreakpoints.reduce((acc, curr, i, arr) => {
                        if (i === 0) return [curr];
                        const prev = acc[acc.length - 1];
                        // Skip if this breakpoint has same columns as previous
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

                // Quick return if width hasn't changed
                if (state.lastWidth === width) {
                    return `grid w-full gap-4 grid-cols-${state.lastCols}`;
                }

                // Find the appropriate breakpoint for this width
                const breakpoint = state.breakpoints.reduce((prev, curr) => {
                    if (width >= curr.width) return curr;
                    return prev;
                });

                return `grid w-full gap-4 grid-cols-${breakpoint.cols}`;
            },
        }),
        {
            name: 'grid-storage',
            merge: (persistedState: any, currentState: GridState) => {
                const selectedPairs = getSelectedPairs();
                const savedOrder = getOrderFromLocalStorage();

                // If we have a saved order, use it to order the selected pairs
                let orderedPairs = selectedPairs;
                if (savedOrder.length > 0) {
                    // Keep pairs in saved order if they still exist
                    const orderedExisting = savedOrder.filter((pair) => selectedPairs.includes(pair));
                    // Add any new pairs that weren't in the saved order
                    const newPairs = selectedPairs.filter((pair) => !savedOrder.includes(pair));
                    orderedPairs = [...orderedExisting, ...newPairs];
                }

                return {
                    ...currentState,
                    ...persistedState,
                    orderedPairs,
                    initialized: false,
                    lastWidth: 0,
                    lastCols: DEFAULT_BREAKPOINTS[0].cols,
                };
            },
        }
    )
);
