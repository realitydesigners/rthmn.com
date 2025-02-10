import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GridBreakpoint {
    width: number;
    cols: number;
}

interface GridState {
    breakpoints: GridBreakpoint[];
    updateBreakpoint: (width: number, cols: number) => void;
    getGridClass: (width: number) => string;
    lastWidth: number;
    lastCols: number;
}

// Initial default breakpoints
const DEFAULT_BREAKPOINTS: GridBreakpoint[] = [
    { width: 0, cols: 1 }, // Mobile/smallest screens
    { width: 640, cols: 2 }, // Small screens
    { width: 1024, cols: 3 }, // Medium screens
    { width: 1400, cols: 4 }, // Large screens
];

export const useGridStore = create<GridState>()(
    persist(
        (set, get) => ({
            breakpoints: DEFAULT_BREAKPOINTS,
            lastWidth: 0,
            lastCols: DEFAULT_BREAKPOINTS[0].cols,

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
            version: 7, // Increment version to force reset
            merge: (persistedState: any, currentState: GridState) => {
                return {
                    ...currentState,
                    ...persistedState,
                    lastWidth: 0,
                    lastCols: DEFAULT_BREAKPOINTS[0].cols,
                };
            },
        }
    )
);
