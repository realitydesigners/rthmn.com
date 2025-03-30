import { CHART_CONFIG, useInstrumentConfig } from '.';

export const YAxis: React.FC<{
    minY: number;
    maxY: number;
    chartHeight: number;
    chartWidth: number;
    onDrag: (deltaY: number) => void;
    hoverInfo: any | null;
    onYAxisDragStart: () => void;
    onYAxisDragEnd: () => void;
    pair: string;
    lastPrice: number;
    lastPriceY: number;
}> = ({ minY, maxY, chartHeight, chartWidth, onDrag, hoverInfo, onYAxisDragStart, onYAxisDragEnd, pair, lastPrice, lastPriceY }) => {
    const handleMouseDown = (event: React.MouseEvent) => {
        event.stopPropagation();
        onYAxisDragStart();
        const startY = event.clientY;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaY = (e.clientY - startY) / chartHeight;
            onDrag(deltaY);
        };

        const handleMouseUp = () => {
            onYAxisDragEnd();
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const instrumentConfig = useInstrumentConfig(pair);

    // Generate price levels with fixed pip intervals
    const PIP_SIZE = instrumentConfig.point * 10;
    const priceRange = maxY - minY;

    // Calculate a reasonable number of price levels based on chart height
    const MIN_PRICE_SPACING = 30; // Reduced from 40 for more detail
    const maxLevels = Math.floor(chartHeight / MIN_PRICE_SPACING);

    // Calculate pip interval to achieve desired number of levels
    const pipsInRange = priceRange / PIP_SIZE;
    const pipInterval = Math.ceil(pipsInRange / maxLevels / 2) * 2; // Round to nearest 2 pips for finer granularity
    const PRICE_INTERVAL = PIP_SIZE * pipInterval;

    // Calculate price levels centered around the last price
    const numLevelsAboveBelow = Math.floor(maxLevels / 2);
    const centerPrice = lastPrice;
    const startPrice = Math.floor(centerPrice / PRICE_INTERVAL) * PRICE_INTERVAL;

    const levels = [];
    // Add levels below center
    for (let i = 0; i <= numLevelsAboveBelow; i++) {
        const price = startPrice - i * PRICE_INTERVAL;
        const y = chartHeight - ((price - minY) / priceRange) * chartHeight;
        if (y >= 0 && y <= chartHeight && price >= minY && price <= maxY) {
            levels.push({ price, y, digits: instrumentConfig.digits });
        }
    }
    // Add levels above center
    for (let i = 1; i <= numLevelsAboveBelow; i++) {
        const price = startPrice + i * PRICE_INTERVAL;
        const y = chartHeight - ((price - minY) / priceRange) * chartHeight;
        if (y >= 0 && y <= chartHeight && price >= minY && price <= maxY) {
            levels.push({ price, y, digits: instrumentConfig.digits });
        }
    }

    // Sort levels by price
    levels.sort((a, b) => a.price - b.price);

    const LABEL_WIDTH = 48;
    const FONT_SIZE = 10; // Reduced from default
    const GRID_OPACITY = 0.06;

    return (
        <g className='y-axis' transform={`translate(${chartWidth}, 0)`} onMouseDown={handleMouseDown}>
            {/* Background for price labels */}
            <rect x={0} y={0} width={LABEL_WIDTH} height={chartHeight} fill='transparent' cursor='ns-resize' />

            {/* Grid lines */}
            {levels.map(({ y }) => (
                <line key={`grid-${y}`} x1={-chartWidth} y1={y} x2={0} y2={y} stroke='#ffffff' strokeWidth='1' strokeOpacity={GRID_OPACITY} />
            ))}

            {/* Vertical axis line */}
            <line x1={0} y1={0} x2={0} y2={chartHeight} stroke='#ffffff' strokeWidth={1} strokeOpacity={0.1} />

            {/* Last price line and label */}
            <g>
                <line x1={-chartWidth} y1={lastPriceY} x2={0} y2={lastPriceY} stroke='#ffffff' strokeWidth='1' strokeOpacity={0.3} strokeDasharray='2 2' />
                <rect x={3} y={lastPriceY - 9} width={LABEL_WIDTH - 4} height={18} fill='#1a1a1a' stroke='rgba(255, 255, 255, 0.2)' strokeWidth={1} rx={4} />
                <text x={LABEL_WIDTH / 2 + 1} y={lastPriceY + 3} textAnchor='middle' fill='#ffffff' fontSize={FONT_SIZE} fontFamily='monospace' fontWeight='medium'>
                    {lastPrice.toFixed(instrumentConfig.digits)}
                </text>
            </g>

            {/* Price levels */}
            {levels.map(({ price, y, digits }) => (
                <g key={price}>
                    <line x1={0} x2={4} y1={y} y2={y} stroke='#ffffff' strokeOpacity={0.3} />
                    <text x={8} y={y + 3} fill='#ffffff' fillOpacity={0.6} fontSize={FONT_SIZE} fontFamily='monospace' textAnchor='start'>
                        {price.toFixed(digits)}
                    </text>
                </g>
            ))}

            {/* Hover price indicator */}
            {hoverInfo && (
                <g transform={`translate(0, ${hoverInfo.y})`}>
                    <rect x={3} y={-9} width={LABEL_WIDTH - 4} height={18} fill='#1a1a1a' stroke='rgba(255, 255, 255, 0.2)' strokeWidth={1} rx={4} />
                    <text x={LABEL_WIDTH / 2 + 1} y={3} textAnchor='middle' fill='#ffffff' fontSize={FONT_SIZE} fontFamily='monospace' fontWeight='medium'>
                        {hoverInfo.price.toFixed(instrumentConfig.digits)}
                    </text>
                </g>
            )}
        </g>
    );
};
