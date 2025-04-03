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

// Helper function to safely convert timestamp to ISO string
const safeISOString = (timestamp: number | string): string => {
    try {
        // Ensure consistent timestamp handling between server and client
        // If timestamp is already a number (milliseconds), use it directly
        if (typeof timestamp === 'number') {
            // Use a fixed format instead of toISOString() to avoid timezone issues
            const date = new Date(timestamp);
            return (
                date.getUTCFullYear() +
                '-' +
                String(date.getUTCMonth() + 1).padStart(2, '0') +
                '-' +
                String(date.getUTCDate()).padStart(2, '0') +
                'T' +
                String(date.getUTCHours()).padStart(2, '0') +
                ':' +
                String(date.getUTCMinutes()).padStart(2, '0') +
                ':' +
                String(date.getUTCSeconds()).padStart(2, '0') +
                '.' +
                String(date.getUTCMilliseconds()).padStart(3, '0') +
                'Z'
            );
        }
        // If it's a string, parse it as a date
        const date = new Date(timestamp);
        return (
            date.getUTCFullYear() +
            '-' +
            String(date.getUTCMonth() + 1).padStart(2, '0') +
            '-' +
            String(date.getUTCDate()).padStart(2, '0') +
            'T' +
            String(date.getUTCHours()).padStart(2, '0') +
            ':' +
            String(date.getUTCMinutes()).padStart(2, '0') +
            ':' +
            String(date.getUTCSeconds()).padStart(2, '0') +
            '.' +
            String(date.getUTCMilliseconds()).padStart(3, '0') +
            'Z'
        );
    } catch (e) {
        console.error('Invalid timestamp:', timestamp);
        // Use a fixed timestamp as fallback instead of current time to ensure consistency
        return '2023-01-01T00:00:00.000Z';
    }
};

export const processProgressiveBoxValues = (boxes: BoxSlice['boxes']): BoxSlice['boxes'] => {
    // Sort boxes purely by ASCENDING absolute value to match ResoBox apparent order
    const sortedBoxes = [...boxes].sort((a, b) => Math.abs(a.value) - Math.abs(b.value));

    // Return the boxes sorted by absolute value, WITHOUT snapping
    return sortedBoxes;

    /* Remove value snapping logic:
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

    // Apply size snapping if needed, but maintain the absolute value sort order
    // Note: We map directly over the abs-sorted list now.
    return sortedBoxes.map((box) => ({
        ...box,
        value: findNearestBoxSize(box.value), // Snap value if needed
    }));
    */
};

export function processInitialBoxData(
    processedCandles: { timestamp: number; open: number; high: number; low: number; close: number }[],
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
        const currentBoxes = Object.entries(timepoint.boxes).map(([size, data]: [string, { high: number; low: number; value: number }]) => ({
            high: Number(data.high),
            low: Number(data.low),
            value: data.value,
        }));

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
                return !prevBox || prevBox.high !== box.high || prevBox.low !== box.low || prevBox.value !== box.value;
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
