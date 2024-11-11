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
  isPointOfChange: boolean;
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
            ? 'bg-gradient-to-br from-[#22c55e40] to-[#22c55e20]' // Softer green gradient
            : 'bg-gradient-to-br from-[#ef444440] to-[#ef444420]'; // Softer red gradient
        }
        return box.value > 0
          ? 'bg-gradient-to-br from-[#22c55e20] to-[#22c55e10]' // Very subtle green
          : 'bg-gradient-to-br from-[#ef444420] to-[#ef444410]'; // Very subtle red
      }
      return box.value > 0
        ? 'bg-gradient-to-br from-white/10 to-white/5'
        : 'bg-gradient-to-br from-white/5 to-transparent';
    };

    const getBorderColor = () => {
      if (colorScheme === 'green-red') {
        if (isFirstDifferent) {
          return box.value > 0
            ? 'border-[#22c55e60]' // Softer borders
            : 'border-[#ef444460]';
        }
        return box.value > 0 ? 'border-[#22c55e30]' : 'border-[#ef444430]';
      }
      return 'border-white/5';
    };

    const getBoxShadow = () => {
      if (colorScheme === 'green-red') {
        if (isFirstDifferent) {
          return box.value > 0
            ? '0 0 15px #22c55e20, inset 0 0 10px #22c55e30' // Softer glow
            : '0 0 15px #ef444420, inset 0 0 10px #ef444430';
        }
        return box.value > 0
          ? '0 0 10px #22c55e15, inset 0 0 5px #22c55e20'
          : '0 0 10px #ef444415, inset 0 0 5px #ef444420';
      }
      return 'none';
    };

    const boxColor = getBoxColor();
    const borderColor = getBorderColor();
    const borderWidth = 'border rounded-lg';
    const size = (Math.abs(box.value) / maxSize) * baseSize;

    let basePosition: PositionStyle = { top: 0, right: 0 };

    if (prevBox) {
      if (isFirstDifferent) {
        // For first different box, maintain previous position
        basePosition =
          prevBox.value > 0 ? { top: 0, right: 0 } : { bottom: 0, right: 0 };
      } else {
        // For other boxes, position based on their own value
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
      ...pauseTransform,
      boxShadow: getBoxShadow()
    };

    return (
      <div
        key={`box-${index}-${box.value}-${demoStep}`}
        className={`absolute ${boxColor} ${borderColor} ${borderWidth} duration-800 transition-all ease-out`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          ...positionStyle,
          margin: '-1px',
          background: isFirstDifferent
            ? box.value > 0
              ? 'radial-gradient(circle at center, #22c55e30, #22c55e10)'
              : 'radial-gradient(circle at center, #ef444430, #ef444410)'
            : undefined
        }}
      >
        {/* Removed backdrop blur and simplified inner effects */}
        {isFirstDifferent && (
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              animation: 'pulse 2s ease-in-out infinite',
              background:
                box.value > 0
                  ? 'radial-gradient(circle at center, #22c55e20, transparent)'
                  : 'radial-gradient(circle at center, #ef444420, transparent)',
              opacity: 0.3
            }}
          />
        )}

        {index < boxes.length - 1 &&
          renderBox(boxes[index + 1], index + 1, box)}
      </div>
    );
  };

  return <div className="relative">{renderBox(boxes[0], 0)}</div>;
};
