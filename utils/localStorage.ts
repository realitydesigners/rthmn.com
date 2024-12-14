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
    shadowIntensity: number;
    showBorder: boolean;
    opacity: number;
  };
}

const DEFAULT_BOX_COLORS: BoxColors = {
  positive: '#34D399',
  negative: '#F87171',
  styles: {
    borderRadius: 8,
    maxBoxCount: 10,
    shadowIntensity: 0.25,
    showBorder: true,
    opacity: 1
  }
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
