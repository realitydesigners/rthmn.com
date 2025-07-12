import { createBoxCalculator } from "./boxCalculator";
import { BoxSlice } from "@/types/types";

import { safeISOString } from "./dateUtils";

// Extend BoxSlice type to include progressiveValues
interface ExtendedBoxSlice {
  timestamp: string;
  progressiveValues: {
    high: number;
    low: number;
    value: number;
  }[];
  currentOHLC: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
}

/**
 * Core repositioning logic from auto system - separates negative/positive boxes
 * This is the same proven logic used in boxUpdaterService.ts
 */
export function repositionBoxValues(
  boxes: Array<{ value: number; high: number; low: number }>
): {
  values: number[];
  highs: number[];
  lows: number[];
  fullBoxes: Array<{ value: number; high: number; low: number }>;
} {
  const negativeBoxes = boxes.filter((box) => box.value < 0);
  const positiveBoxes = boxes.filter((box) => box.value > 0);
  const zeroBoxes = boxes.filter((box) => box.value === 0);

  // Sort negatives by value (most negative first: -100, -50, -20, -10)
  negativeBoxes.sort((a, b) => a.value - b.value);

  // Sort positives by value (smallest first: 10, 20, 50, 100)
  positiveBoxes.sort((a, b) => a.value - b.value);

  // Combine: negatives first, then zeros, then positives
  const repositionedBoxes = [...negativeBoxes, ...zeroBoxes, ...positiveBoxes];

  return {
    values: repositionedBoxes.map((box) => box.value),
    highs: repositionedBoxes.map((box) => box.high),
    lows: repositionedBoxes.map((box) => box.low),
    fullBoxes: repositionedBoxes,
  };
}

/**
 * Get repositioned boxes for rendering - same logic as auto system
 */
export function getRepositionedBoxes(
  boxes: Array<{
    value: number;
    high: number;
    low: number;
    isActive?: boolean;
    [key: string]: any;
  }>
): Array<{ value: number; high: number; low: number }> {
  const negativeBoxes: Array<{
    value: number;
    high: number;
    low: number;
  }> = [];
  const positiveBoxes: Array<{
    value: number;
    high: number;
    low: number;
  }> = [];

  boxes.forEach((box) => {
    const cleanBox = {
      value: box.value,
      high: box.high,
      low: box.low,
    };

    if (box.value < 0) {
      negativeBoxes.push(cleanBox);
    } else {
      positiveBoxes.push(cleanBox);
    }
  });

  negativeBoxes.sort((a, b) => a.value - b.value);
  positiveBoxes.sort((a, b) => a.value - b.value);

  return [...negativeBoxes, ...positiveBoxes];
}

/**
 * Get box values in repositioned order for pattern matching
 */
export function getRepositionedBoxValues(
  boxes: Array<{ value: number; [key: string]: any }>
): number[] {
  const negativeValues: number[] = [];
  const positiveValues: number[] = [];

  boxes.forEach((box) => {
    if (box.value < 0) {
      negativeValues.push(box.value);
    } else {
      positiveValues.push(box.value);
    }
  });

  negativeValues.sort((a, b) => a - b);
  positiveValues.sort((a, b) => a - b);

  return [...negativeValues, ...positiveValues];
}

/**
 * Clean floating point precision errors - from auto system
 */
export function cleanBoxPrecision(value: number): number {
  return Math.round(value * 100000000) / 100000000;
}

/**
 * Process and reposition box values using proven auto system logic
 * This ensures consistent ordering across all components
 */
export const processProgressiveBoxValues = (
  boxes: BoxSlice["boxes"]
): BoxSlice["boxes"] => {
  return repositionBoxValues(boxes).fullBoxes;
};

