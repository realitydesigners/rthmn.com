import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TimeframeSettings {
    startIndex: number;
    maxBoxCount: number;
}

interface TimeframeState {
    global: {
        settings: TimeframeSettings;
        isGlobalControl: boolean;
    };
    pairs: Record<string, TimeframeSettings>;
    updateGlobalSettings: (settings: Partial<TimeframeSettings>) => void;
    updatePairSettings: (pair: string, settings: Partial<TimeframeSettings>) => void;
    setGlobalControl: (isGlobal: boolean) => void;
    getSettingsForPair: (pair: string) => TimeframeSettings;
    initializePair: (pair: string) => void;
}

const DEFAULT_SETTINGS: TimeframeSettings = {
    startIndex: 0,
    maxBoxCount: 10,
};

export const useTimeframeStore = create<TimeframeState>()(
    persist(
        (set, get) => ({
            global: {
                settings: DEFAULT_SETTINGS,
                isGlobalControl: false,
            },
            pairs: {},

            updateGlobalSettings: (settings) =>
                set((state) => ({
                    global: {
                        ...state.global,
                        settings: { ...state.global.settings, ...settings },
                    },
                })),

            updatePairSettings: (pair, settings) =>
                set((state) => ({
                    pairs: {
                        ...state.pairs,
                        [pair]: { ...DEFAULT_SETTINGS, ...state.pairs[pair], ...settings },
                    },
                })),

            setGlobalControl: (isGlobal) =>
                set((state) => {
                    // When disabling global control, copy current global settings to all pairs
                    if (!isGlobal) {
                        const updatedPairs = { ...state.pairs };
                        Object.keys(state.pairs).forEach((pair) => {
                            updatedPairs[pair] = { ...state.global.settings };
                        });
                        return {
                            global: {
                                ...state.global,
                                isGlobalControl: false,
                            },
                            pairs: updatedPairs,
                        };
                    }
                    return {
                        global: {
                            ...state.global,
                            isGlobalControl: isGlobal,
                        },
                    };
                }),

            initializePair: (pair) =>
                set((state) => {
                    if (!state.pairs[pair]) {
                        return {
                            pairs: {
                                ...state.pairs,
                                [pair]: { ...DEFAULT_SETTINGS },
                            },
                        };
                    }
                    return state;
                }),

            getSettingsForPair: (pair) => {
                const state = get();
                if (state.global.isGlobalControl) {
                    return state.global.settings;
                }
                // Initialize pair if it doesn't exist
                if (!state.pairs[pair]) {
                    get().initializePair(pair);
                }
                return state.pairs[pair] || state.global.settings;
            },
        }),
        {
            name: 'timeframe-storage',
        }
    )
);
