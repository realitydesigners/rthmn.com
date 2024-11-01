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
