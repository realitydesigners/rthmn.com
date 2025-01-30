const SELECTED_PAIRS_KEY = 'selectedPairs';
const SIDEBAR_LOCKS_KEY = 'sidebarLocks';
const SIDEBAR_STATE_KEY = 'sidebarState';

export interface SidebarLocks {
    left: boolean;
    right: boolean;
}

export interface SidebarState {
    left: {
        isOpen: boolean;
        activePanel?: string;
        locked: boolean;
    };
    right: {
        isOpen: boolean;
        activePanel?: string;
        locked: boolean;
    };
}

export const DEFAULT_SIDEBAR_LOCKS: SidebarLocks = {
    left: false,
    right: false,
};

export const DEFAULT_SIDEBAR_STATE: SidebarState = {
    left: {
        isOpen: false,
        activePanel: undefined,
        locked: false,
    },
    right: {
        isOpen: false,
        activePanel: undefined,
        locked: false,
    },
};

export const getSidebarState = (): SidebarState => {
    if (typeof window === 'undefined') return DEFAULT_SIDEBAR_STATE;
    try {
        const stored = localStorage.getItem(SIDEBAR_STATE_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_SIDEBAR_STATE;
    } catch {
        return DEFAULT_SIDEBAR_STATE;
    }
};

export const setSidebarState = (state: SidebarState) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(state));
};

export const getSidebarLocks = (): SidebarLocks => {
    if (typeof window === 'undefined') return DEFAULT_SIDEBAR_LOCKS;
    try {
        const stored = localStorage.getItem(SIDEBAR_LOCKS_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_SIDEBAR_LOCKS;
    } catch {
        return DEFAULT_SIDEBAR_LOCKS;
    }
};

export const setSidebarLocks = (locks: SidebarLocks) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SIDEBAR_LOCKS_KEY, JSON.stringify(locks));
};

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
        startIndex: number;
        maxBoxCount: number;
        borderRadius: number;
        shadowIntensity: number;
        opacity: number;
        showBorder: boolean;
        globalTimeframeControl: boolean;
        showLineChart: boolean;
        perspective?: boolean;
        viewMode?: 'default' | 'perspective' | 'centered';
    };
}

export const DEFAULT_BOX_COLORS: BoxColors = {
    positive: '#00ffd5', // Cyan
    negative: '#ff2975', // Hot pink
    styles: {
        startIndex: 0,
        maxBoxCount: 12,
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

export interface FullPreset extends ColorPreset {
    styles: BoxColors['styles'];
}

export const fullPresets: FullPreset[] = [
    {
        name: 'CYBER.01',
        positive: '#00ffd5', // Cyan
        negative: '#ff2975', // Hot pink
        styles: {
            borderRadius: 4,
            maxBoxCount: 12,
            startIndex: 0,
            shadowIntensity: 0.1,
            opacity: 0.2,
            showBorder: true,
            globalTimeframeControl: true,
            showLineChart: false,
        },
    },
    {
        name: 'HOLO.02',
        positive: '#39ff14', // Matrix green
        negative: '#b91dff', // Electric purple
        styles: {
            borderRadius: 6,
            maxBoxCount: 12,
            startIndex: 0,
            shadowIntensity: 0.1,
            opacity: 0.2,
            showBorder: true,
            globalTimeframeControl: true,
            showLineChart: false,
        },
    },
    {
        name: 'VOID.03',
        positive: '#e6e6ff', // Soft white
        negative: '#6600cc', // Deep purple
        styles: {
            borderRadius: 8,
            maxBoxCount: 12,
            startIndex: 0,
            shadowIntensity: 0.1,
            opacity: 0.2,
            showBorder: true,
            globalTimeframeControl: true,
            showLineChart: false,
        },
    },
    {
        name: 'PLSM.04',
        positive: '#ff9933', // Orange
        negative: '#6600ff', // Royal purple
        styles: {
            borderRadius: 5,
            maxBoxCount: 12,
            startIndex: 0,
            shadowIntensity: 0.1,
            opacity: 0.2,
            showBorder: true,
            globalTimeframeControl: true,
            showLineChart: false,
        },
    },
    {
        name: 'CRYO.05',
        positive: '#ffffff', // Pure white
        negative: '#0066ff', // Bright blue
        styles: {
            borderRadius: 6,
            maxBoxCount: 12,
            startIndex: 0,
            shadowIntensity: 0.1,
            opacity: 0.2,
            showBorder: true,
            globalTimeframeControl: true,
            showLineChart: false,
        },
    },
    {
        name: 'PRPL.06',
        positive: '#b3b3ff', // Light purple
        negative: '#4d0099', // Deep purple
        styles: {
            borderRadius: 7,
            maxBoxCount: 12,
            startIndex: 0,
            shadowIntensity: 0.1,
            opacity: 0.2,
            showBorder: true,
            globalTimeframeControl: true,
            showLineChart: false,
        },
    },
    {
        name: 'FLUX.07',
        positive: '#1aff1a', // Bright green
        negative: '#ff1a1a', // Bright red
        styles: {
            borderRadius: 6,
            maxBoxCount: 12,
            startIndex: 0,
            shadowIntensity: 0.1,
            opacity: 0.2,
            showBorder: true,
            globalTimeframeControl: true,
            showLineChart: false,
        },
    },
    {
        name: 'FRST.08',
        positive: '#e6ffff', // Ice white
        negative: '#0099ff', // Sky blue
        styles: {
            borderRadius: 5,
            maxBoxCount: 12,
            startIndex: 0,
            shadowIntensity: 0.1,
            opacity: 0.2,
            showBorder: true,
            globalTimeframeControl: true,
            showLineChart: false,
        },
    },
    {
        name: 'ZERO.09',
        positive: '#ffffff', // Pure white
        negative: '#ff0000', // Pure red
        styles: {
            borderRadius: 4,
            maxBoxCount: 12,
            startIndex: 0,
            shadowIntensity: 0.1,
            opacity: 0.2,
            showBorder: true,
            globalTimeframeControl: true,
            showLineChart: false,
        },
    },
];
