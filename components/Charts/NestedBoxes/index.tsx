import type { Box } from '@/types/types';
import type { CSSProperties } from 'react';

interface PositionStyle {
  top?: number;
  bottom?: number;
  right: number;
}

interface NestedBoxesProps {
  boxes: Box[];
  demoStep: number;
  isPaused: boolean;
  isPointOfChange?: boolean;
  maxSize?: number;
  baseSize?: number;
  colorScheme?: 'green-red' | 'white-gradient';
}

export const NestedBoxes = ({
  boxes,
  demoStep,
  isPaused,
  isPointOfChange,
  maxSize: providedMaxSize,
  baseSize = 400,
  colorScheme = 'white-gradient'
}: NestedBoxesProps) => {
  if (!boxes || boxes.length === 0) return null;

  const maxSize = providedMaxSize || Math.abs(boxes[0].value);

  const renderBox = (box: Box, index: number, prevBox: Box | null = null) => {
    const isFirstDifferent =
      prevBox &&
      ((prevBox.value > 0 && box.value < 0) ||
        (prevBox.value < 0 && box.value > 0));

    const getBoxColor = () => {
      if (colorScheme === 'green-red') {
        if (isFirstDifferent) {
          return box.value > 0
            ? 'bg-gradient-to-br from-emerald-500/25 to-emerald-500/5 shadow-[inset_0_2px_15px_rgba(16,185,129,0.2)]'
            : 'bg-gradient-to-br from-red-500/25 to-red-500/5 shadow-[inset_0_2px_15px_rgba(239,68,68,0.2)]';
        }
        return box.value > 0
          ? 'bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 shadow-[inset_0_2px_10px_rgba(16,185,129,0.15)]'
          : 'bg-gradient-to-br from-red-500/15 to-red-500/5 shadow-[inset_0_2px_10px_rgba(239,68,68,0.15)]';
      }
      return box.value > 0
        ? 'bg-gradient-to-br from-white/20 to-white/10'
        : 'bg-gradient-to-br from-white/10 to-transparent';
    };

    const getBorderColor = () => {
      if (colorScheme === 'green-red') {
        if (isFirstDifferent) {
          return box.value > 0
            ? 'border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
            : 'border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
        }
        return box.value > 0
          ? 'border-emerald-500/20 shadow-[0_0_7px_rgba(16,185,129,0.15)]'
          : 'border-red-500/20 shadow-[0_0_7px_rgba(239,68,68,0.15)]';
      }
      return 'border-white/10';
    };

    const borderWidth = 'border rounded-lg';
    const size = (Math.abs(box.value) / maxSize) * baseSize;

    let basePosition: PositionStyle = { top: 0, right: 0 };

    if (prevBox) {
      if (isFirstDifferent) {
        basePosition =
          prevBox.value > 0 ? { top: 0, right: 0 } : { bottom: 0, right: 0 };
      } else {
        basePosition =
          box.value > 0 ? { top: 0, right: 0 } : { bottom: 0, right: 0 };
      }
    }

    const pauseTransform = isPaused
      ? {
          transform: `
            translateX(${index * 3}px)
            translateY(${index * 2}px)
          `,
          transition: 'all 0.8s cubic-bezier(0.8, 0, 0.2, 1)'
        }
      : {};

    const positionStyle: CSSProperties = {
      ...basePosition,
      ...pauseTransform
    };

    const boxColor = getBoxColor();
    const borderColor = getBorderColor();

    return (
      <div
        key={`box-${index}-${box.value}-${demoStep}`}
        className={`absolute ${boxColor} ${borderColor} ${borderWidth} duration-800 transition-all ease-out`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          ...positionStyle,
          margin: '-1px'
        }}
      >
        <div
          className={`absolute inset-0 rounded-lg ${
            box.value > 0
              ? 'shadow-[inset_0_4px_20px_rgba(16,185,129,0.2)]'
              : 'shadow-[inset_0_4px_20px_rgba(239,68,68,0.2)]'
          }`}
        />

        <div
          className={`absolute -inset-[1px] rounded-lg opacity-40 ${
            box.value > 0
              ? 'bg-gradient-to-br from-emerald-500/20 to-transparent'
              : 'bg-gradient-to-br from-red-500/20 to-transparent'
          }`}
        />

        {isFirstDifferent && (
          <div
            className={`absolute inset-0 rounded-lg ${
              box.value > 0
                ? 'bg-gradient-to-br from-emerald-500/20 to-transparent shadow-[inset_0_4px_25px_rgba(16,185,129,0.2)]'
                : 'bg-gradient-to-br from-red-500/20 to-transparent shadow-[inset_0_4px_25px_rgba(239,68,68,0.2)]'
            }`}
            style={{
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
        )}

        <div
          className={`absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent opacity-20 ${
            box.value > 0
              ? 'shadow-[inset_0_8px_30px_rgba(16,185,129,0.1)]'
              : 'shadow-[inset_0_8px_30px_rgba(239,68,68,0.1)]'
          }`}
        />

        {index < boxes.length - 1 &&
          renderBox(boxes[index + 1], index + 1, box)}
      </div>
    );
  };

  return <div className="relative">{renderBox(boxes[0], 0)}</div>;
};
