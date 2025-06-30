"use client";
import { useGridStore } from "@/stores/gridStore";
import type { LayoutPreset } from "@/stores/gridStore";
import { useEffect, useState } from "react";
import { LuLayoutGrid } from "react-icons/lu";

export const GridControl = () => {
	const { currentLayout, setLayout } = useGridStore();
	const [mounted, setMounted] = useState(false);
	const [localLayout, setLocalLayout] = useState<LayoutPreset>("balanced");

	// Handle client-side mounting and hydration
	useEffect(() => {
		setMounted(true);
		// Get the saved layout from localStorage
		const savedLayout = localStorage.getItem(
			"rthmn-layout-preset",
		) as LayoutPreset;
		if (savedLayout) {
			setLocalLayout(savedLayout);
			setLayout(savedLayout);
		} else {
			setLocalLayout(currentLayout);
		}
	}, [setLayout, currentLayout]);

	const layouts: { id: LayoutPreset; label: string }[] = [
		{ id: "compact", label: "Compact" },
		{ id: "balanced", label: "Balanced" },
	];

	const handleLayoutChange = (layout: LayoutPreset) => {
		setLocalLayout(layout);
		setLayout(layout);
	};

	// Return loading state before mounting
	if (!mounted) {
		return (
			<div
				className="flex items-center gap-1 p-1 transition-all duration-300 overflow-hidden"
				style={{
					borderRadius: "4px",
					background: "transparent",
					border: "1px solid rgba(28, 30, 35, 0.4)",
				}}
			>
				<div className="flex gap-1">
					{layouts.map((layout) => (
						<div
							key={layout.id}
							className="font-russo relative flex h-7 items-center px-2 text-[10px] font-medium text-[#818181] transition-all duration-300"
							style={{ borderRadius: "4px" }}
						>
							{layout.label}
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div
			className="flex items-center gap-1 p-1 bg-black rounded-xl transition-all duration-300 overflow-hidden"
			style={{
				borderRadius: "4px",
				border: "1px solid rgba(28, 30, 35, 0.4)",
			}}
		>
			<div className="flex gap-1">
				{layouts.map((layout) => (
					<button
						key={layout.id}
						onClick={() => handleLayoutChange(layout.id)}
						className="group/gridcontrol font-russo relative flex h-7 items-center px-2 text-[10px] font-medium transition-all duration-300 overflow-hidden"
						style={{ borderRadius: "4px" }}
					>
						{/* Compact balanced indicator - shows when active */}
						{localLayout === layout.id && (
							<div
								className="absolute -left-4 top-1/2 -translate-y-1/2 bg-[#B0B0B0] z-10"
								style={{
									width: "20px",
									height: "3px",
									transform: "translateY(-50%) rotate(-90deg)",
									filter: "blur(6px)",
									transformOrigin: "center",
								}}
							/>
						)}

						{/* Active background - only when this specific button is active */}
						{localLayout === layout.id && (
							<div
								className="absolute inset-0"
								style={{
									borderRadius: "4px",
									background:
										"linear-gradient(180deg, #343A42 -10.71%, #1F2328 100%)",
									boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.25)",
								}}
							/>
						)}

						{/* Hover background - only for inactive buttons and only on hover */}
						{localLayout !== layout.id && (
							<div
								className="absolute inset-0 opacity-0 group-hover/gridcontrol:opacity-100 transition-opacity duration-300"
								style={{
									borderRadius: "4px",
									background:
										"linear-gradient(180deg, #2C3137 -10.71%, #16191D 100%)",
									boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.15)",
								}}
							/>
						)}

						<span
							className={`relative z-10 transition-colors duration-300 ${
								localLayout === layout.id
									? "text-[#B0B0B0]"
									: "text-[#818181] group-hover/gridcontrol:text-white"
							}`}
						>
							{layout.label}
						</span>
					</button>
				))}
			</div>
		</div>
	);
};
