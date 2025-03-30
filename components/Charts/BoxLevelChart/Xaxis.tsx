import { memo, useMemo } from 'react';
import { CHART_CONFIG, ChartDataPoint } from '.';

export const XAxis: React.FC<{
    data: ChartDataPoint[];
    chartWidth: number;
    chartHeight: number;
    hoverInfo: any | null;
    formatTime: (date: Date) => string;
}> = memo(({ data, chartWidth, chartHeight, hoverInfo, formatTime }) => {
    const TICK_HEIGHT = 6;
    const LABEL_PADDING = 5;
    const FONT_SIZE = 12;
    const HOVER_BG_HEIGHT = 15;

    const intervals = useMemo(() => {
        if (data.length === 0) return [];

        const hourMs = 60 * 60 * 1000;
        const firstTime = new Date(data[0].timestamp);
        const startTime = new Date(firstTime).setMinutes(0, 0, 0);
        const endTime = data[data.length - 1].timestamp;
        const result = [];

        for (let time = startTime; time <= endTime; time += hourMs) {
            const closestPoint = data.reduce((prev, curr) => (Math.abs(curr.timestamp - time) < Math.abs(prev.timestamp - time) ? curr : prev));
            result.push(closestPoint);
        }

        // Show fewer labels for better spacing
        const maxPoints = chartWidth < 400 ? 4 : 6;
        if (result.length > maxPoints) {
            const step = Math.ceil(result.length / maxPoints);
            return result.filter((_, i) => i % step === 0);
        }

        return result;
    }, [data, chartWidth]);

    if (data.length === 0) return null;

    // Calculate Y positions for consistent alignment
    const labelY = TICK_HEIGHT + LABEL_PADDING + FONT_SIZE;
    const hoverY = TICK_HEIGHT + LABEL_PADDING;

    return (
        <g className='x-axis'>
            {/* Main axis line */}
            <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke='#777' strokeWidth='1' />

            {/* Time intervals */}
            {intervals.map((point, index) => (
                <g key={`time-${point.timestamp}-${index}`} transform={`translate(${point.scaledX}, ${chartHeight})`}>
                    <line y2={TICK_HEIGHT} stroke='#777' strokeWidth='1' />
                    <text y={labelY} textAnchor='middle' fill='#fff' fontSize={FONT_SIZE} style={{ userSelect: 'none' }}>
                        {formatTime(new Date(point.timestamp))}
                    </text>
                </g>
            ))}

            {/* Hover time indicator */}
            {hoverInfo && (
                <g transform={`translate(${hoverInfo.x}, ${chartHeight})`}>
                    <rect x={-40} y={hoverY} width={80} height={HOVER_BG_HEIGHT} fill={CHART_CONFIG.COLORS.HOVER_BG} rx={4} />
                    <text
                        x={0}
                        y={hoverY + HOVER_BG_HEIGHT / 2 + FONT_SIZE / 3}
                        textAnchor='middle'
                        fill='black'
                        fontSize={FONT_SIZE}
                        fontWeight='bold'
                        style={{ userSelect: 'none' }}>
                        {hoverInfo.time}
                    </text>
                </g>
            )}
        </g>
    );
});
