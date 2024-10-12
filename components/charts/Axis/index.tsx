interface XAxisProps {
	timeData: number[];
}

export const XAxis: React.FC<XAxisProps> = ({ timeData }) => {
	return (
		<div className="w-full z-[10] absolute flex bg-[#0a0a0a] bottom-0 py-2 border-t-[#222] border-t justify-between text-white">
			{timeData.slice(-5).map((time) => (
				<div key={time} className="text-xs text-white">
					{new Date(time).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</div>
			))}
		</div>
	);
};

interface YAxisProps {
	minY: number;
	maxY: number;
	point: number;
}

export const YAxis: React.FC<YAxisProps> = ({ minY, maxY, point }) => {
	const steps = 10;
	const range = maxY - minY;
	const stepSize = range / steps;

	const yAxisLabels = Array.from({ length: steps + 1 }, (_, i) => minY + i * stepSize);

	return (
		<div className="absolute right-0 top-0 bottom-0 z-[100] bg-[#0a0a0a] flex flex-col justify-between items-end px-2 border-l-[#222] border-l text-white">
			{yAxisLabels.map((label) => (
				<div key={label} className="text-[.6rem]">
					{label.toFixed(point < 0.01 ? 5 : 2)}
				</div>
			))}
		</div>
	);
};
