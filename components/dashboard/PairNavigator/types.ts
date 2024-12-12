import { IconType } from 'react-icons';

export type ViewMode = 'favorites' | 'fx' | 'crypto' | 'all';

export interface GroupedPairs {
  FX: readonly string[];
  CRYPTO: readonly string[];
}

export interface NavigationButtonProps {
  icon: IconType;
  isActive: boolean;
  onClick: () => void;
  label: string;
}

export interface PairItemProps {
  pair: string;
  index: number;
  isActive: boolean;
  isFavorite: boolean;
  currentPrice?: number;
  showRemove: boolean;
  onIndexChange: (index: number) => void;
  onRemove: () => void;
  onCancelRemove: () => void;
  setShowRemoveForPair: (pair: string | null) => void;
  toggleFavorite?: () => void;
  viewMode: ViewMode;
}

export interface PairListProps {
  viewMode: ViewMode;
  currentPairs: string[];
  groupedPairs: GroupedPairs;
  activeIndex: number;
  pairData: Record<string, { currentOHLC?: { close: number } }>;
  selectedPairs: string[];
  showRemoveForPair: string | null;
  handleIndexChange: (index: number) => void;
  togglePair: (pair: string) => void;
  setShowRemoveForPair: (pair: string | null) => void;
}
