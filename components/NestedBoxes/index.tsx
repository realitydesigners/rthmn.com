import type { Box } from '@/types';
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
    const getBoxColor = () => {
      if (colorScheme === 'green-red') {
        return box.value > 0 ? 'bg-green-900/50' : 'bg-red-900/50';
      }
      return box.value > 0
        ? 'bg-gradient-to-br from-white/10 to-white/5'
        : 'bg-gradient-to-br from-white/5 to-transparent';
    };

    const getBorderColor = () => {
      if (colorScheme === 'green-red') {
        return isPointOfChange && box.value > 0
          ? 'border-green-500'
          : 'border-black';
      }
      return isPointOfChange && box.value > 0
        ? 'border-white/20'
        : 'border-white/5';
    };

    const boxColor = getBoxColor();
    const borderColor = getBorderColor();
    const borderWidth = 'border rounded-lg';
    const size = (Math.abs(box.value) / maxSize) * baseSize;

    // Determine if this is the first box with a different direction
    const isFirstDifferent =
      prevBox &&
      ((prevBox.value > 0 && box.value < 0) ||
        (prevBox.value < 0 && box.value > 0));

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
            translateX(${index * 4}px)
            translateY(${index * 3}px)
          `,
          transition: 'all 0.8s cubic-bezier(0.8, 0, 0.2, 1)'
        }
      : {};

    const positionStyle: CSSProperties = {
      ...basePosition,
      ...pauseTransform
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
          boxShadow: isPaused
            ? `${index * 2}px ${index * 2}px ${index * 3}px rgba(0,0,0,0.2)`
            : 'none'
        }}
      >
        {index < boxes.length - 1 &&
          renderBox(boxes[index + 1], index + 1, box)}
      </div>
    );
  };

  return <div className="relative">{renderBox(boxes[0], 0)}</div>;
};
