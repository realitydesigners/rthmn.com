const SELECTED_PAIRS_KEY = 'selectedPairs';

export const getSelectedPairs = (): string[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(SELECTED_PAIRS_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const setSelectedPairs = (pairs: string[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SELECTED_PAIRS_KEY, JSON.stringify(pairs));
};

const BOX_COLORS_KEY = 'boxColors';

export interface BoxColors {
    positive: string;
    negative: string;
    styles?: {
        borderRadius: number;
        maxBoxCount: number;
        startIndex: number;
        shadowIntensity: number;
        showBorder: boolean;
        opacity: number;
    };
}

export const DEFAULT_PAIRS = ['GBPUSD', 'USDJPY', 'AUDUSD', 'EURUSD', 'GBPUSD', 'USDCAD'];

export const DEFAULT_BOX_COLORS: BoxColors = {
    positive: '#ffffff',
    negative: '#ff1414',
    styles: {
        borderRadius: 6,
        maxBoxCount: 12,
        shadowIntensity: 0.35,
        opacity: 0.31,
        showBorder: false,
        startIndex: 0,
    },
};

export const getBoxColors = (): BoxColors => {
    if (typeof window === 'undefined') return DEFAULT_BOX_COLORS;
    const stored = localStorage.getItem(BOX_COLORS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_BOX_COLORS;
};

export const setBoxColors = (colors: BoxColors) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(BOX_COLORS_KEY, JSON.stringify(colors));
};

export interface ColorPreset {
    name: string;
    positive: string;
    negative: string;
}

export const colorPresets: ColorPreset[] = [
    {
        name: 'RTHMN',
        positive: '#58ffa0',
        negative: '#d61d61',
    },
    {
        name: 'Classic',
        positive: '#ffffff',
        negative: '#ff1414',
    },
    {
        name: 'Ocean',
        positive: '#00ced1',
        negative: '#191970',
    },
    {
        name: 'Forest',
        positive: '#228b22',
        negative: '#8b4513',
    },
    {
        name: 'Sunset',
        positive: '#ff8c00',
        negative: '#8a2be2',
    },
    {
        name: 'Neon',
        positive: '#00ffff',
        negative: '#ff00ff',
    },
    {
        name: 'Monochrome',
        positive: '#ffffff',
        negative: '#404040',
    },
    {
        name: 'Fire',
        positive: '#ffa500',
        negative: '#b22222',
    },
    {
        name: 'Arctic',
        positive: '#87ceeb',
        negative: '#191970',
    },
    {
        name: 'Matrix',
        positive: '#00ff00',
        negative: '#006400',
    },
];
