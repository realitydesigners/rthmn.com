import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BoxColors {
    positive: string;
    negative: string;
    styles?: {
        borderRadius: number;
        shadowIntensity: number;
        opacity: number;
        showBorder: boolean;
        globalTimeframeControl: boolean;
        showLineChart: boolean;
        perspective?: boolean;
        viewMode?: 'default' | '3d' | 'line';
    };
}

export interface ColorState {
    boxColors: BoxColors;
    updateBoxColors: (colors: Partial<BoxColors>) => void;
    updateStyles: (styles: Partial<BoxColors['styles']>) => void;
}

const DEFAULT_BOX_COLORS: BoxColors = {
    positive: '#3FFFA2', // Green
    negative: '#212422', // Darker Green
    styles: {
        borderRadius: 4,
        shadowIntensity: 0.1,
        opacity: 0.2,
        showBorder: true,
        globalTimeframeControl: false,
        showLineChart: false,
        perspective: false,
        viewMode: 'default',
    },
};

export const useColorStore = create<ColorState>()(
    persist(
        (set) => ({
            boxColors: DEFAULT_BOX_COLORS,

            updateBoxColors: (colors) =>
                set((state) => ({
                    boxColors: {
                        ...state.boxColors,
                        ...colors,
                        styles: {
                            ...state.boxColors.styles,
                            ...colors.styles,
                        },
                    },
                })),

            updateStyles: (styles) =>
                set((state) => ({
                    boxColors: {
                        ...state.boxColors,
                        styles: {
                            ...state.boxColors.styles,
                            ...styles,
                        },
                    },
                })),
        }),
        {
            name: 'color-storage',
        }
    )
);
