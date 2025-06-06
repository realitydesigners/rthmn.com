"use client";

import {
	BASE_VALUES,
	createDemoStep,
	createMockBoxData,
	sequences,
} from "@/components/Constants/constants";
import { DemoSidebarLeft } from "@/components/Demo/DemoSidebarLeft";
import { DemoSidebarRight } from "@/components/Demo/DemoSidebarRight";
import { ResoBox3DCircular } from "@/components/Demo/ResoBox3DDemo";
import {
	TradingInfoPanel,
	mockTradingData,
} from "@/components/Demo/TradingPanel";
import { DemoNavbar } from "@/components/Navbars/DemoNavbar";
import type { BoxSlice } from "@/types/types";
import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import type React from "react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { LuBarChart3, LuLayoutDashboard, LuTrendingUp } from "react-icons/lu";
import { BaseButton, NavButton, StructureIndicator } from "./Displays";
import { HeroText } from "./HeroText";
import { TradingAdvantage } from "./TradingAdvantage";
import { useAnimatedStructures } from "./useAnimatedStructures";

type CryptoStructure = {
	pair: string;
	name: string;
};

interface ScreenProps {
	scale: MotionValue<number>;
	scrollYProgress: MotionValue<number>;
	children: React.ReactNode;
	showScreen: boolean;
	focusedIndex: number;
}

