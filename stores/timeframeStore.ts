import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface TimeframeSettings {
    startIndex: number;
    maxBoxCount: number;
    showPriceLines: boolean;
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
    togglePriceLines: (pair?: string) => void;
}

const DEFAULT_SETTINGS: TimeframeSettings = {
    startIndex: 0,
    maxBoxCount: 7,
    showPriceLines: true,
};

// Get initial state from localStorage synchronously
const getInitialState = () => {
    if (typeof window === 'undefined') return null;
    try {
        const saved = localStorage.getItem('timeframe-storage');
        if (!saved) return null;
        return JSON.parse(saved);
    } catch (e) {
        return null;
    }
};

const initialState = getInitialState();

export const useTimeframeStore = create<TimeframeState>()(
    persist(
        (set, get) => ({
            global: {
                settings: initialState?.state?.global?.settings || DEFAULT_SETTINGS,
                isDragging: false,
                dragType: null,
            },
            pairs: initialState?.state?.pairs || {},
            pairsBackup: {},

            updateGlobalSettings: (settings) =>
                set((state) => {
                    // Don't handle showPriceLines in global settings update
                    const { showPriceLines, ...timeframeSettings } = settings;
                    const newGlobalSettings = {
                        ...state.global.settings,
                        ...timeframeSettings,
                    };

                    // Validate the new settings
                    const isValidSettings =
                        newGlobalSettings.startIndex >= 0 &&
                        newGlobalSettings.startIndex <= 36 &&
                        newGlobalSettings.maxBoxCount >= 2 &&
                        newGlobalSettings.maxBoxCount <= 38 &&
                        newGlobalSettings.startIndex + newGlobalSettings.maxBoxCount <= 38;

                    if (isValidSettings) {
                        // Update all pairs with the new timeframe settings
                        const updatedPairs = { ...state.pairs };
                        Object.keys(state.pairs).forEach((pair) => {
                            updatedPairs[pair] = {
                                ...state.pairs[pair],
                                startIndex: newGlobalSettings.startIndex,
                                maxBoxCount: newGlobalSettings.maxBoxCount,
                            };
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

            togglePriceLines: (pair) =>
                set((state) => {
                    if (pair) {
                        // Toggle for specific pair
                        return {
                            pairs: {
                                ...state.pairs,
                                [pair]: {
                                    ...state.pairs[pair],
                                    showPriceLines: !state.pairs[pair].showPriceLines,
                                },
                            },
                        };
                    }

                    // Toggle global setting and update all pairs
                    const newShowPriceLines = !state.global.settings.showPriceLines;
                    const updatedPairs = { ...state.pairs };
                    Object.keys(state.pairs).forEach((pair) => {
                        updatedPairs[pair] = {
                            ...state.pairs[pair],
                            showPriceLines: newShowPriceLines,
                        };
                    });

                    return {
                        global: {
                            ...state.global,
                            settings: {
                                ...state.global.settings,
                                showPriceLines: newShowPriceLines,
                            },
                        },
                        pairs: updatedPairs,
                    };
                }),

            startGlobalDrag: (dragType) =>
                set((state) => ({
                    global: {
                        ...state.global,
                        isDragging: true,
                        dragType,
                    },
                })),

            endGlobalDrag: () =>
                set((state) => ({
                    global: {
                        ...state.global,
                        isDragging: false,
                        dragType: null,
                    },
                })),

            updatePairSettings: (pair, settings) =>
                set((state) => ({
                    pairs: {
                        ...state.pairs,
                        [pair]: { ...state.global.settings, ...state.pairs[pair], ...settings },
                    },
                })),

            initializePair: (pair) =>
                set((state) => {
                    if (!state.pairs[pair]) {
                        // Use global settings instead of DEFAULT_SETTINGS for new pairs
                        const newSettings = { ...state.global.settings };
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
                // Return global settings if pair doesn't exist yet
                if (!state.pairs[pair]) {
                    return state.global.settings;
                }
                return state.pairs[pair];
            },
        }),
        {
            name: 'timeframe-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                global: { settings: state.global.settings },
                pairs: state.pairs,
            }),
        }
    )
);
