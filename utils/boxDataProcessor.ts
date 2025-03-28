import { createBoxCalculator } from './boxCalculator';
import { Box, BoxSlice } from '@/types/types';
import { BoxSizes } from '@/utils/instruments';

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

export const processProgressiveBoxValues = (boxes: BoxSlice['boxes']): BoxSlice['boxes'] => {
    // Sort boxes by absolute value
    const sortedBoxes = [...boxes];

    const findNearestBoxSize = (value: number): number => {
        const absValue = Math.abs(value);
        let nearest = BoxSizes[0];
        let minDiff = Math.abs(absValue - BoxSizes[0]);

        for (const size of BoxSizes) {
            const diff = Math.abs(absValue - size);
            if (diff < minDiff) {
                minDiff = diff;
                nearest = size;
            }
        }
        return value >= 0 ? nearest : -nearest;
    };
    // First add all negative boxes in ascending order (most negative first)
    const negativeBoxes = sortedBoxes
        .filter((box) => box.value < 0)
        .sort((a, b) => a.value - b.value)
        .map((box) => ({
            ...box,
            value: findNearestBoxSize(box.value),
        }));

    // Then add all positive boxes in ascending order (smallest to largest)
    const positiveBoxes = sortedBoxes
        .filter((box) => box.value > 0)
        .sort((a, b) => a.value - b.value)
        .map((box) => ({
            ...box,
            value: findNearestBoxSize(box.value),
        }));

    // Combine the arrays with negatives first, then positives ascending
    return [...negativeBoxes, ...positiveBoxes];
};