// Screen component that wraps the entire demo with animated border and scaling
const Screen = memo(
	({
		scale,
		scrollYProgress,
		children,
		showScreen,
		focusedIndex,
	}: ScreenProps) => {
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
				className="absolute inset-0 w-full h-full lg:flex hidden pointer-events-none z-20"
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

// DemoBottomNavbar component for the UI controls
const DemoBottomNavbar = memo(
	({
		cryptoStructures,
		focusedIndex,
		setFocusedIndex,
		viewMode,
		setViewMode,
		isTradingPanelOpen,
		setIsTradingPanelOpen,
		navigation,
	}: {
		cryptoStructures: CryptoStructure[];
		focusedIndex: number;
		setFocusedIndex: (index: number) => void;
		viewMode: "scene" | "box";
		setViewMode: (mode: "scene" | "box") => void;
		isTradingPanelOpen: boolean;
		setIsTradingPanelOpen: (open: boolean) => void;
		navigation: {
			next: () => void;
			previous: () => void;
		};
	}) => (
		<>
			<div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto">
				<StructureIndicator
					structures={cryptoStructures}
					activeIndex={focusedIndex}
					onSelect={setFocusedIndex}
				/>
			</div>

			<div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
				<div className="flex items-center gap-4">
					{/* Always show navigation controls with mode toggle */}
					<div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
						<div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.02] via-transparent to-black/10" />
						<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

						<div className="relative z-10 flex items-center gap-3">
							{/* Scene navigation when in scene mode */}
							{viewMode === "scene" && (
								<>
									<NavButton direction="left" onClick={navigation.previous} />
									<NavButton direction="right" onClick={navigation.next} />
									<div className="w-px h-6 bg-gradient-to-b from-transparent via-[#32353C] to-transparent" />
								</>
							)}

							{/* Focus mode label when in box mode */}
							{viewMode === "box" && (
								<>
									<span className="font-russo text-xs text-[#818181] uppercase tracking-wider">
										Focus Mode
									</span>
									<div className="w-px h-6 bg-gradient-to-b from-transparent via-[#32353C] to-transparent" />
								</>
							)}

							{/* Mode toggle button */}
							<BaseButton
								onClick={() =>
									setViewMode(viewMode === "scene" ? "box" : "scene")
								}
								variant={viewMode === "box" ? "primary" : "secondary"}
								size="md"
								className="group"
							>
								{viewMode === "scene" ? (
									<LuLayoutDashboard className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
								) : (
									<LuBarChart3 className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
								)}
							</BaseButton>

							{/* Trading panel toggle - only in box mode */}
							{viewMode === "box" && (
								<BaseButton
									onClick={() => setIsTradingPanelOpen(!isTradingPanelOpen)}
									variant={isTradingPanelOpen ? "primary" : "secondary"}
									size="md"
									className="group"
								>
									<LuTrendingUp className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
								</BaseButton>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	),
);

DemoBottomNavbar.displayName = "DemoBottomNavbar";

export const SectionBoxes3D = memo(() => {
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end start"],
	});

	// State to track the current structure slice from ResoBox3DCircular (first structure)
	const [currentStructureSlice, setCurrentStructureSlice] =
		useState<BoxSlice | null>(null);

	// UI state for the 3D controls
	const [focusedIndex, setFocusedIndex] = useState(0);
	const [viewMode, setViewMode] = useState<"scene" | "box">("scene");
	const [isTradingPanelOpen, setIsTradingPanelOpen] = useState(false);

	// Get crypto structures for UI
	const { cryptoStructures } = useAnimatedStructures();

	// Create initial structure slice for the intro (will be updated by ResoBox3DCircular)
	const initialStructureSlice = useMemo(() => {
		const currentValues = createDemoStep(4, sequences, BASE_VALUES); // Use first structure's startOffset
		const mockBoxData = createMockBoxData(currentValues);
		return { timestamp: new Date().toISOString(), boxes: mockBoxData };
	}, []);

	// Use the current slice from ResoBox3DCircular if available, otherwise use initial
	const structureSlice = currentStructureSlice || initialStructureSlice;
	const [currentScrollProgress, setCurrentScrollProgress] = useState(() => {
		// Get initial scroll progress immediately to avoid intro animation on refresh
		if (typeof window !== "undefined") {
			return scrollYProgress.get();
		}
		return 0;
	});

	useEffect(() => {
		// Set initial scroll progress immediately on mount
		setCurrentScrollProgress(scrollYProgress.get());

		const unsubscribe = scrollYProgress.onChange((value) => {
			setCurrentScrollProgress(value);
		});
		return unsubscribe;
	}, [scrollYProgress]);

	const formationProgress = Math.max(
		0,
		Math.min(1, (currentScrollProgress - 0.1) / 0.2),
	);
	const introTextOpacity = useTransform(
		scrollYProgress,
		[0, 0.1, 0.25, 0.35],
		[1, 1, 1, 0],
	);

	const scale = useTransform(scrollYProgress, [0.25, 0.35], [1.0, 0.8]);
	const leftSidebarX = useTransform(scrollYProgress, [0.25, 0.35], [-64, 0]);
	const rightSidebarX = useTransform(scrollYProgress, [0.25, 0.35], [64, 0]);
	const sidebarOpacity = useTransform(scrollYProgress, [0.25, 0.35], [0, 1]);
	const navbarY = useTransform(scrollYProgress, [0.25, 0.35], [-56, 0]);

	// Navigation functions for the UI controls
	const navigation = {
		next: () => setFocusedIndex((prev) => (prev + 1) % cryptoStructures.length),
		previous: () =>
			setFocusedIndex(
				(prev) =>
					(prev - 1 + cryptoStructures.length) % cryptoStructures.length,
			),
	};

	return (
		<div ref={containerRef} className="relative">
			<div className="h-[300vh] relative">
				<div className="sticky top-0 h-screen w-full flex items-center justify-center relative">
					<HeroText opacity={introTextOpacity} />
					{structureSlice && structureSlice.boxes.length > 0 && (
						<ResoBox3DCircular
							slice={structureSlice}
							className="h-full w-full absolute inset-0 z-0"
							onCurrentSliceChange={setCurrentStructureSlice}
							focusedIndex={focusedIndex}
							viewMode={viewMode}
							introMode={formationProgress < 1}
							formationProgress={formationProgress}
							scrollProgress={currentScrollProgress}
							cameraDistance={scale}
						/>
					)}
					<Screen
						scale={scale}
						scrollYProgress={scrollYProgress}
						showScreen={true}
						focusedIndex={focusedIndex}
					>
						<DemoNavbar y={navbarY} opacity={sidebarOpacity} />
						<DemoSidebarLeft x={leftSidebarX} opacity={sidebarOpacity} />
						<DemoSidebarRight x={rightSidebarX} opacity={sidebarOpacity} />

						{/* UI Controls - only show when not in intro mode */}
						{formationProgress >= 1 && (
							<>
								<DemoBottomNavbar
									cryptoStructures={cryptoStructures}
									focusedIndex={focusedIndex}
									setFocusedIndex={setFocusedIndex}
									viewMode={viewMode}
									setViewMode={setViewMode}
									isTradingPanelOpen={isTradingPanelOpen}
									setIsTradingPanelOpen={setIsTradingPanelOpen}
									navigation={navigation}
								/>

								{/* Trading Info Panel */}
								<TradingInfoPanel
									isOpen={isTradingPanelOpen}
									onClose={() => setIsTradingPanelOpen(false)}
									tradingData={
										mockTradingData[cryptoStructures[focusedIndex]?.pair] ||
										mockTradingData.BTC
									}
								/>
							</>
						)}
					</Screen>
				</div>
			</div>
			<TradingAdvantage />
		</div>
	);
});

SectionBoxes3D.displayName = "SectionBoxes3D";
