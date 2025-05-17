import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type LayoutPreset = 'compact' | 'balanced' | 'expanded';

interface GridState {
	currentLayout: LayoutPreset;
	orderedPairs: string[];
	initialized: boolean;
	setLayout: (layout: LayoutPreset) => void;
	getGridColumns: (windowWidth: number) => number;
	reorderPairs: (newOrder: string[]) => void;
	setInitialPairs: (pairs: string[]) => void;
}

// Helper to save layout to storage
const saveLayoutToStorage = (layout: LayoutPreset) => {
	try {
		if (typeof window !== "undefined") {
			localStorage.setItem("rthmn-layout-preset", layout);
		}
	} catch (e) {
		console.error("Failed to save layout:", e);
	}
};

// Helper to get layout from storage
const getLayoutFromStorage = (): LayoutPreset => {
	try {
		if (typeof window === "undefined") return 'balanced';
		const saved = localStorage.getItem("rthmn-layout-preset");
		return (saved as LayoutPreset) || 'balanced';
	} catch (e) {
		console.error("Failed to get layout:", e);
		return 'balanced';
	}
};

// Helper to save order to storage
const saveOrderToStorage = (pairs: string[]) => {
	try {
		if (typeof window !== "undefined") {
			localStorage.setItem("rthmn-pairs-order", JSON.stringify(pairs));
		}
	} catch (e) {
		console.error("Failed to save pairs order:", e);
	}
};

// Helper to get order from storage
const getOrderFromStorage = (): string[] => {
	try {
		if (typeof window === "undefined") return [];
		const saved = localStorage.getItem("rthmn-pairs-order");
		return saved ? JSON.parse(saved) : [];
	} catch (e) {
		console.error("Failed to get pairs order:", e);
		return [];
	}
};

// Breakpoint definitions
const BREAKPOINTS = {
	sm: 640,
	lg: 1024,
	xl: 1400
};

let store: ReturnType<typeof createStore> | null = null;

const createStore = () => {
	return create<GridState>()(
		persist(
			(set, get) => ({
				currentLayout: 'balanced', // Default value for SSR
				orderedPairs: [], // Default value for SSR
				initialized: false,

				setLayout: (layout: LayoutPreset) => {
					console.log('Store - Setting layout to:', layout);
					set({ currentLayout: layout });
					if (typeof window !== "undefined") {
						saveLayoutToStorage(layout);
					}
				},

				setInitialPairs: (pairs: string[]) => {
					const state = get();
					if (!state.initialized && pairs.length > 0) {
						const initialOrder = typeof window !== "undefined" ? getOrderFromStorage() : [];
						const finalOrder = initialOrder.length === pairs.length ? initialOrder : pairs;
						set({
							orderedPairs: finalOrder,
							initialized: true,
						});
						if (initialOrder.length !== pairs.length && typeof window !== "undefined") {
							saveOrderToStorage(finalOrder);
						}
					}
				},

				reorderPairs: (newOrder: string[]) => {
					set({ orderedPairs: newOrder });
					if (typeof window !== "undefined") {
						saveOrderToStorage(newOrder);
					}
				},

				getGridColumns: (windowWidth: number) => {
					const state = get();
					console.log('Store - Getting columns for layout:', state.currentLayout, 'width:', windowWidth);
					
					switch (state.currentLayout) {
						case 'compact':
							if (windowWidth >= BREAKPOINTS.xl) return 4;
							if (windowWidth >= BREAKPOINTS.lg) return 3;
							if (windowWidth >= BREAKPOINTS.sm) return 2;
							return 1;
						case 'expanded':
							if (windowWidth >= BREAKPOINTS.xl) return 2;
							if (windowWidth >= BREAKPOINTS.lg) return 2;
							return 1;
						case 'balanced':
						default:
							if (windowWidth >= BREAKPOINTS.xl) return 3;
							if (windowWidth >= BREAKPOINTS.lg) return 2;
							if (windowWidth >= BREAKPOINTS.sm) return 2;
							return 1;
					}
				},
			}),
			{
				name: "grid-storage",
				storage: createJSONStorage(() => ({
					getItem: () => {
						if (typeof window === "undefined") return null;
						return localStorage.getItem("grid-storage");
					},
					setItem: (name, value) => {
						if (typeof window !== "undefined") {
							localStorage.setItem(name, value);
						}
					},
					removeItem: (name) => {
						if (typeof window !== "undefined") {
							localStorage.removeItem(name);
						}
					},
				})),
				skipHydration: true, // Important: Skip hydration to prevent mismatch
			},
		),
	);
};

// Initialize store only on client side
const initializeStore = () => {
	if (typeof window === "undefined") return createStore();
	if (store === null) store = createStore();
	return store;
};

export const useGridStore = initializeStore();