export function processInitialBoxData(
    processedCandles: { timestamp: number; open: number; high: number; low: number; close: number }[],
    pair: string,
    defaultVisibleBoxesCount: number = 8,
    defaultHeight: number = 200,
    initialBarWidth: number = 20
) {
    // Reset previous values at the start of processing

    const boxCalculator = createBoxCalculator(pair.toUpperCase());
    const boxTimeseriesData = processedCandles.map((candle, index) => {
        const candleSlice = processedCandles.slice(0, index + 1).map((c) => ({
            timestamp: new Date(c.timestamp).toISOString(),
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
            timestamp: new Date(candle.timestamp).toISOString(),
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
    let histogramBoxes: ExtendedBoxSlice[] = boxTimeseriesData.map((timepoint) => {
        const boxes = Object.entries(timepoint.boxes).map(([size, data]: [string, { high: number; low: number; value: number }]) => ({
            high: Number(data.high),
            low: Number(data.low),
            value: data.value,
        }));

        const progressiveBoxes = processProgressiveBoxValues(boxes);
        // Store the complete box objects in progressiveValues, not just the numeric values
        const progressiveValues = progressiveBoxes.map((box) => ({
            high: box.high,
            low: box.low,
            value: box.value,
        }));

        return {
            timestamp: timepoint.timestamp,
            progressiveValues,
            currentOHLC: timepoint.currentOHLC,
        };
    });

    // Process frames with improved smoothing for sign changes
    const processedFrames: ExtendedBoxSlice[] = [];

    histogramBoxes.forEach((frame, index) => {
        if (index === 0) {
            processedFrames.push(frame);
            return;
        }

        const prevFrame = processedFrames[processedFrames.length - 1];

        // Check for sign changes between frames
        const prevPositives = prevFrame.progressiveValues.filter((box) => box.value > 0).map((box) => Math.abs(box.value));
        const currentNegatives = frame.progressiveValues.filter((box) => box.value < 0).map((box) => Math.abs(box.value));

        const prevNegatives = prevFrame.progressiveValues.filter((box) => box.value < 0).map((box) => Math.abs(box.value));
        const currentPositives = frame.progressiveValues.filter((box) => box.value > 0).map((box) => Math.abs(box.value));

        // Find values that switched signs
        const posToNegFlips = prevPositives.filter((value) => currentNegatives.includes(value));
        const negToPosFlips = prevNegatives.filter((value) => currentPositives.includes(value));

        // Find values that appeared or disappeared
        const allPrevValues = prevFrame.progressiveValues.map((box) => box.value);
        const allCurrentValues = frame.progressiveValues.map((box) => box.value);

        // Values that are in either frame but not both
        const uniqueToPrev = allPrevValues.filter((value) => !allCurrentValues.includes(value));
        const uniqueToCurrent = allCurrentValues.filter((value) => !allPrevValues.includes(value));

        // Define what counts as a "significant change" requiring an intermediate frame
        const hasSignificantChanges = posToNegFlips.length > 0 || negToPosFlips.length > 0 || uniqueToPrev.length > 0 || uniqueToCurrent.length > 0;

        // Also check if any box values have changed by a significant amount
        const hasLargeValueChange = prevFrame.progressiveValues.some((prevBox) => {
            const matchingBox = frame.progressiveValues.find((currBox) => Math.abs(currBox.value) === Math.abs(prevBox.value));
            if (!matchingBox) return false;
            return Math.abs(matchingBox.value - prevBox.value) > 1;
        });

        if (hasSignificantChanges || hasLargeValueChange) {
            // Create intermediate frames for smooth transitions
            const intermediates = createIntermediateFrames(prevFrame, frame);
            if (intermediates.length > 1) {
                // Only add intermediates if there are multiple (first is added, last is current frame)
                processedFrames.push(...intermediates);
            } else {
                // No intermediates generated, just add the current frame
                processedFrames.push(frame);
            }
        } else {
            // No significant changes, just add the frame
            processedFrames.push(frame);
        }
    });

    // Calculate maxSize and prepare initialFramesWithPoints
    const maxSize = processedFrames.reduce((max, slice) => {
        const sliceMax = slice.progressiveValues.reduce((boxMax, box) => Math.max(boxMax, Math.abs(box.value)), 0);
        return Math.max(max, sliceMax);
    }, 0);

    const initialFramesWithPoints = processedFrames.map((slice) => {
        const boxHeight = defaultHeight / defaultVisibleBoxesCount;
        const visibleBoxes = slice.progressiveValues.slice(0, defaultVisibleBoxesCount);
        const positiveBoxesCount = visibleBoxes.filter((box) => box.value > 0).length;
        const negativeBoxesCount = defaultVisibleBoxesCount - positiveBoxesCount;

        const totalNegativeHeight = negativeBoxesCount * boxHeight;
        const meetingPointY = totalNegativeHeight + (defaultHeight - totalNegativeHeight - positiveBoxesCount * boxHeight) / 2;

        const smallestBox = visibleBoxes.reduce((smallest, current) => (Math.abs(current.value) < Math.abs(smallest.value) ? current : smallest));
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
// Helper function to create intermediate frames when values flip sign or change significantly
const createIntermediateFrames = (prevFrame: ExtendedBoxSlice, currentFrame: ExtendedBoxSlice): ExtendedBoxSlice[] => {
    // Find values that flipped from positive to negative
    const prevPositives = prevFrame.progressiveValues.filter((box) => box.value > 0).map((box) => Math.abs(box.value));
    const currentNegatives = currentFrame.progressiveValues.filter((box) => box.value < 0).map((box) => Math.abs(box.value));

    // Find values that flipped from negative to positive
    const prevNegatives = prevFrame.progressiveValues.filter((box) => box.value < 0).map((box) => Math.abs(box.value));
    const currentPositives = currentFrame.progressiveValues.filter((box) => box.value > 0).map((box) => Math.abs(box.value));

    // Get values that flipped from positive to negative
    const posToNegFlips = prevPositives.filter((value) => currentNegatives.includes(value));

    // Get values that flipped from negative to positive
    const negToPosFlips = prevNegatives.filter((value) => currentPositives.includes(value));

    // Check for new values that appeared in the current frame
    const allPrevValues = [...prevPositives, ...prevNegatives].sort((a, b) => a - b);
    const allCurrentValues = [...currentPositives, ...currentNegatives].sort((a, b) => a - b);

    // Values that appeared or disappeared
    const newValues = allCurrentValues.filter((value) => !allPrevValues.includes(value));
    const removedValues = allPrevValues.filter((value) => !allCurrentValues.includes(value));

    // If no changes, return just the current frame
    if (posToNegFlips.length === 0 && negToPosFlips.length === 0 && newValues.length === 0 && removedValues.length === 0) {
        return [currentFrame];
    }

    // Create intermediate frames
    const frames: ExtendedBoxSlice[] = [];
    let currentBoxes = [...prevFrame.progressiveValues];

    // 1. First handle value flips from positive to negative
    if (posToNegFlips.length > 0) {
        posToNegFlips.sort((a, b) => a - b); // Sort smallest to largest

        posToNegFlips.forEach((value) => {
            // Create a new set of boxes with this value flipped
            const newBoxes = currentBoxes.map((box) => {
                if (Math.abs(box.value) === value && box.value > 0) {
                    // Flip from positive to negative
                    return {
                        ...box,
                        value: -box.value,
                        // Use high/low from matching box in current frame
                        high: currentFrame.progressiveValues.find((b) => Math.abs(b.value) === value)?.high || box.high,
                        low: currentFrame.progressiveValues.find((b) => Math.abs(b.value) === value)?.low || box.low,
                    };
                }
                return box;
            });

            // Create a new frame with the updated boxes
            frames.push({
                ...currentFrame,
                progressiveValues: newBoxes,
            });

            // Update the current boxes for the next iteration
            currentBoxes = newBoxes;
        });
    }

    // 2. Then handle flips from negative to positive
    if (negToPosFlips.length > 0) {
        negToPosFlips.sort((a, b) => a - b); // Sort smallest to largest

        negToPosFlips.forEach((value) => {
            // Create a new set of boxes with this value flipped
            const newBoxes = currentBoxes.map((box) => {
                if (Math.abs(box.value) === value && box.value < 0) {
                    // Flip from negative to positive
                    return {
                        ...box,
                        value: Math.abs(box.value),
                        // Use high/low from matching box in current frame
                        high: currentFrame.progressiveValues.find((b) => Math.abs(b.value) === value)?.high || box.high,
                        low: currentFrame.progressiveValues.find((b) => Math.abs(b.value) === value)?.low || box.low,
                    };
                }
                return box;
            });

            // Create a new frame with the updated boxes
            frames.push({
                ...currentFrame,
                progressiveValues: newBoxes,
            });

            // Update the current boxes for the next iteration
            currentBoxes = newBoxes;
        });
    }

    // 3. Handle any dramatic box changes that need intermediate frames
    const finalBoxes = [...currentBoxes];
    const targetBoxes = [...currentFrame.progressiveValues];

    // Create a transition frame to help smooth any remaining differences
    if (newValues.length > 0 || removedValues.length > 0) {
        // Create a merged set that gradually transitions between the current intermediate and final states
        const transitionBoxes = [];

        // Add all boxes from the current state
        for (const box of finalBoxes) {
            transitionBoxes.push(box);
        }

        // Ensure the transition frame has all the target boxes with their correct values
        for (const targetBox of targetBoxes) {
            // If this target box doesn't exist in the current state by value, add it
            const existingBox = transitionBoxes.find((b) => b.value === targetBox.value);
            if (!existingBox) {
                transitionBoxes.push(targetBox);
            }
        }

        // Create a transition frame with the merged boxes
        frames.push({
            ...currentFrame,
            progressiveValues: transitionBoxes,
        });
    }

    return frames;
};
