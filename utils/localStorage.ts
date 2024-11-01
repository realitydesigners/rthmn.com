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
}

export const getBoxColors = (): BoxColors => {
  if (typeof window === 'undefined')
    return {
      positive: 'rgba(88, 255, 160, 1)',
      negative: 'rgba(214, 29, 97, 1)'
    };
  const stored = localStorage.getItem(BOX_COLORS_KEY);
  return stored
    ? JSON.parse(stored)
    : {
        positive: 'rgba(88, 255, 160, 1)',
        negative: 'rgba(214, 29, 97, 1)'
      };
};

export const setBoxColors = (colors: BoxColors) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BOX_COLORS_KEY, JSON.stringify(colors));
};
