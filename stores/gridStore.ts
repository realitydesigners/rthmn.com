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
}

const DEFAULT_BREAKPOINTS: GridBreakpoint[] = [
    { width: 600, cols: 1 }, // 0-600
    { width: 800, cols: 1 }, // 601-800
    { width: 900, cols: 2 }, // 801-900
    { width: 1000, cols: 2 }, // 901-1000
    { width: 1100, cols: 2 }, // 1001-1100
    { width: 1200, cols: 2 }, // 1101-1200
    { width: 1300, cols: 3 }, // 1201-1300
    { width: 1400, cols: 3 }, // 1301-1400
    { width: 1500, cols: 3 }, // 1401-1500
    { width: 1600, cols: 3 }, // 1501-1600
    { width: 1800, cols: 4 }, // 1601-1800
    { width: Infinity, cols: 4 }, // 1801+
];

export const useGridStore = create<GridState>()(
    persist(
        (set, get) => ({
            breakpoints: DEFAULT_BREAKPOINTS,

            updateBreakpoint: (width: number, cols: number) => {
                set((state) => {
                    // Find the breakpoint for this width range
                    let index = -1;
                    for (let i = 0; i < state.breakpoints.length; i++) {
                        const bp = state.breakpoints[i];
                        const prevBp = state.breakpoints[i - 1];
                        const minWidth = prevBp ? prevBp.width : 0;

                        if (width > minWidth && width <= bp.width) {
                            index = i;
                            break;
                        }
                    }

                    if (index === -1) return state;

                    // Create new array with updated breakpoint
                    const newBreakpoints = [...state.breakpoints];
                    newBreakpoints[index] = { ...newBreakpoints[index], cols };

                    return { breakpoints: newBreakpoints };
                });
            },

            getGridClass: (width: number) => {
                const { breakpoints } = get();
                let cols = breakpoints[breakpoints.length - 1].cols;

                // Find the appropriate breakpoint for this width
                for (let i = 0; i < breakpoints.length; i++) {
                    const bp = breakpoints[i];
                    const prevBp = breakpoints[i - 1];
                    const minWidth = prevBp ? prevBp.width : 0;

                    if (width > minWidth && width <= bp.width) {
                        cols = bp.cols;
                        break;
                    }
                }

                return `grid w-full gap-4 grid-cols-${cols}`;
            },
        }),
        {
            name: 'grid-storage',
            version: 2, // Increment version to ensure clean state
            merge: (persistedState: any, currentState: GridState) => {
                // Ensure we keep persisted breakpoint settings
                return {
                    ...currentState,
                    ...persistedState,
                };
            },
        }
    )
);
