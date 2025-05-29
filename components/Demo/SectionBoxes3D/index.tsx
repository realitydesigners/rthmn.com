"use client";

import { ResoBox3DCircular } from "@/components/Demo/ResoBox3DDemo";
import { HeroText } from "./HeroText";
import type { BoxSlice } from "@/types/types";
import {
	BASE_VALUES,
	createDemoStep,
	createMockBoxData,
	sequences,
} from "@/components/Constants/constants";
import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import type React from "react";
import { memo, useMemo, useRef, useState, useEffect } from "react";
import { DemoNavbar } from "@/components/Navbars/DemoNavbar";
import { DemoSidebarLeft } from "@/components/Demo/DemoSidebarLeft";
import { DemoSidebarRight } from "@/components/Demo/DemoSidebarRight";
import { TradingAdvantage } from "./TradingAdvantage";

interface ScreenProps {
	scale: MotionValue<number>;
	scrollYProgress: MotionValue<number>;
	children: React.ReactNode;
	showScreen: boolean;
}

// Screen component that wraps the entire demo with animated border and scaling
const Screen = memo(
	({ scale, scrollYProgress, children, showScreen }: ScreenProps) => {
		// Border animation - appears after all UI elements are loaded
		const borderOpacity = useTransform(
			scrollYProgress,
			[0.34, 0.37], // Start after sidebars finish and complete quickly
			[0, 1],
		);

		if (!showScreen) return null;

		return (
			<motion.div
				style={{
					scale,
				}}
				className="relative w-full h-full"
			>
				{/* Animated border that appears when UI is loaded */}
				<motion.div
					style={{ opacity: borderOpacity }}
					className="absolute inset-0 border-2 border-[#1C1E23] rounded-lg pointer-events-none z-[110]"
				/>

				{children}
			</motion.div>
		);
	},
);

Screen.displayName = "Screen";

export const SectionBoxes3D = memo(() => {
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end start"],
	});

	// State to track the dominant state from the 3D visualization
	const [dominantState, setDominantState] = useState("neutral");

	// State to track the current structure slice from ResoBox3DCircular (first structure)
	const [currentStructureSlice, setCurrentStructureSlice] =
		useState<BoxSlice | null>(null);

	// Create initial structure slice for the intro (will be updated by ResoBox3DCircular)
	const initialStructureSlice = useMemo(() => {
		const currentValues = createDemoStep(4, sequences, BASE_VALUES); // Use first structure's startOffset
		const mockBoxData = createMockBoxData(currentValues);
		return { timestamp: new Date().toISOString(), boxes: mockBoxData };
	}, []);

	// Use the current slice from ResoBox3DCircular if available, otherwise use initial
	const structureSlice = currentStructureSlice || initialStructureSlice;

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

	// Intro sequence timing - Made much snappier:
	// 0-0.05: Scattered boxes with text
	// 0.05-0.25: Formation animation (faster)
	// 0.25+: UI elements start appearing
	const introTextOpacity = useTransform(
		scrollYProgress,
		[0, 0.1, 0.25, 0.35],
		[1, 1, 1, 0],
	);

	// Formation progress for the intro animation
	const [currentScrollProgress, setCurrentScrollProgress] = useState(0);

	useEffect(() => {
		const unsubscribe = scrollYProgress.onChange((value) => {
			setCurrentScrollProgress(value);
		});
		return unsubscribe;
	}, [scrollYProgress]);

	const formationProgress = Math.max(
		0,
		Math.min(1, (currentScrollProgress - 0.1) / 0.2),
	);

	// Screen component animations (start after formation completes at 0.25)
	// Scale animation happens in first part, then stays at final scale
	const scale = useTransform(scrollYProgress, [0.25, 0.35], [1.0, 0.8]);
	// Movement starts much earlier to avoid long dead zone
	const containerY = useTransform(scrollYProgress, [0.6, 0.8], [0, -500]);

	// UI element animations (start after formation completes at 0.25)
	const leftSidebarX = useTransform(scrollYProgress, [0.25, 0.35], [-64, 0]);
	const leftSidebarOpacity = useTransform(
		scrollYProgress,
		[0.25, 0.35],
		[0, 1],
	);

	const rightSidebarX = useTransform(scrollYProgress, [0.25, 0.35], [64, 0]);
	const rightSidebarOpacity = useTransform(
		scrollYProgress,
		[0.25, 0.35],
		[0, 1],
	);

	const navbarY = useTransform(scrollYProgress, [0.25, 0.35], [-56, 0]);
	const navbarOpacity = useTransform(scrollYProgress, [0.25, 0.35], [0, 1]);

	return (
		<div ref={containerRef} className="relative">
			{/* Extended height for intro sequence and Screen interaction */}
			<div className="h-[300vh] relative">
				<div className="sticky top-0 h-screen w-full flex items-center justify-center relative">
					{/* Aurora Background - always present */}
					{/* <AuroraBackground dominantState={dominantState} /> */}

					{/* Hero Text */}
					<HeroText opacity={introTextOpacity} />

					{/* Single continuous experience with Screen wrapper */}
					<Screen
						scale={scale}
						scrollYProgress={scrollYProgress}
						showScreen={true}
					>
						<DemoNavbar y={navbarY} opacity={navbarOpacity} />
						<DemoSidebarLeft x={leftSidebarX} opacity={leftSidebarOpacity} />
						<DemoSidebarRight x={rightSidebarX} opacity={rightSidebarOpacity} />
						{structureSlice && structureSlice.boxes.length > 0 && (
							<ResoBox3DCircular
								slice={structureSlice}
								className="h-full w-full absolute"
								onDominantStateChange={setDominantState}
								onCurrentSliceChange={setCurrentStructureSlice}
								introMode={formationProgress < 1}
								formationProgress={formationProgress}
								scrollProgress={currentScrollProgress}
							/>
						)}
					</Screen>
				</div>
			</div>

			{/* Movement Phase - Container moves up */}
			<motion.div
				style={{ y: containerY }}
				className="relative"
				transformTemplate={({ y }) => `translate3d(0, ${y}, 0)`}
			>
				{/* Trading Advantage Section */}
				<TradingAdvantage />
			</motion.div>
		</div>
	);
});

SectionBoxes3D.displayName = "SectionBoxes3D";
