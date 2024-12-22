// Constants
export const TIMEFRAMES = ['1m', '5m', '15m', '1H', '2H', '4H', '12H', 'D'] as const;
export const SEGMENT_WIDTH = 38 / 9; // Width of each timeframe segment

export interface TimeframeRange {
    start: string;
    end: string;
}

/**
 * Converts start and end indices to timeframe range
 * Used by both PatternVisualizer and PairResoBox to ensure consistent timeframe display
 */
export const getTimeframeRange = (start: number, end: number): TimeframeRange => {
    // Calculate which segments we're in
    const startSegment = Math.floor(start / SEGMENT_WIDTH);
    const endSegment = Math.floor(end / SEGMENT_WIDTH);

    return {
        start: TIMEFRAMES[Math.min(startSegment, TIMEFRAMES.length - 1)] || 'D',
        end: TIMEFRAMES[Math.min(endSegment, TIMEFRAMES.length - 1)] || 'D',
    };
};
