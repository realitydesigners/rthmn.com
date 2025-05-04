import { memo, useMemo } from "react";
import { CHART_CONFIG, type ChartDataPoint } from ".";

export const XAxis: React.FC<{
	data: ChartDataPoint[];
	chartWidth: number;
	chartHeight: number;
	hoverInfo: any | null;
	rightMargin: number;
	formatTime: (date: Date) => string;
}> = memo(
	({ data, chartWidth, chartHeight, hoverInfo, formatTime, rightMargin }) => {
		const TICK_HEIGHT = 4;
		const LABEL_PADDING = 4;
		const FONT_SIZE = 10;
		const HOVER_BG_HEIGHT = 16;
		const GRID_OPACITY = 0.06;

		const intervals = useMemo(() => {
			if (data.length === 0) return [];

			const hourMs = 60 * 60 * 1000;
			const firstTime = new Date(data[0].timestamp);
			const startTime = new Date(firstTime).setMinutes(0, 0, 0);
			const endTime = data[data.length - 1].timestamp;
			const result = [];

			for (let time = startTime; time <= endTime; time += hourMs) {
				const closestPoint = data.reduce((prev, curr) =>
					Math.abs(curr.timestamp - time) < Math.abs(prev.timestamp - time)
						? curr
						: prev,
				);
				result.push(closestPoint);
			}

			// Show more labels for better detail
			const maxPoints = chartWidth < 400 ? 6 : chartWidth < 800 ? 8 : 12;
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

		const adjustedWidth = chartWidth - rightMargin;

		return (
			<g className="x-axis">
				{/* Grid lines */}
				{intervals.map((point) => {
					const adjustedX = (point.scaledX / chartWidth) * adjustedWidth;
					return (
						<line
							key={`grid-${point.timestamp}`}
							x1={adjustedX}
							y1={0}
							x2={adjustedX}
							y2={chartHeight}
							stroke="#ffffff"
							strokeWidth="1"
							strokeOpacity={GRID_OPACITY}
						/>
					);
				})}

				{/* Main axis line */}
				<line
					x1={0}
					y1={chartHeight}
					x2={chartWidth}
					y2={chartHeight}
					stroke="#ffffff"
					strokeWidth="1"
					strokeOpacity={0.1}
				/>

				{/* Time intervals */}
				{intervals.map((point, index) => {
					const date = new Date(point.timestamp);
					const isStartOfDay = date.getHours() === 0;
					const timeLabel = formatTime(date);
					const adjustedX = (point.scaledX / chartWidth) * adjustedWidth;

					return (
						<g
							key={`time-${point.timestamp}-${index}`}
							transform={`translate(${adjustedX}, ${chartHeight})`}
						>
							<line
								y2={TICK_HEIGHT}
								stroke="#ffffff"
								strokeWidth="1"
								strokeOpacity={0.3}
							/>
							<text
								y={labelY}
								textAnchor="middle"
								fill="#ffffff"
								fillOpacity={0.6}
								fontSize={FONT_SIZE}
								fontFamily="monospace"
								style={{ userSelect: "none" }}
							>
								{timeLabel}
							</text>
							{isStartOfDay && (
								<text
									y={labelY + FONT_SIZE + 2}
									textAnchor="middle"
									fill="#ffffff"
									fillOpacity={0.4}
									fontSize={FONT_SIZE - 1}
									fontFamily="monospace"
									style={{ userSelect: "none" }}
								>
									{date.toLocaleDateString(undefined, {
										month: "short",
										day: "numeric",
									})}
								</text>
							)}
						</g>
					);
				})}

				{/* Hover time indicator */}
				{hoverInfo && (
					<g transform={`translate(${hoverInfo.x}, ${chartHeight})`}>
						<rect
							x={-40}
							y={hoverY}
							width={80}
							height={HOVER_BG_HEIGHT}
							fill="#1a1a1a"
							stroke="rgba(255, 255, 255, 0.2)"
							strokeWidth={1}
							rx={4}
						/>
						<text
							x={0}
							y={hoverY + HOVER_BG_HEIGHT / 2 + FONT_SIZE / 3}
							textAnchor="middle"
							fill="#ffffff"
							fontSize={FONT_SIZE}
							fontFamily="monospace"
							fontWeight="medium"
							style={{ userSelect: "none" }}
						>
							{hoverInfo.time}
						</text>
					</g>
				)}
			</g>
		);
	},
);
