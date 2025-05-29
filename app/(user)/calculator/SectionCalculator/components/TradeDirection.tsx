import { memo } from "react";

export type Direction = "long" | "short";

interface TradeDirectionProps {
	direction: Direction;
	onDirectionChange: (direction: Direction) => void;
}

export const TradeDirection = memo(
	({ direction, onDirectionChange }: TradeDirectionProps) => (
		<div className="flex gap-2">
			<button
				onClick={() => onDirectionChange("long")}
				className={`group relative flex items-center gap-2 rounded-full border px-4 py-2 transition-all duration-300 ${
					direction === "long"
						? "border-blue-400/50 bg-blue-400/10 text-blue-400"
						: "border-[#1C1E23] bg-black/40 primary-text hover:border-[#32353C]"
				}`}
			>
				<span className="font-kodemono ">Long</span>
			</button>
			<button
				onClick={() => onDirectionChange("short")}
				className={`group relative flex items-center gap-2 rounded-full border px-4 py-2 transition-all duration-300 ${
					direction === "short"
						? "border-red-400/50 bg-red-400/10 text-red-400"
						: "border-[#1C1E23] bg-black/40 primary-text hover:border-[#32353C]"
				}`}
			>
				<span className="font-kodemono ">Short</span>
			</button>
		</div>
	),
);
