"use client";

import { ResoBox3DCircular } from "@/components/Charts/ResoBox/ResoBox3DDemo";
import {
	BASE_VALUES,
	createDemoStep,
	createMockBoxData,
	sequences,
} from "@/components/Constants/constants";
import { motion } from "framer-motion";
import type React from "react";
import { memo, useMemo, useRef } from "react";

export const SectionBoxes3D = memo(() => {
	const containerRef = useRef<HTMLDivElement>(null);

	// Create a dummy slice for initialization - each structure will generate its own data
	const dummySlice = useMemo(() => {
		const currentValues = createDemoStep(0, sequences, BASE_VALUES);
		const mockBoxData = createMockBoxData(currentValues);
		return { timestamp: new Date().toISOString(), boxes: mockBoxData };
	}, []);

	// Custom box colors for 3D visualization
	const boxColors = {
		positive: "#24FF66", // Matrix green
		negative: "#303238", // Dark gray
		styles: {
			borderRadius: 4,
			shadowIntensity: 0.4,
			opacity: 0.9,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,
			viewMode: "3d" as const,
		},
	};

	// Animation is now handled individually by each structure in ResoBox3DCircular

	return (
		<section
			ref={containerRef}
			className="relative min-h-screen w-full overflow-hidden bg-black"
		>
			{/* 3D Visualization Background - Fixed Position */}
			<div className="absolute inset-0 z-10">
				{dummySlice && dummySlice.boxes.length > 0 && (
					<ResoBox3DCircular
						slice={dummySlice}
						boxColors={boxColors}
						className="h-full w-full"
					/>
				)}
			</div>
		</section>
	);
});
SectionBoxes3D.displayName = "SectionBoxes3D";
