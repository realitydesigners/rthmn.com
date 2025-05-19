"use client";

import { PanelSection } from "@/components/Panels/PanelComponents/PanelSection";
import { useColorStore } from "@/stores/colorStore";
import { cn } from "@/utils/cn";
import type React from "react";
import { memo, useState } from "react";
import { LuBox, LuBoxes, LuLineChart, LuLock } from "react-icons/lu";

// Custom Square icon component
const SquareIcon = ({
	size = 24,
	className,
}: { size?: number; className?: string }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
		role="img"
		aria-label="Square box icon"
	>
		<title>Square box icon</title>
		<rect x="6" y="6" width="12" height="12" rx="1" />
	</svg>
);

export const CHART_STYLES = {
	box: {
		id: "box",
		title: "Box",
		icon: SquareIcon,
		locked: false,
		isActive: true,
		description: "Classic box visualization",
	},

	threeD: {
		id: "3d",
		title: "3D",
		icon: LuBox,
		locked: false,
		isActive: false,
		description: "3D visualization of boxes",
	},
	line: {
		id: "line",
		title: "Line",
		icon: LuLineChart,
		locked: true,
		isActive: false,
		description: "Traditional line chart view",
		comingSoon: true,
	},
} as const;

interface IconProps {
	size: number;
	className?: string;
}

interface ChartStyleOptionProps {
	id: string;
	title: string;
	icon: React.ComponentType<IconProps>;
	locked: boolean;
	isActive: boolean;
	description: string;
	onClick?: () => void;
}

const ChartStyleOption: React.FC<ChartStyleOptionProps> = ({
	title,
	icon: Icon,
	locked,
	isActive,
	onClick,
}) => {
	return (
		<button
			type="button"
			onClick={locked ? undefined : onClick}
			className={cn(
				"group relative flex h-[72px] flex-col items-center justify-center gap-2 rounded-lg border transition-all duration-300",
				isActive
					? [
							"border-[#111215] bg-gradient-to-b from-[#0A0B0D] to-[#070809]",
							"shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
							"hover:border-[#1C1E23] hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.5)]",
						]
					: [
							"border-[#111215] bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/80",
							"hover:border-[#1C1E23] hover:shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
						],
				locked ? "pointer-events-none opacity-90" : "cursor-pointer",
			)}
		>
			{/* Background glow effect */}
			{isActive && !locked && (
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_50%)]" />
			)}

			{/* Diagonal stripes for locked state */}
			{locked && (
				<>
					{/* Base dark stripes */}
					<div
						className="absolute inset-0 opacity-[0.06]"
						style={{
							backgroundImage: `repeating-linear-gradient(
                                135deg,
                                #000,
                                #000 1px,
                                transparent 1.5px,
                                transparent 6px
                            )`,
						}}
					/>
					{/* Secondary dark stripes */}
					<div
						className="absolute inset-0 opacity-[0.04]"
						style={{
							backgroundImage: `repeating-linear-gradient(
                                45deg,
                                #000,
                                #000 1px,
                                transparent 1.5px,
                                transparent 6px
                            )`,
						}}
					/>
					{/* Subtle light stripes */}
					<div
						className="absolute inset-0 opacity-[0.015]"
						style={{
							backgroundImage: `repeating-linear-gradient(
                                135deg,
                                #fff,
                                #fff 1px,
                                transparent 1.5px,
                                transparent 6px
                            )`,
						}}
					/>
					{/* Overlay gradient for depth */}
					<div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/5" />
				</>
			)}

			{/* Lock icon */}
			{locked && (
				<div className="pointer-events-none absolute -top-1 -right-1 flex items-center">
					<div className="flex h-5 items-center gap-1">
						<div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#1C1E23]  bg-gradient-to-b from-black/90 to-black/95 shadow-[0_2px_4px_rgba(0,0,0,0.4)] backdrop-blur-[1px]">
							<LuLock className="h-2.5 w-2.5 text-white/80" />
						</div>
					</div>
				</div>
			)}

			{/* Icon container with glow effect */}
			<div
				className={cn(
					"relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b transition-all duration-300",
					locked
						? "from-[#0A0B0D]/70 to-[#070809]/70 shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
						: isActive
							? [
									"from-[#0A0B0D] to-[#070809]",
									"shadow-[0_2px_4px_rgba(0,0,0,0.4)]",
									"group-hover:shadow-[0_4px_8px_rgba(0,0,0,0.5)]",
								]
							: [
									"from-[#0A0B0D] to-[#070809]",
									"shadow-[0_2px_4px_rgba(0,0,0,0.2)]",
									"group-hover:shadow-[0_4px_8px_rgba(0,0,0,0.4)]",
								],
				)}
			>
				{/* Icon inner glow */}
				{!locked && isActive && (
					<div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]" />
				)}
				<Icon
					size={20}
					className={cn(
						"relative transition-all duration-300",
						isActive
							? "text-[#545963] group-hover:text-white"
							: "text-[#32353C] group-hover:text-[#545963]",
						locked ? "text-[#32353C] opacity-40" : "group-hover:scale-105",
					)}
				/>
			</div>

			{/* Title */}
			<span
				className={cn(
					"font-outfit text-[13px] font-medium tracking-wide transition-all duration-300",
					locked
						? "text-[#32353C]/40"
						: isActive
							? "text-[#545963]"
							: "text-[#32353C] group-hover:text-[#545963]",
				)}
			>
				{title}
			</span>
		</button>
	);
};

const ChartStyleOptionsContent = memo(() => {
	const boxColors = useColorStore((state) => state.boxColors);
	const updateStyles = useColorStore((state) => state.updateStyles);

	const handleStyleChange = (id: string) => {
		updateStyles({ viewMode: id === "3d" ? "3d" : "default" });
	};

	return (
		<div className="grid grid-cols-3 gap-2">
			{Object.values(CHART_STYLES).map((style) => (
				<ChartStyleOption
					key={style.id}
					{...style}
					isActive={
						boxColors.styles?.viewMode ===
						(style.id === "3d" ? "3d" : "default")
					}
					onClick={() => handleStyleChange(style.id)}
				/>
			))}
		</div>
	);
});

export const ChartStyleOptions = memo(() => {
	const [isExpanded, setIsExpanded] = useState(true);

	return (
		<PanelSection
			title="Chart Style"
			icon={LuLineChart}
			isExpanded={isExpanded}
			onToggle={() => setIsExpanded(!isExpanded)}
		>
			<div className="p-2">
				<ChartStyleOptionsContent />
			</div>
		</PanelSection>
	);
});

ChartStyleOptions.displayName = "ChartStyleOptions";
ChartStyleOptionsContent.displayName = "ChartStyleOptionsContent";
ChartStyleOption.displayName = "ChartStyleOption";
