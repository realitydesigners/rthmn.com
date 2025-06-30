import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type LayoutPreset = "compact" | "balanced";

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

// Minimum widths needed for each column count
const MIN_WIDTH_PER_COLUMN = {
	compact: {
		2: 500, // Need at least 500px for 2 columns
		3: 800, // Need at least 800px for 3 columns
		4: 1200, // Need at least 1200px for 4 columns
	},
	balanced: {
		2: 800, // Need at least 500px for 2 columns
		3: 1200, // Need at least 900px for 3 columns
	},
};

let store: ReturnType<typeof createStore> | null = null;

const createStore = () => {
	return create<GridState>()(
		persist(
			(set, get) => ({
				currentLayout:
					typeof window !== "undefined"
						? (localStorage.getItem("rthmn-layout-preset") as LayoutPreset) ||
							"balanced"
						: "balanced",
				orderedPairs: [],
				initialized: false,

				setLayout: (layout: LayoutPreset) => {
					set({ currentLayout: layout });
					saveLayoutToStorage(layout);
				},

				setInitialPairs: (pairs: string[]) => {
					const state = get();
					if (!state.initialized && pairs.length > 0) {
						const initialOrder =
							typeof window !== "undefined" ? getOrderFromStorage() : [];
						const finalOrder =
							initialOrder.length === pairs.length ? initialOrder : pairs;
						set({
							orderedPairs: finalOrder,
							initialized: true,
						});
						if (
							initialOrder.length !== pairs.length &&
							typeof window !== "undefined"
						) {
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

					// During SSR or no width provided, return 1 column
					if (typeof window === "undefined" || !windowWidth) {
						return 1;
					}

					const main = document.querySelector("main");
					// Get actual available width accounting for sidebars
					const availableWidth = main ? main.clientWidth : windowWidth;

					switch (state.currentLayout) {
						case "compact":
							// Start with max columns and reduce based on available width
							if (availableWidth >= MIN_WIDTH_PER_COLUMN.compact[4]) return 4;
							if (availableWidth >= MIN_WIDTH_PER_COLUMN.compact[3]) return 3;
							if (availableWidth >= MIN_WIDTH_PER_COLUMN.compact[2]) return 2;
							return 1;

						case "balanced":
						default:
							// Balanced layout never goes above 3 columns
							if (availableWidth >= MIN_WIDTH_PER_COLUMN.balanced[3]) return 3;
							if (availableWidth >= MIN_WIDTH_PER_COLUMN.balanced[2]) return 2;
							return 1;
					}
				},
			}),
			{
				name: "grid-storage",
				storage: createJSONStorage(() => localStorage),
				partialize: (state) => ({
					currentLayout: state.currentLayout,
					orderedPairs: state.orderedPairs,
				}),
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
