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

    // Process initial frames with progressive values
    let processedFrames: BoxSlice[] = [];

    boxTimeseriesData.forEach((frame, index) => {
        const boxes = Object.entries(frame.boxes).map(([size, data]: [string, { high: number; low: number; value: number }]) => ({
            high: Number(data.high),
            low: Number(data.low),
            value: data.value,
        }));

        const currentFrame = {
            ...frame,
            boxes: processProgressiveBoxValues(boxes),
            progressiveValues: boxes.map((box) => box.value),
        };

        if (index === 0) {
            processedFrames.push(currentFrame);
        } else {
            // Create intermediate frames when needed
            const intermediateFrames = createIntermediateFrames(processedFrames[processedFrames.length - 1], currentFrame);
            processedFrames.push(...intermediateFrames);
        }
    });

    // Calculate maxSize and prepare initialFramesWithPoints
    const maxSize = processedFrames.reduce((max, slice) => {
        const sliceMax = slice.boxes.reduce((boxMax, box) => Math.max(boxMax, Math.abs(box.value)), 0);
        return Math.max(max, sliceMax);
    }, 0);

    const initialFramesWithPoints = processedFrames.map((slice) => {
        const boxHeight = defaultHeight / defaultVisibleBoxesCount;
        const visibleBoxes = slice.boxes.slice(0, defaultVisibleBoxesCount);
        const positiveBoxesCount = visibleBoxes.filter((box) => box.value > 0).length;
        const negativeBoxesCount = defaultVisibleBoxesCount - positiveBoxesCount;

        const totalNegativeHeight = negativeBoxesCount * boxHeight;
        const meetingPointY = totalNegativeHeight + (defaultHeight - totalNegativeHeight - positiveBoxesCount * boxHeight) / 2;

        return {
            frameData: {
                boxArray: slice.boxes,
                isSelected: false,
                meetingPointY,
                sliceWidth: initialBarWidth,
                price: slice.currentOHLC.close,
                high: slice.currentOHLC.high,
                low: slice.currentOHLC.low,
                progressiveValues: slice.boxes.map((box) => box.value),
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
const createIntermediateFrames = (prevFrame: BoxSlice, currentFrame: BoxSlice): BoxSlice[] => {
    const frames: BoxSlice[] = [];

    // Sort boxes by absolute value
    const prevBoxes = [...prevFrame.boxes].sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
    const currentBoxes = [...currentFrame.boxes].sort((a, b) => Math.abs(a.value) - Math.abs(b.value));

    // Find boxes that flipped from positive to negative or vice versa
    const flippedBoxes = prevBoxes.filter((prevBox) => {
        const matchingCurrentBox = currentBoxes.find(
            (currentBox) => Math.abs(currentBox.value) === Math.abs(prevBox.value) && Math.sign(currentBox.value) !== Math.sign(prevBox.value)
        );
        return matchingCurrentBox !== undefined;
    });

    if (flippedBoxes.length === 0) {
        return [currentFrame];
    }

    // Create intermediate frames for each flip
    let intermediateBoxes = [...prevBoxes];

    flippedBoxes.forEach((flippedBox) => {
        // Create new frame with this box flipped
        const newBoxes = intermediateBoxes.map((box) => {
            if (Math.abs(box.value) === Math.abs(flippedBox.value)) {
                // Flip the sign
                return {
                    ...box,
                    value: -box.value,
                    high: currentBoxes.find((b) => Math.abs(b.value) === Math.abs(box.value))?.high || box.high,
                    low: currentBoxes.find((b) => Math.abs(b.value) === Math.abs(box.value))?.low || box.low,
                };
            }
            return box;
        });

        frames.push({
            ...currentFrame,
            boxes: newBoxes,
        });

        intermediateBoxes = newBoxes;
    });

    // Add the final frame
    frames.push(currentFrame);

    return frames;
};
