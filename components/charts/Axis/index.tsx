interface XAxisProps {
	timeData: number[];
	chartWidth: number;
	chartHeight: number;
}

export const XAxis: React.FC<XAxisProps> = ({ timeData, chartWidth, chartHeight }) => {
	const tickCount = 5;
	const ticks = timeData.filter((_, i) => i % Math.floor(timeData.length / tickCount) === 0);

	return (
		<g className="x-axi" transform={`translate(0, ${chartHeight})`}>
			<line x1={0} y1={0} x2={chartWidth} y2={0} stroke="#333" />
			{ticks.map((time, i) => (
				<g key={time} transform={`translate(${(i / (tickCount - 1)) * chartWidth}, 0)`}>
					<line y2={6} stroke="#333" />
					<text
						y={20}
						textAnchor="middle"
						fill="#fff"
						fontSize="12"
					>
						{new Date(time).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</text>
				</g>
			))}
		</g>
	);
};

interface YAxisProps {
	minY: number;
	maxY: number;
	point: number;
	chartHeight: number;
}

export const YAxis: React.FC<YAxisProps> = ({ minY, maxY, point, chartHeight }) => {
	const steps = 5;
	const range = maxY - minY;
	const stepSize = range / steps;

	return (
		<g className="y-axis">
			<line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#333" />
			{Array.from({ length: steps + 1 }, (_, i) => {
				const value = maxY - i * stepSize;
				return (
					<g key={i} transform={`translate(0, ${(i / steps) * chartHeight})`}>
						<line x2={6} stroke="#333" />
						<text
							x={10}
							y={4}
							textAnchor="start"
							fill="#fff"
							fontSize="12"
						>
							{value.toFixed(point < 0.01 ? 5 : 2)}
						</text>
					</g>
				);
			})}
		</g>
	);
};
