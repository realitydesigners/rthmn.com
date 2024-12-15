import { useLongPress } from '@/hooks/useLongPress';
import {
  LuPlus,
  LuBookmark,
  LuX,
  LuTrash2,
  LuArrowRight
} from 'react-icons/lu';
import { useState } from 'react';
import Link from 'next/link';

export const PairItem = ({
  pair,
  index,
  isActive,
  isFavorite,
  currentPrice,
  showRemove,
  onIndexChange,
  onRemove,
  onCancelRemove,
  setShowRemoveForPair,
  toggleFavorite,
  viewMode,
  onViewClick
}: {
  pair: string;
  index: number;
  isActive: boolean;
  isFavorite: boolean;
  currentPrice: number;
  showRemove: boolean;
  onIndexChange: (index: number) => void;
  onRemove: () => void;
  onCancelRemove: () => void;
  setShowRemoveForPair: (pair: string) => void;
  toggleFavorite: () => void;
  viewMode: string;
  onViewClick: (pair: string) => void;
}) => {
  const [showAddForPair, setShowAddForPair] = useState(false);

  const { isPressed, handlers } = useLongPress(() => {
    if (isFavorite) {
      setShowRemoveForPair(pair);
    } else if (viewMode !== 'favorites') {
      setShowAddForPair(true);
    }
  });

  const renderActions = () => {
    if (showRemove) {
      return (
        <div className="animate-in fade-in slide-in-from-right flex items-center gap-2 duration-200">
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              onCancelRemove();
            }}
            icon={<LuX size={18} />}
          />
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            icon={<LuTrash2 size={18} />}
            variant="danger"
          />
        </div>
      );
    }

    if (showAddForPair) {
      return (
        <div className="animate-in fade-in slide-in-from-right flex items-center gap-2 duration-200">
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              setShowAddForPair(false);
            }}
            icon={<LuX size={18} />}
          />
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite();
              setShowAddForPair(false);
            }}
            icon={<LuPlus size={18} />}
            variant="success"
          />
        </div>
      );
    }

    if (isActive) {
      return (
        <Link
          href={`/pair/${pair}`}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-300 transition-all hover:bg-white/20 hover:text-white"
        >
          <LuArrowRight size={20} />
        </Link>
      );
    }

    return null;
  };

  return (
    <div
      data-index={index}
      className={`pair-item relative shrink-0 cursor-pointer px-2 py-4 transition-all duration-300 ${
        isPressed ? 'scale-[0.98]' : ''
      }`}
      style={{ scrollSnapAlign: 'center' }}
      onClick={() => !showRemove && !showAddForPair && onIndexChange(index)}
      {...handlers}
    >
      <div className="relative z-10 flex flex-col">
        <div className="group flex w-full items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h3
              className={`font-outfit text-2xl font-bold tracking-tight text-white transition-all duration-300 ${
                isActive ? 'scale-105' : 'scale-90'
              }`}
            >
              {pair.replace('_', '/')}
            </h3>

            {currentPrice && !showRemove && !showAddForPair && (
              <div className="font-kodemono ml-2 text-sm text-gray-200">
                {currentPrice.toFixed(pair.includes('JPY') ? 3 : 5)}
              </div>
            )}
            {isFavorite && viewMode !== 'favorites' && (
              <LuBookmark
                size={12}
                className="ml-1 inline-block text-blue-400/70"
                style={{ transform: 'translateY(-2px)' }}
              />
            )}
          </div>

          <div className="flex items-center gap-3">{renderActions()}</div>
        </div>

        {isActive && !showRemove && !showAddForPair && (
          <PairIndicator type="active" />
        )}
        {showRemove && <PairIndicator type="remove" />}
        {showAddForPair && <PairIndicator type="add" />}
      </div>
    </div>
  );
};

const ActionButton = ({
  onClick,
  icon,
  variant = 'default'
}: {
  onClick: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  variant?: 'default' | 'danger' | 'success';
}) => {
  const variantStyles = {
    default: 'bg-white/10 hover:bg-white/20 text-gray-300',
    danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
    success: 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
  };

  return (
    <button
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${variantStyles[variant]}`}
    >
      {icon}
    </button>
  );
};

const ViewButton = ({
  onClick
}: {
  onClick: (e: React.MouseEvent) => void;
}) => (
  <button
    onClick={onClick}
    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-300 transition-all hover:bg-white/20 hover:text-white"
  >
    <LuArrowRight size={20} />
  </button>
);

const PairIndicator = ({ type }: { type: 'active' | 'remove' | 'add' }) => {
  const styles = {
    active: 'bg-gradient-to-r from-white/20 to-transparent',
    remove: 'animate-pulse bg-gradient-to-r from-red-400/20 to-transparent',
    add: 'animate-pulse bg-gradient-to-r from-green-400/20 to-transparent'
  };

  return (
    <div
      className={`absolute top-1/2 -left-4 h-[2px] w-3 -translate-y-1/2 ${styles[type]}`}
    />
  );
};
