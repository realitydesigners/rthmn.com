import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TimeframeSettings {
    startIndex: number;
    maxBoxCount: number;
}

interface TimeframeState {
    global: {
        settings: TimeframeSettings;
        isDragging: boolean;
    };
    pairs: Record<string, TimeframeSettings>;
    pairsBackup: Record<string, TimeframeSettings>;
    updateGlobalSettings: (settings: Partial<TimeframeSettings>) => void;
    updatePairSettings: (pair: string, settings: Partial<TimeframeSettings>) => void;
    startGlobalDrag: () => void;
    endGlobalDrag: () => void;
    getSettingsForPair: (pair: string) => TimeframeSettings;
    initializePair: (pair: string) => void;
}

const DEFAULT_SETTINGS: TimeframeSettings = {
    startIndex: 0,
    maxBoxCount: 38,
};

export const useTimeframeStore = create<TimeframeState>()(
    persist(
        (set, get) => ({
            global: {
                settings: DEFAULT_SETTINGS,
                isDragging: false,
            },
            pairs: {},
            pairsBackup: {},

            updateGlobalSettings: (settings) =>
                set((state) => {
                    const newGlobalSettings = {
                        ...state.global.settings,
                        ...settings,
                    };

                    // Only sync pairs if we're dragging
                    if (state.global.isDragging) {
                        const updatedPairs = { ...state.pairs };
                        Object.keys(state.pairs).forEach((pair) => {
                            updatedPairs[pair] = { ...newGlobalSettings };
                        });

                        return {
                            global: {
                                ...state.global,
                                settings: newGlobalSettings,
                            },
                            pairs: updatedPairs,
                        };
                    }

                    return {
                        global: {
                            ...state.global,
                            settings: newGlobalSettings,
                        },
                    };
                }),

            startGlobalDrag: () =>
                set((state) => ({
                    global: {
                        ...state.global,
                        isDragging: true,
                    },
                    // Backup current pair states
                    pairsBackup: { ...state.pairs },
                })),

            endGlobalDrag: () =>
                set((state) => ({
                    global: {
                        ...state.global,
                        isDragging: false,
                    },
                    // Restore individual pair states
                    pairs: { ...state.pairsBackup },
                })),

            updatePairSettings: (pair, settings) =>
                set((state) => ({
                    pairs: {
                        ...state.pairs,
                        [pair]: { ...DEFAULT_SETTINGS, ...state.pairs[pair], ...settings },
                    },
                })),

            initializePair: (pair) =>
                set((state) => {
                    if (!state.pairs[pair]) {
                        const newSettings = { ...DEFAULT_SETTINGS };
                        return {
                            pairs: {
                                ...state.pairs,
                                [pair]: newSettings,
                            },
                            pairsBackup: {
                                ...state.pairsBackup,
                                [pair]: newSettings,
                            },
                        };
                    }
                    return state;
                }),

            getSettingsForPair: (pair) => {
                const state = get();
                // Initialize pair if it doesn't exist
                if (!state.pairs[pair]) {
                    get().initializePair(pair);
                }
                return state.pairs[pair] || DEFAULT_SETTINGS;
            },
        }),
        {
            name: 'timeframe-storage',
            partialize: (state) => ({
                global: { settings: state.global.settings },
                pairs: state.pairs,
            }),
        }
    )
);
