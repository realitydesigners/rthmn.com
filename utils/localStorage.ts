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
    positive: '#58ffa0',
    negative: '#d61d61',
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
    try {
        const stored = localStorage.getItem(BOX_COLORS_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_BOX_COLORS;
    } catch {
        return DEFAULT_BOX_COLORS;
    }
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

export interface FullPreset extends ColorPreset {
    styles: BoxColors['styles'];
}

export const fullPresets: FullPreset[] = [
    {
        name: 'CYBER.01',
        positive: '#00ffd5',
        negative: '#ff2975',
        styles: {
            borderRadius: 4,
            maxBoxCount: 12,
            shadowIntensity: 0.45,
            opacity: 0.25,
            showBorder: false,
            startIndex: 0,
        },
    },
    {
        name: 'HOLO.02',
        positive: '#85ffbd',
        negative: '#ff3eec',
        styles: {
            borderRadius: 6,
            maxBoxCount: 12,
            shadowIntensity: 0.5,
            opacity: 0.3,
            showBorder: false,
            startIndex: 0,
        },
    },
    {
        name: 'NEO.03',
        positive: '#4deeea',
        negative: '#f000ff',
        styles: {
            borderRadius: 8,
            maxBoxCount: 10,
            shadowIntensity: 0.4,
            opacity: 0.35,
            showBorder: false,
            startIndex: 0,
        },
    },
    {
        name: 'PLSM.04',
        positive: '#7af7ff',
        negative: '#ff34d2',
        styles: {
            borderRadius: 5,
            maxBoxCount: 12,
            shadowIntensity: 0.45,
            opacity: 0.28,
            showBorder: false,
            startIndex: 0,
        },
    },
    {
        name: 'SNTH.05',
        positive: '#00ffcc',
        negative: '#fc0fc0',
        styles: {
            borderRadius: 6,
            maxBoxCount: 12,
            shadowIntensity: 0.4,
            opacity: 0.32,
            showBorder: false,
            startIndex: 0,
        },
    },
    {
        name: 'VPR.06',
        positive: '#00fff0',
        negative: '#ff71ce',
        styles: {
            borderRadius: 7,
            maxBoxCount: 12,
            shadowIntensity: 0.35,
            opacity: 0.3,
            showBorder: false,
            startIndex: 0,
        },
    },
];
