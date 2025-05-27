"use client";

import { ResoBox3DCircular } from "@/components/Charts/ResoBox/ResoBox3DDemo";
import type { BoxColors } from "@/stores/colorStore";
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
import { memo, useMemo, useRef } from "react";
import Image from "next/image";

import { DemoNavbar } from "@/components/Navbars/DemoNavbar";
import { DemoSidebarLeft } from "@/components/Sidebars/DemoSidebarLeft";
import { DemoSidebarRight } from "@/components/Sidebars/DemoSidebarRight";

interface ScreenProps {
	scale: MotionValue<number>;
	navbarY: MotionValue<number>;
	navbarOpacity: MotionValue<number>;
	leftSidebarX: MotionValue<number>;
	leftSidebarOpacity: MotionValue<number>;
	rightSidebarX: MotionValue<number>;
	rightSidebarOpacity: MotionValue<number>;
	dummySlice: BoxSlice;
	boxColors: BoxColors;
	scrollYProgress: MotionValue<number>;
}

// Screen component that wraps the entire demo with animated border
const Screen = memo(
	({
		scale,
		navbarY,
		navbarOpacity,
		leftSidebarX,
		leftSidebarOpacity,
		rightSidebarX,
		rightSidebarOpacity,
		dummySlice,
		boxColors,
		scrollYProgress,
	}: ScreenProps) => {
		// Border animation - appears after all UI elements are loaded
		const borderOpacity = useTransform(
			scrollYProgress,
			[0.4, 0.5], // Start after sidebars finish (at 40%) and complete by 50%
			[0, 1],
		);

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

				<DemoNavbar y={navbarY} opacity={navbarOpacity} />
				<DemoSidebarLeft x={leftSidebarX} opacity={leftSidebarOpacity} />
				<DemoSidebarRight x={rightSidebarX} opacity={rightSidebarOpacity} />
				{dummySlice && dummySlice.boxes.length > 0 && (
					<ResoBox3DCircular
						slice={dummySlice}
						boxColors={boxColors}
						className="h-full w-full absolute"
					/>
				)}
			</motion.div>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.scale === nextProps.scale &&
			prevProps.navbarY === nextProps.navbarY &&
			prevProps.navbarOpacity === nextProps.navbarOpacity &&
			prevProps.leftSidebarX === nextProps.leftSidebarX &&
			prevProps.leftSidebarOpacity === nextProps.leftSidebarOpacity &&
			prevProps.rightSidebarX === nextProps.rightSidebarX &&
			prevProps.rightSidebarOpacity === nextProps.rightSidebarOpacity &&
			prevProps.dummySlice === nextProps.dummySlice &&
			prevProps.boxColors === nextProps.boxColors &&
			prevProps.scrollYProgress === nextProps.scrollYProgress
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

	// Create a dummy slice for initialization
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

	// Simple scroll transformations - scaling completes first, then pause, then movement
	const scale = useTransform(scrollYProgress, [0, 1], [1.01, 0.5]); // Scaling completes at 70%
	// Pause from 70% to 85%, then movement from 85% to 95%
	const containerY = useTransform(scrollYProgress, [0.85, 0.95], [0, -1000]);

	// Sidebar animations - fade in and slide into position
	const leftSidebarX = useTransform(scrollYProgress, [0.2, 0.4], [-64, 0]); // Slide in from left
	const leftSidebarOpacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);

	const rightSidebarX = useTransform(scrollYProgress, [0.2, 0.4], [64, 0]); // Slide in from right
	const rightSidebarOpacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);

	// Navbar animations - slide down from top
	const navbarY = useTransform(scrollYProgress, [0.1, 0.4], [-56, 0]); // Slide down from top (navbar height is 56px)
	const navbarOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);

	return (
		<div ref={containerRef} className="relative">
			{/* Scaling Phase - Fixed Position */}
			<div className="h-[300vh] relative">
				<div className="sticky top-0 h-screen w-full flex items-center justify-center  ">
					{/* 3D Visualization - scales with CSS transform to preserve canvas shape */}
					<Screen
						scale={scale}
						navbarY={navbarY}
						navbarOpacity={navbarOpacity}
						leftSidebarX={leftSidebarX}
						leftSidebarOpacity={leftSidebarOpacity}
						rightSidebarX={rightSidebarX}
						rightSidebarOpacity={rightSidebarOpacity}
						dummySlice={dummySlice}
						boxColors={boxColors}
						scrollYProgress={scrollYProgress}
					/>
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
						<div className="max-w-4xl mx-auto space-y-16">
							{/* Header */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.2 }}
								className="text-center space-y-6"
							>
								<h2 className="font-outfit text-5xl lg:text-7xl font-bold text-white tracking-tight">
									Advanced Market
									<span className="block text-[#24FF66]">Visualization</span>
								</h2>
								<p className="font-outfit text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
									Experience multi-dimensional market analysis through our
									revolutionary 3D box visualization system.
								</p>
							</motion.div>

							{/* Feature Grid */}
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
								{[
									{
										title: "Real-time Analysis",
										description:
											"Live market data processed and visualized in real-time with sub-second latency.",
										icon: "📊",
									},
									{
										title: "Multi-Asset Support",
										description:
											"Analyze Bitcoin, Ethereum, Solana, and other major cryptocurrencies simultaneously.",
										icon: "🔄",
									},
									{
										title: "3D Nested Structures",
										description:
											"Understand complex market relationships through intuitive 3D nested box representations.",
										icon: "📦",
									},
									{
										title: "Interactive Controls",
										description:
											"Navigate between different market views and timeframes with smooth transitions.",
										icon: "🎮",
									},
									{
										title: "Technical Indicators",
										description:
											"Integrated RSI, MACD, and volatility metrics for comprehensive analysis.",
										icon: "📈",
									},
									{
										title: "Trading Insights",
										description:
											"AI-powered market analysis with support and resistance level identification.",
										icon: "🧠",
									},
								].map((feature, index) => (
									<motion.div
										key={feature.title}
										initial={{ opacity: 0, y: 30 }}
										whileInView={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: index * 0.1 }}
										className="group relative p-6 rounded-xl bg-gradient-to-b from-[#1C1E23]/40 to-[#0F1012]/20 border border-[#1C1E23]/30 hover:border-[#24FF66]/30 transition-all duration-300"
									>
										<div className="space-y-4">
											<div className="text-3xl">{feature.icon}</div>
											<h3 className="font-outfit text-xl font-semibold text-white group-hover:text-[#24FF66] transition-colors">
												{feature.title}
											</h3>
											<p className="font-outfit text-white/60 leading-relaxed">
												{feature.description}
											</p>
										</div>

										<div className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#24FF66]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
									</motion.div>
								))}
							</div>

							{/* Call to Action */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.6 }}
								className="text-center space-y-8"
							>
								<h3 className="font-outfit text-3xl font-bold text-white">
									Ready to explore the future of market analysis?
								</h3>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#24FF66] to-[#1ECC52] text-black font-outfit font-semibold rounded-full hover:shadow-[0_0_30px_rgba(36,255,102,0.3)] transition-all duration-300"
								>
									<span>Start Trading</span>
									<svg
										className="w-5 h-5"
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
							</motion.div>
						</div>
					</div>
				</section>
			</motion.div>
		</div>
	);
});

SectionBoxes3D.displayName = "SectionBoxes3D";
