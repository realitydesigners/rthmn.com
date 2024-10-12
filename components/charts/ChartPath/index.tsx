import React from "react";
import styles from "./styles.module.css";

interface HoverIndicatorProps {
	hoverPosition: { x: number; y: number };
	hoverPrice: number;
	hoverTime: string;
	chartHeight: number;
}

const ChartPathPriceOnHover: React.FC<HoverIndicatorProps> = ({ hoverPosition, hoverPrice, hoverTime, chartHeight }) => {
	return (
		<>
			<line x1={hoverPosition.x} y1={0} x2={hoverPosition.x} y2={chartHeight} className="stroke-[#555]" strokeWidth="1" />
			<line
				x1={hoverPosition.x}
				y1={hoverPosition.y}
				x2={hoverPosition.x}
				y2={hoverPosition.y - 15}
				className="stroke-[#222]"
				strokeWidth="2"
			/>
			<foreignObject
				x={hoverPosition.x - 40}
				y={hoverPosition.y - 55}
				width="80"
				height="40"
				className="transition-opacity duration-300"
			>
				<div className="bg-[#181818] border border-[#222] py-2 rounded-[.25rem] text-white text-sm font-bold shadow-lg flex justify-center items-center">
					{hoverPrice.toFixed(5)}
				</div>
			</foreignObject>
			<circle cx={hoverPosition.x} cy={hoverPosition.y} r="5" className="fill-white z-[1000]" />
			<foreignObject x={hoverPosition.x - 30} y={chartHeight - 30} width="60" height="20" className="transition-opacity duration-300">
				<div className="bg-[#181818] border border-[#222] py-1 rounded-[.25rem] text-white text-xs font-bold shadow-lg flex justify-center items-center">
					{hoverTime}
				</div>
			</foreignObject>
		</>
	);
};

interface ChartPathProps {
	isHoveringLine: boolean;
	calculatePathData: () => string;
	calculateCurrentPricePosition: () => { x: number; y: number };
	hoverPosition: { x: number; y: number } | null;
	hoverPrice: number | null;
	hoverTime: string | null;
	chartHeight: number;
}

const ChartPath: React.FC<ChartPathProps> = ({
	isHoveringLine,
	calculatePathData,
	calculateCurrentPricePosition,
	hoverPosition,
	hoverPrice,
	hoverTime,
	chartHeight,
}) => {
	const pathData = calculatePathData();
	const currentPricePosition = calculateCurrentPricePosition();

	return (
		<g>
			<path
				d={pathData}
				fill="none"
				stroke="white"
				strokeWidth={isHoveringLine ? 2 : 1.5}
				opacity={isHoveringLine ? 0.5 : 1}
			/>
			<line
				x1={currentPricePosition.x}
				y1={0}
				x2={currentPricePosition.x}
				y2={chartHeight}
				stroke="red"
				strokeWidth="1"
				strokeDasharray="5,5"
			/>
			<circle
				cx={currentPricePosition.x}
				cy={currentPricePosition.y}
				r="4"
				fill="red"
			/>
			<circle cx={currentPricePosition.x} cy={currentPricePosition.y} r="5" className={styles.chartDot} />
			<circle
				cx={currentPricePosition.x}
				cy={currentPricePosition.y}
				r="5"
				className={`${styles.chartDot} ${styles.pulsingCircle}`}
			/>
			<circle
				cx={currentPricePosition.x}
				cy={currentPricePosition.y}
				r="5"
				className={`${styles.chartDot} ${styles.pulsingCircle}`}
			/>

			{hoverPosition && hoverPrice !== null && hoverTime !== null && (
				<ChartPathPriceOnHover
					hoverPosition={hoverPosition}
					hoverPrice={hoverPrice}
					hoverTime={hoverTime}
					chartHeight={chartHeight}
				/>
			)}
		</g>
	);
};

export default ChartPath;
