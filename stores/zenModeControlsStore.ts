import { create } from "zustand";

interface ZenModeControlsStore {
	viewMode: "scene" | "focus";
	focusedIndex: number;
	setViewMode: (mode: "scene" | "focus") => void;
	setFocusedIndex: (index: number) => void;
	nextPair: (pairsLength: number) => void;
	prevPair: (pairsLength: number) => void;
}

export const useZenModeControlsStore = create<ZenModeControlsStore>(
	(set, get) => ({
		viewMode: "scene",
		focusedIndex: 0,
		setViewMode: (mode) => set({ viewMode: mode }),
		setFocusedIndex: (index) => set({ focusedIndex: index }),
		nextPair: (pairsLength) => {
			const { focusedIndex } = get();
			set({ focusedIndex: (focusedIndex + 1) % pairsLength });
		},
		prevPair: (pairsLength) => {
			const { focusedIndex } = get();
			set({ focusedIndex: (focusedIndex - 1 + pairsLength) % pairsLength });
		},
	}),
);
