import { useLongPress } from '@/hooks/useLongPress';
import {
  LuPlus,
  LuBookmark,
  LuX,
  LuTrash2,
  LuArrowRight
} from 'react-icons/lu';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Extract action buttons into separate components
const ViewButton = ({ pair }: { pair: string }) => (
  <Link
    href={`/pair/${pair}`}
    as={`/pair/${pair}`}
    onClick={(e) => e.stopPropagation()}
    className="-webkit-tap-highlight-color-transparent flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-gray-300 transition-all hover:bg-white/20 hover:text-white"
    style={{ WebkitTapHighlightColor: 'transparent' }}
  >
    <LuArrowRight size={24} />
  </Link>
);

const RemoveActions = ({
  onCancel,
  onRemove
}: {
  onCancel: (e: React.MouseEvent) => void;
  onRemove: (e: React.MouseEvent) => void;
}) => (
  <div className="-webkit-tap-highlight-color-transparent bg-red-500/05 flex h-11 w-11 items-center justify-center rounded-full text-red-400 transition-all hover:bg-red-500/20 hover:text-white">
    {/* <ActionButton onClick={onCancel} icon={<LuX size={22} />} /> */}
    <ActionButton
      onClick={onRemove}
      icon={<LuTrash2 size={24} />}
      variant="danger"
    />
  </div>
);

const AddActions = ({
  onCancel,
  onAdd
}: {
  onCancel: (e: React.MouseEvent) => void;
  onAdd: (e: React.MouseEvent) => void;
}) => (
  <div className="-webkit-tap-highlight-color-transparent bg-emerald-500/05 flex h-11 w-11 items-center justify-center rounded-full text-emerald-400 transition-all hover:bg-emerald-500/20 hover:text-white">
    {/* <ActionButton onClick={onCancel} icon={<LuX size={22} />} /> */}
    <ActionButton
      onClick={onAdd}
      icon={<LuPlus size={24} />}
      variant="success"
    />
  </div>
);

const PairPrice = ({
  price,
  isJPY,
  isActive
}: {
  price: number;
  isJPY: boolean;
  isActive: boolean;
}) => (
  <div
    className={`font-kodemono ml-2 text-sm ${
      isActive ? 'text-white' : 'text-[#222]'
    }`}
  >
    {price.toFixed(isJPY ? 3 : 5)}
  </div>
);

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
  onViewClick,
  onLongPressReset
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
  onLongPressReset: () => void;
}) => {
  const [showAddForPair, setShowAddForPair] = useState(false);

  const { isPressed, handlers } = useLongPress(() => {
    onIndexChange(index);

    if (isFavorite) {
      setShowRemoveForPair(pair);
    } else if (viewMode !== 'favorites') {
      setShowAddForPair(true);
    }
  });

  useEffect(() => {
    setShowAddForPair(false);
  }, [onLongPressReset]);

  const renderActions = () => {
    if (showRemove) {
      return (
        <RemoveActions
          onCancel={(e) => {
            e.stopPropagation();
            onCancelRemove();
          }}
          onRemove={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        />
      );
    }

    if (showAddForPair) {
      return (
        <AddActions
          onCancel={(e) => {
            e.stopPropagation();
            setShowAddForPair(false);
          }}
          onAdd={(e) => {
            e.stopPropagation();
            toggleFavorite();
            setShowAddForPair(false);
          }}
        />
      );
    }

    if (isActive) {
      return <ViewButton pair={pair} />;
    }

    return null;
  };

  return (
    <div
      data-index={index}
      className={`pair-item -webkit-tap-highlight-color-transparent relative shrink-0 cursor-pointer px-2 py-4 transition-all duration-300 select-none ${
        isPressed ? 'scale-[0.98]' : ''
      }`}
      style={{
        scrollSnapAlign: 'center',
        WebkitTapHighlightColor: 'transparent',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        msUserSelect: 'none',
        MozUserSelect: 'none'
      }}
      onClick={() => !showRemove && !showAddForPair && onIndexChange(index)}
      {...handlers}
    >
      <div className="relative z-10 flex flex-col">
        <div className="group flex w-full items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h3
              className={`font-outfit text-2xl font-bold tracking-tight transition-all duration-300 ${
                isActive ? 'scale-105 text-white' : 'scale-90 text-[#222]'
              }`}
            >
              {pair.replace('_', '/')}
            </h3>

            {currentPrice && (
              <PairPrice
                price={currentPrice}
                isJPY={pair.includes('JPY')}
                isActive={isActive}
              />
            )}

            {isFavorite && viewMode !== 'favorites' && (
              <LuBookmark
                size={15}
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
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${variantStyles[variant]}`}
    >
      {icon}
    </button>
  );
};

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
