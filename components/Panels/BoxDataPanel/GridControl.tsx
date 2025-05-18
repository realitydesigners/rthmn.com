"use client";
import { useGridStore } from "@/stores/gridStore";
import type { LayoutPreset } from "@/stores/gridStore";
import { LuLayoutGrid } from "react-icons/lu";
import { useEffect, useState } from "react";

export const GridControl = () => {
	const { currentLayout, setLayout } = useGridStore();
	const [mounted, setMounted] = useState(false);

	// Handle client-side mounting
	useEffect(() => {
		setMounted(true);
	}, []);

	const layouts: { id: LayoutPreset; label: string }[] = [
		{ id: 'compact', label: 'Compact' },
		{ id: 'balanced', label: 'Balanced' },
		
	];

	const handleLayoutChange = (layout: LayoutPreset) => {
		console.log('Setting layout to:', layout);
		setLayout(layout);
	};

	// Return null or a loading state before mounting
	if (!mounted) {
		return (
			<div className="flex items-center gap-2 rounded-lg border border-[#1C1E23] bg-[#0A0B0D] p-1">
				<div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#1C1E23] bg-[#0F1012]">
					<LuLayoutGrid className="h-4 w-4 text-[#818181]" />
				</div>
				<div className="flex gap-1">
					{layouts.map((layout) => (
						<div
							key={layout.id}
							className="font-outfit relative flex h-7 items-center rounded-md px-3 text-xs font-medium text-[#818181]"
						>
							{layout.label}
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2 rounded-lg border border-[#1C1E23] bg-[#0A0B0D] p-1">
			<div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#1C1E23] bg-[#0F1012]">
				<LuLayoutGrid className="h-4 w-4 text-[#818181]" />
			</div>
			<div className="flex gap-1">
				{layouts.map((layout) => (
					<button
						key={layout.id}
						onClick={() => handleLayoutChange(layout.id)}
						className={`font-outfit relative flex h-7 items-center rounded-md px-3 text-xs font-medium transition-all duration-200 ${
							currentLayout === layout.id
								? 'bg-[#1C1E23] text-white'
								: 'text-[#818181] hover:text-white'
						}`}
					>
						{layout.label}
					</button>
				))}
			</div>
		</div>
	);
};
