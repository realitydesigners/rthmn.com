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
    const PIP_SIZE = instrumentConfig.point * 10; // Adjust for actual pip size (point is usually 0.00001, pip is 0.0001)
    const priceRange = maxY - minY;

    // Calculate a reasonable number of price levels based on chart height
    const MIN_PRICE_SPACING = 40; // Increased from 30 for better readability
    const maxLevels = Math.floor(chartHeight / MIN_PRICE_SPACING);

    // Calculate pip interval to achieve desired number of levels
    const pipsInRange = priceRange / PIP_SIZE;
    const pipInterval = Math.ceil(pipsInRange / maxLevels / 5) * 5; // Round to nearest 5 pips
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

    return (
        <g className='y-axis' transform={`translate(${chartWidth}, 0)`} onMouseDown={handleMouseDown}>
            {/* Background for price labels */}
            <rect x={0} y={0} width={CHART_CONFIG.Y_AXIS.LABEL_WIDTH} height={chartHeight} fill='transparent' cursor='ns-resize' />

            {/* Vertical axis line */}
            <line x1={0} y1={0} x2={0} y2={chartHeight} stroke={CHART_CONFIG.COLORS.AXIS} strokeWidth={1} />

            {/* Last price line and label */}
            <g>
                <line x1={-chartWidth} y1={lastPriceY} x2={0} y2={lastPriceY} stroke='white' strokeWidth='1.5' strokeDasharray='2 2' />
                <rect x={3} y={lastPriceY - 10} width={CHART_CONFIG.Y_AXIS.LABEL_WIDTH} height={20} fill='black' rx={4} />
                <text x={33} y={lastPriceY + 4} textAnchor='middle' fill='white' fontSize='12' fontWeight='bold'>
                    {lastPrice.toFixed(instrumentConfig.digits)}
                </text>
            </g>

            {/* Price levels and grid lines */}
            {levels.map(({ price, y, digits }) => (
                <g key={price}>
                    <line x1={-chartWidth} y1={y} x2={0} y2={y} stroke={CHART_CONFIG.COLORS.AXIS} strokeOpacity={0.1} strokeWidth={1} />
                    <line x1={0} x2={5} y1={y} y2={y} stroke={CHART_CONFIG.COLORS.AXIS} />
                    <text x={10} y={y + 4} fill='white' fontSize='12' textAnchor='start'>
                        {price.toFixed(digits)}
                    </text>
                </g>
            ))}

            {/* Hover price indicator */}
            {hoverInfo && (
                <g transform={`translate(0, ${hoverInfo.y})`}>
                    <rect x={3} y={-10} width={CHART_CONFIG.Y_AXIS.LABEL_WIDTH} height={20} fill={CHART_CONFIG.COLORS.HOVER_BG} rx={4} />
                    <text x={33} y={4} textAnchor='middle' fill='black' fontSize='12' fontWeight='bold'>
                        {hoverInfo.price.toFixed(instrumentConfig.digits)}
                    </text>
                </g>
            )}
        </g>
    );
};
