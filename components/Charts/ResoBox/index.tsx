'use client';
import type React from 'react';
import type { Box, BoxSlice } from '@/types/types';
import { useDashboard } from '@/providers/DashboardProvider';

interface BoxComponentProps {
  slice: BoxSlice | null;
  isLoading: boolean;
}

export const ResoBox: React.FC<BoxComponentProps> = ({ slice, isLoading }) => {
  const { boxColors } = useDashboard();

  const renderShiftedBoxes = (boxArray: Box[]) => {
    if (!boxArray?.length) return null;

    const sortedByMagnitude = boxArray.sort(
      (a, b) => Math.abs(b.value) - Math.abs(a.value)
    );

    const maxBoxCount =
      boxColors.styles?.maxBoxCount ?? sortedByMagnitude.length;
    const sortedBoxes = sortedByMagnitude.slice(0, maxBoxCount);

    const maxSize = Math.abs(sortedBoxes[0].value);

    const renderBox = (box: Box, index: number, prevBox: Box | null = null) => {
      const isTransitionPoint =
        prevBox &&
        ((box.value > 0 && prevBox.value < 0) ||
          (box.value < 0 && prevBox.value > 0));

      const size = (Math.abs(box.value) / maxSize) * 250;
      const basePosition = prevBox
        ? isTransitionPoint
          ? prevBox.value > 0
            ? { top: 0, right: 0 }
            : { bottom: 0, right: 0 }
          : box.value > 0
            ? { top: 0, right: 0 }
            : { bottom: 0, right: 0 }
        : { top: 0, right: 0 };

      const getColorRGB = (color: string) => {
        return color.match(/\d+/g)?.slice(0, 3).join(', ') || '0, 0, 0';
      };

      const shadowIntensity = boxColors.styles?.shadowIntensity ?? 0.25;
      const positiveRGB = getColorRGB(boxColors.positive);
      const negativeRGB = getColorRGB(boxColors.negative);

      const baseIntensity = isTransitionPoint
        ? shadowIntensity * 1.5
        : shadowIntensity;

      const dynamicStyles: React.CSSProperties = {
        width: `${size}px`,
        height: `${size}px`,
        ...basePosition,
        margin: '0px',
        position: 'absolute',
        borderRadius: `${boxColors.styles?.borderRadius ?? 8}px`,
        borderColor:
          box.value > 0
            ? `rgba(${positiveRGB}, ${baseIntensity * 0.8})`
            : `rgba(${negativeRGB}, ${baseIntensity * 0.8})`,
        background:
          box.value > 0
            ? `linear-gradient(to bottom right, rgba(${positiveRGB}, ${baseIntensity * 0.6}), rgba(${positiveRGB}, ${baseIntensity * 0.2}))`
            : `linear-gradient(to bottom right, rgba(${negativeRGB}, ${baseIntensity * 0.6}), rgba(${negativeRGB}, ${baseIntensity * 0.2}))`,
        boxShadow:
          box.value > 0
            ? `0 0 0px rgba(${positiveRGB}, ${baseIntensity * 0.1})`
            : `0 0 0px rgba(${negativeRGB}, ${baseIntensity * 0.1})`
      };

      return (
        <div
          key={`${slice?.timestamp}-${index}`}
          className="duration-800 absolute overflow-hidden transition-all ease-out"
          style={dynamicStyles}
        >
          {/* Inner shadow gradient */}
          <div
            style={{
              boxShadow:
                box.value > 0
                  ? `inset 0 0px 12px rgba(${positiveRGB}, ${baseIntensity})`
                  : `inset 0 0px 12px rgba(${negativeRGB}, ${baseIntensity})`,
              borderRadius: `${boxColors.styles?.borderRadius ?? 8}px`
            }}
            className="absolute inset-0 overflow-hidden"
          />

          {/* Highlight effect for transition points */}
          {isTransitionPoint && (
            <div
              style={{
                background:
                  box.value > 0
                    ? `linear-gradient(to bottom right, rgba(${positiveRGB}, ${baseIntensity * 0.7}), transparent)`
                    : `linear-gradient(to bottom right, rgba(${negativeRGB}, ${baseIntensity * 0.75}), transparent)`
              }}
              className="absolute inset-0 overflow-hidden"
            />
          )}

          {index < sortedBoxes.length - 1 &&
            renderBox(sortedBoxes[index + 1], index + 1, box)}
        </div>
      );
    };

    return renderBox(sortedBoxes[0], 0);
  };

  return (
    <div className="relative min-h-[250px] w-[250px] overflow-hidden">
      {(!slice || !slice.boxes || slice.boxes.length === 0) && !isLoading && (
        <div></div>
      )}
      {isLoading && <div></div>}
      {slice?.boxes && slice.boxes.length > 0 && (
        <div className="relative h-full w-full">
          {renderShiftedBoxes(
            slice.boxes.sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
          )}
        </div>
      )}
    </div>
  );
};
