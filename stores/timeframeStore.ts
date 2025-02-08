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
        dragType: string | null;
    };
    pairs: Record<string, TimeframeSettings>;
    pairsBackup: Record<string, TimeframeSettings>;
    updateGlobalSettings: (settings: Partial<TimeframeSettings>) => void;
    updatePairSettings: (pair: string, settings: Partial<TimeframeSettings>) => void;
    startGlobalDrag: (dragType: string) => void;
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
                dragType: null,
            },
            pairs: {},
            pairsBackup: {},

            updateGlobalSettings: (settings) =>
                set((state) => {
                    const newGlobalSettings = {
                        ...state.global.settings,
                        ...settings,
                    };

                    // Only sync pairs if we're dragging AND the values are within valid ranges
                    if (state.global.isDragging) {
                        // Validate the new settings
                        const isValidSettings =
                            newGlobalSettings.startIndex >= 0 &&
                            newGlobalSettings.startIndex <= 36 &&
                            newGlobalSettings.maxBoxCount >= 2 &&
                            newGlobalSettings.maxBoxCount <= 38 &&
                            newGlobalSettings.startIndex + newGlobalSettings.maxBoxCount <= 38;

                        if (isValidSettings) {
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
                    }

                    // If not dragging or invalid settings, only update global
                    return {
                        global: {
                            ...state.global,
                            settings: newGlobalSettings,
                        },
                    };
                }),

            startGlobalDrag: (dragType) =>
                set((state) => {
                    // If already dragging, maintain the current state and just update the drag type
                    if (state.global.isDragging) {
                        return {
                            ...state,
                            global: {
                                ...state.global,
                                dragType,
                            },
                        };
                    }

                    // For new drags, backup the pairs and start dragging
                    return {
                        ...state,
                        global: {
                            ...state.global,
                            isDragging: true,
                            dragType,
                        },
                        pairsBackup: { ...state.pairs },
                    };
                }),

            endGlobalDrag: () =>
                set((state) => {
                    // Only restore pairs if we have a backup
                    const nextState: Partial<TimeframeState> = {
                        global: {
                            ...state.global,
                            isDragging: false,
                            dragType: null,
                        },
                    };

                    if (Object.keys(state.pairsBackup).length > 0) {
                        nextState.pairs = { ...state.pairsBackup };
                        nextState.pairsBackup = {};
                    }

                    return nextState as TimeframeState;
                }),

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
