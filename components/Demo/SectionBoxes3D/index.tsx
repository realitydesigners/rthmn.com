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
				{/* Content Section */}
				<section className="relative min-h-screen w-full bg-gradient-to-b from-black via-[#0A0B0D] to-[#050506] pt-24">
					<div className="container mx-auto px-6 py-24">
						<div className="max-w-7xl mx-auto space-y-20">
							{/* Header */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.2 }}
								className="text-center space-y-8"
							>
								<h2 className="font-russo text-4xl lg:text-6xl xl:text-7xl font-black text-white tracking-tighter leading-[0.85] uppercase">
									ADVANCED MARKET
									<span className="block text-[#24FF66] mt-2">
										VISUALIZATION
									</span>
								</h2>
								<p className="font-outfit text-lg lg:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
									Experience multi-dimensional market analysis through our
									revolutionary 3D box visualization system. Transform complex
									data into actionable insights with unprecedented clarity.
								</p>
							</motion.div>

							{/* Feature Grid */}
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
								{[
									{
										title: "Real-time Analysis",
										description:
											"Live market data processed and visualized in real-time with sub-second latency for immediate insights.",
										category: "PERFORMANCE",
									},
									{
										title: "Multi-Asset Support",
										description:
											"Analyze Bitcoin, Ethereum, Solana, and other major cryptocurrencies simultaneously in one unified view.",
										category: "COVERAGE",
									},
									{
										title: "3D Nested Structures",
										description:
											"Understand complex market relationships through intuitive 3D nested box representations and hierarchical data.",
										category: "VISUALIZATION",
									},
									{
										title: "Interactive Controls",
										description:
											"Navigate between different market views and timeframes with smooth transitions and responsive controls.",
										category: "INTERFACE",
									},
									{
										title: "Technical Indicators",
										description:
											"Integrated RSI, MACD, and volatility metrics for comprehensive technical analysis and market insights.",
										category: "ANALYTICS",
									},
									{
										title: "Trading Insights",
										description:
											"AI-powered market analysis with support and resistance level identification for strategic decision making.",
										category: "INTELLIGENCE",
									},
								].map((feature, index) => (
									<motion.div
										key={feature.title}
										initial={{ opacity: 0, y: 30 }}
										whileInView={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: index * 0.1 }}
										className="group relative overflow-hidden rounded-xl border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[#24FF66]/30 transition-all duration-500 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
									>
										{/* Background glow */}
										<div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

										{/* Top highlight */}
										<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

										{/* Hover glow effect */}
										<div className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#24FF66]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

										<div className="relative z-10 p-6 lg:p-8 space-y-4">
											{/* Category badge */}
											<div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#24FF66]/20 to-[#24FF66]/10 border border-[#24FF66]/30">
												<span className="font-outfit text-xs font-semibold text-[#24FF66] uppercase tracking-wider">
													{feature.category}
												</span>
											</div>

											{/* Title */}
											<h3 className="font-russo text-lg lg:text-xl font-bold text-white group-hover:text-[#24FF66] transition-colors duration-300 uppercase tracking-tight">
												{feature.title}
											</h3>

											{/* Description */}
											<p className="font-outfit text-sm lg:text-base text-white/60 leading-relaxed group-hover:text-white/80 transition-colors duration-300">
												{feature.description}
											</p>

											{/* Bottom accent line */}
											<div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-[#24FF66] to-transparent group-hover:w-full transition-all duration-500" />
										</div>
									</motion.div>
								))}
							</div>

							{/* Stats Section */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.4 }}
								className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
							>
								{[
									{ value: "< 100ms", label: "Latency" },
									{ value: "50+", label: "Cryptocurrencies" },
									{ value: "24/7", label: "Real-time Data" },
									{ value: "99.9%", label: "Uptime" },
								].map((stat, index) => (
									<motion.div
										key={stat.label}
										initial={{ opacity: 0, scale: 0.9 }}
										whileInView={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
										className="text-center space-y-2"
									>
										<div className="font-russo text-2xl lg:text-3xl xl:text-4xl font-black text-[#24FF66] tracking-tighter">
											{stat.value}
										</div>
										<div className="font-outfit text-sm lg:text-base text-white/60 uppercase tracking-wider">
											{stat.label}
										</div>
									</motion.div>
								))}
							</motion.div>

							{/* Call to Action */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.6 }}
								className="text-center space-y-8"
							>
								<h3 className="font-russo text-2xl lg:text-3xl xl:text-4xl font-black text-white uppercase tracking-tighter">
									Ready to decode the market?
								</h3>

								<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#24FF66] to-[#1ECC52] text-black font-outfit font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(36,255,102,0.3)] transition-all duration-300"
									>
										<span>Start Trading</span>
										<svg
											className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13 7l5 5m0 0l-5 5m5-5H6"
											/>
										</svg>
									</motion.button>

									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="group relative inline-flex items-center gap-3 px-8 py-4 border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm text-white font-outfit font-semibold rounded-xl hover:border-[#32353C]/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300"
									>
										<span>Watch Demo</span>
										<svg
											className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									</motion.button>
								</div>
							</motion.div>
						</div>
					</div>
				</section>
			</motion.div>
		</div>
	);
});

SectionBoxes3D.displayName = "SectionBoxes3D";