export function processInitialBoxData(
  processedCandles: {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }[],
  pair: string,
  defaultVisibleBoxesCount: number = 7,
  defaultHeight: number = 200,
  initialBarWidth: number = 20
) {
  // Reset previous values at the start of processing

  const boxCalculator = createBoxCalculator(pair.toUpperCase());
  const boxTimeseriesData = processedCandles.map((candle, index) => {
    const candleSlice = processedCandles.slice(0, index + 1).map((c) => ({
      timestamp: safeISOString(c.timestamp),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      mid: {
        o: c.open.toString(),
        h: c.high.toString(),
        l: c.low.toString(),
        c: c.close.toString(),
      },
    }));

    return {
      timestamp: safeISOString(candle.timestamp),
      boxes: boxCalculator.calculateBoxArrays(candleSlice),
      currentOHLC: {
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      },
    };
  });

  // First create base histogram boxes with initial deduplication
  let histogramBoxes: ExtendedBoxSlice[] = [];
  let previousBoxes: any[] = [];

  boxTimeseriesData.forEach((timepoint, index) => {
    // Convert current timepoint boxes to array format
    const currentBoxes = Object.entries(timepoint.boxes).map(
      ([size, data]: [
        string,
        { high: number; low: number; value: number },
      ]) => ({
        high: Number(data.high),
        low: Number(data.low),
        value: data.value,
      })
    );

    // Process boxes and get progressive values
    const progressiveBoxes = processProgressiveBoxValues(currentBoxes);
    const progressiveValues = progressiveBoxes.map((box) => ({
      high: box.high,
      low: box.low,
      value: box.value,
    }));

    // Check if there are any changes from previous frame
    const hasChanges =
      index === 0 ||
      progressiveValues.some((box, i) => {
        const prevBox = previousBoxes[i];
        return (
          !prevBox ||
          prevBox.high !== box.high ||
          prevBox.low !== box.low ||
          prevBox.value !== box.value
        );
      });

    // Always add the first frame and frames with changes
    if (hasChanges) {
      histogramBoxes.push({
        timestamp: timepoint.timestamp,
        progressiveValues,
        currentOHLC: timepoint.currentOHLC,
      });
      previousBoxes = progressiveValues;
    }
  });

  // Process frames to ensure we capture all state changes
  const processedFrames: ExtendedBoxSlice[] = [];

  histogramBoxes.forEach((frame, index) => {
    if (index === 0) {
      processedFrames.push(frame);
      return;
    }

    const prevFrame = processedFrames[processedFrames.length - 1];
    const currentBoxes = frame.progressiveValues;
    const prevBoxes = prevFrame.progressiveValues;

    // Check for any value changes or trend changes
    const hasValueChanges = currentBoxes.some((box, i) => {
      const prevBox = prevBoxes[i];
      return Math.abs(box.value) !== Math.abs(prevBox.value);
    });

    const hasTrendChanges = currentBoxes.some((box, i) => {
      const prevBox = prevBoxes[i];
      return Math.sign(box.value) !== Math.sign(prevBox.value);
    });

    // Always add frames with changes
    if (hasValueChanges || hasTrendChanges) {
      processedFrames.push(frame);
    }
  });

  // Calculate maxSize and prepare initialFramesWithPoints
  const maxSize = processedFrames.reduce((max, slice) => {
    const sliceMax = slice.progressiveValues.reduce(
      (boxMax, box) => Math.max(boxMax, Math.abs(box.value)),
      0
    );
    return Math.max(max, sliceMax);
  }, 0);

  const initialFramesWithPoints = processedFrames.map((slice) => {
    const boxHeight = defaultHeight / defaultVisibleBoxesCount;
    const visibleBoxes = slice.progressiveValues.slice(
      0,
      defaultVisibleBoxesCount
    );
    const positiveBoxesCount = visibleBoxes.filter(
      (box) => box.value > 0
    ).length;
    const negativeBoxesCount = defaultVisibleBoxesCount - positiveBoxesCount;

    const totalNegativeHeight = negativeBoxesCount * boxHeight;
    const meetingPointY =
      totalNegativeHeight +
      (defaultHeight - totalNegativeHeight - positiveBoxesCount * boxHeight) /
        2;

    const smallestBox = visibleBoxes.reduce((smallest, current) =>
      Math.abs(current.value) < Math.abs(smallest.value) ? current : smallest
    );
    const price = smallestBox.value >= 0 ? smallestBox.high : smallestBox.low;
    const high = Math.max(...visibleBoxes.map((box) => box.high));
    const low = Math.min(...visibleBoxes.map((box) => box.low));

    return {
      frameData: {
        boxArray: slice.progressiveValues.map((box) => ({
          high: box.high,
          low: box.low,
          value: box.value,
        })),
        isSelected: false,
        meetingPointY,
        sliceWidth: initialBarWidth,
        price,
        high,
        low,
        progressiveValues: slice.progressiveValues,
      },
      meetingPointY,
      sliceWidth: initialBarWidth,
    };
  });

  return {
    histogramBoxes: processedFrames,
    histogramPreProcessed: {
      maxSize,
      initialFramesWithPoints,
      defaultVisibleBoxesCount,
      defaultHeight,
    },
  };
}
