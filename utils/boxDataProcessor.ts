import { createBoxCalculator } from './boxCalculator';
import { Box, BoxSlice } from '@/types/types';
import { BoxSizes } from '@/utils/instruments';

// Create a Set of valid box sizes for quick lookup
const validBoxSizes = new Set(BoxSizes);
// Helper function to find the nearest valid box size
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

// Extend BoxSlice type to include progressiveValues
interface ExtendedBoxSlice extends Omit<BoxSlice, 'currentOHLC'> {
    currentOHLC: {
        open: number;
        high: number;
        low: number;
        close: number;
    };
    progressiveValues: number[];
}

export interface ProcessedBoxData {
    histogramBoxes: ExtendedBoxSlice[];
    histogramPreProcessed: {
        maxSize: number;
        initialFramesWithPoints: {
            frameData: {
                boxArray: Box[];
                isSelected: boolean;
                meetingPointY: number;
                sliceWidth: number;
                price: number;
                high: number;
                low: number;
                progressiveValues: number[];
            };
            meetingPointY: number;
            sliceWidth: number;
        }[];
        defaultVisibleBoxesCount: number;
        defaultHeight: number;
    };
}

// Track the previous frame's values for comparison
let previousFrameValues: number[] = [];

export const processProgressiveBoxValues = (boxes: BoxSlice['boxes']): BoxSlice['boxes'] => {
    // Sort boxes by absolute value
    const sortedBoxes = [...boxes];

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
): ProcessedBoxData {
    // Reset previous values at the start of processing
    previousFrameValues = [];

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
    let histogramBoxes = boxTimeseriesData.map((timepoint) => {
        const boxes = Object.entries(timepoint.boxes).map(([size, data]: [string, { high: number; low: number; value: number }]) => ({
            high: Number(data.high),
            low: Number(data.low),
            value: data.value,
        }));

        const progressiveBoxes = processProgressiveBoxValues(boxes);
        const progressiveValues = Array.from(progressiveBoxes.map((box) => box.value));

        return {
            timestamp: timepoint.timestamp,
            boxes: progressiveBoxes,
            currentOHLC: timepoint.currentOHLC,
            progressiveValues,
        };
    });

    // Improved deduplication that focuses on meaningful changes
    histogramBoxes = histogramBoxes.filter((frame, index) => {
        if (index === 0) return true; // Always keep first frame

        const prevFrame = histogramBoxes[index - 1];

        // Find the smallest absolute value from both frames
        const getCurrentSmallestValue = (boxes: Box[]) => {
            return boxes.reduce((smallest, box) => (Math.abs(box.value) < Math.abs(smallest.value) ? box : smallest));
        };

        const prevSmallest = getCurrentSmallestValue(prevFrame.boxes);
        const currentSmallest = getCurrentSmallestValue(frame.boxes);

        // If the smallest values are different, this is a significant change
        if (prevSmallest.value !== currentSmallest.value) {
            return true;
        }

        // If we get here, check if ANY box has changed
        // This catches cases where larger boxes change while smaller ones remain the same
        return frame.boxes.some((box, boxIndex) => box.value !== prevFrame.boxes[boxIndex].value);
    });

    // Process frames with improved smoothing and deduplication
    const processedFrames: ExtendedBoxSlice[] = [];
    let lastFrame: ExtendedBoxSlice | null = null;

    for (const frame of histogramBoxes) {
        if (!lastFrame) {
            processedFrames.push(frame);
            lastFrame = frame;
            continue;
        }

        // Check if box values have changed
        const valueChanges = frame.boxes
            .map((box, index) => ({
                boxIndex: index,
                prevValue: lastFrame!.boxes[index].value,
                newValue: box.value,
                difference: box.value - lastFrame!.boxes[index].value,
            }))
            .filter((change) => change.difference !== 0);

        if (valueChanges.length === 0) continue;

        // Add the frame if it represents a meaningful change
        const lastProcessedFrame = processedFrames[processedFrames.length - 1];

        // Get smallest box from both frames
        const getCurrentSmallestValue = (boxes: Box[]) => {
            return boxes.reduce((smallest, box) => (Math.abs(box.value) < Math.abs(smallest.value) ? box : smallest));
        };

        const lastSmallest = getCurrentSmallestValue(lastProcessedFrame.boxes);
        const currentSmallest = getCurrentSmallestValue(frame.boxes);

        // Only add frame if smallest value changed or there's another significant change
        const hasSignificantChange =
            lastSmallest.value !== currentSmallest.value ||
            frame.boxes.some((box, i) => Math.abs(box.value - lastProcessedFrame.boxes[i].value) >= 1 && validBoxSizes.has(Math.abs(box.value)));

        if (hasSignificantChange) {
            // Ensure all box values are valid before adding
            const validatedFrame = {
                ...frame,
                boxes: frame.boxes.map((box) => ({
                    ...box,
                    value: findNearestBoxSize(box.value),
                })),
            };
            processedFrames.push(validatedFrame);
            lastFrame = validatedFrame;
        }
    }

    // Final deduplication pass focusing on smallest value changes
    const finalFrames = processedFrames.filter((frame, index) => {
        if (index === 0) return true;
        const prevFrame = processedFrames[index - 1];

        // Get smallest box from both frames
        const getCurrentSmallestValue = (boxes: Box[]) => {
            return boxes.reduce((smallest, box) => (Math.abs(box.value) < Math.abs(smallest.value) ? box : smallest));
        };

        const prevSmallest = getCurrentSmallestValue(prevFrame.boxes);
        const currentSmallest = getCurrentSmallestValue(frame.boxes);

        // Keep frame if smallest value changed
        if (prevSmallest.value !== currentSmallest.value) {
            return true;
        }

        // Or if any other value had a significant change
        return frame.boxes.some((box, boxIndex) => Math.abs(box.value - prevFrame.boxes[boxIndex].value) >= 1);
    });

    // Use final frames for the rest
    histogramBoxes = finalFrames;

    const maxSize = histogramBoxes.reduce((max, slice) => {
        const sliceMax = slice.boxes.reduce((boxMax, box) => Math.max(boxMax, Math.abs(box.value)), 0);
        return Math.max(max, sliceMax);
    }, 0);

    const initialFramesWithPoints = histogramBoxes.map((slice, index) => {
        const isSelected = false;
        const boxHeight = defaultHeight / defaultVisibleBoxesCount;
        const visibleBoxes = slice.boxes.slice(0, defaultVisibleBoxesCount);
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
                boxArray: slice.boxes,
                isSelected,
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
        histogramBoxes,
        histogramPreProcessed: {
            maxSize,
            initialFramesWithPoints,
            defaultVisibleBoxesCount,
            defaultHeight,
        },
    };
}
