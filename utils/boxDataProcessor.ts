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

export const processProgressiveBoxValues = (
  boxes: BoxSlice["boxes"]
): BoxSlice["boxes"] => {
  // Implement repositioning logic similar to auto system
  // Separate boxes by sign for better trend analysis
  const negativeBoxes: BoxSlice["boxes"] = [];
  const positiveBoxes: BoxSlice["boxes"] = [];
  const zeroBoxes: BoxSlice["boxes"] = [];

  boxes.forEach((box) => {
    if (box.value < 0) {
      negativeBoxes.push(box);
    } else if (box.value > 0) {
      positiveBoxes.push(box);
    } else {
      zeroBoxes.push(box);
    }
  });

  // Sort negatives by value (most negative first: -100, -50, -20, -10)
  negativeBoxes.sort((a, b) => a.value - b.value);

  // Sort positives by value (smallest first: 10, 20, 50, 100)
  positiveBoxes.sort((a, b) => a.value - b.value);

  // Combine: negatives first, then zeros, then positives
  // This provides clear bearish/bullish separation for better pattern recognition
  const repositionedBoxes = [...negativeBoxes, ...zeroBoxes, ...positiveBoxes];

  return repositionedBoxes;
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

/**
 * Utility function to reposition boxes similar to auto system
 * Separates negative and positive boxes for better trend analysis
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
