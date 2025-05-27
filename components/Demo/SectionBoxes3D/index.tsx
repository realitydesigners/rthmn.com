"use client";

import { ResoBox3DCircular } from "@/components/Demo/ResoBox3DDemo";
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
import { memo, useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";

import { DemoNavbar } from "@/components/Navbars/DemoNavbar";
import { DemoSidebarLeft } from "@/components/Demo/DemoSidebarLeft";
import { DemoSidebarRight } from "@/components/Demo/DemoSidebarRight";

// Aurora Background Component - matches the one from SectionBoxes
const AuroraBackground = ({ dominantState }: { dominantState: string }) => {
	// Define colors using GRID.04 color scheme from color store
	const colors = {
		blue: {
			primary: "#24FF661F", // #24FF66 with 12% opacity - Matrix green for positive
			secondary: "#24FF6614", // #24FF66 with 8% opacity
			tertiary: "#24FF660A", // #24FF66 with 4% opacity
		},
		red: {
			primary: "#3032381F", // #303238 with 12% opacity - Dark gray for negative
			secondary: "#30323814", // #303238 with 8% opacity
			tertiary: "#3032380A", // #303238 with 4% opacity
		},
		neutral: {
			primary: "#24FF661F", // Default to matrix green
			secondary: "#24FF6614",
			tertiary: "#24FF660A",
		},
	};

	const currentColors =
		colors[dominantState as keyof typeof colors] || colors.neutral;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{
				opacity: 1,
			}}
			transition={{
				opacity: {
					duration: 2,
					ease: "easeInOut",
				},
			}}
			className="pointer-events-none absolute inset-0 overflow-hidden"
		>
			{/* Single subtle bottom glow */}
			<motion.div
				animate={{
					opacity: [0.6, 1, 0.6],
				}}
				transition={{
					opacity: {
						duration: 12,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					},
				}}
				className="absolute inset-0"
				style={
					{
						background: `linear-gradient(to top, 
						${currentColors.primary} 0%,
						${currentColors.secondary} 25%,
						${currentColors.tertiary} 50%,
						transparent 70%)`,
						filter: "blur(100px)",
					} as React.CSSProperties
				}
			/>
		</motion.div>
	);
};

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
			[0.6, 0.62], // Start after sidebars finish (at 40%) and complete by 50%
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

	// State to track the current BTC slice from ResoBox3DCircular
	const [currentBtcSlice, setCurrentBtcSlice] = useState<BoxSlice | null>(null);

	// Create initial BTC slice for the intro (will be updated by ResoBox3DCircular)
	const initialBtcSlice = useMemo(() => {
		const currentValues = createDemoStep(4, sequences, BASE_VALUES); // Use BTC's startOffset
		const mockBoxData = createMockBoxData(currentValues);
		return { timestamp: new Date().toISOString(), boxes: mockBoxData };
	}, []);

	// Use the current slice from ResoBox3DCircular if available, otherwise use initial
	const btcSlice = currentBtcSlice || initialBtcSlice;

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

	// Intro sequence timing:
	// 0-0.2: Scattered boxes with text
	// 0.2-0.5: Formation animation
	// 0.5+: UI elements start appearing
	const introTextOpacity = useTransform(
		scrollYProgress,
		[0, 0.1, 0.3, 0.5],
		[0, 1, 1, 0],
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
		Math.min(1, (currentScrollProgress - 0.2) / 0.3),
	);

	// Screen component animations (start after formation completes)
	// Scale animation happens in first part, then stays at final scale
	const scale = useTransform(scrollYProgress, [0.5, 0.7], [1.0, 0.7]);
	// Movement only happens at the very end to transition to content
	const containerY = useTransform(scrollYProgress, [0.95, 1], [0, -1000]);

	// UI element animations (start after formation completes)
	const leftSidebarX = useTransform(scrollYProgress, [0.5, 0.6], [-64, 0]);
	const leftSidebarOpacity = useTransform(scrollYProgress, [0.5, 0.6], [0, 1]);

	const rightSidebarX = useTransform(scrollYProgress, [0.5, 0.6], [64, 0]);
	const rightSidebarOpacity = useTransform(scrollYProgress, [0.5, 0.6], [0, 1]);

	const navbarY = useTransform(scrollYProgress, [0.5, 0.6], [-56, 0]);
	const navbarOpacity = useTransform(scrollYProgress, [0.5, 0.6], [0, 1]);

	return (
		<div ref={containerRef} className="relative">
			{/* Extended height for intro sequence and Screen interaction */}
			<div className="h-[500vh] relative">
				<div className="sticky top-0 h-screen w-full flex items-center justify-center relative">
					{/* Aurora Background - always present */}
					{/* <AuroraBackground dominantState={dominantState} /> */}

					{/* Hero Text */}
					<motion.div
						style={{ opacity: introTextOpacity }}
						className="absolute top-1/2 left-0 transform -translate-y-1/2 z-50 text-left pl-16 lg:pl-24"
					>
						{/* Main Title with Explosive Effect */}
						<motion.h1
							initial={{ scale: 0.5, opacity: 0, rotateX: -30 }}
							animate={{ scale: 1, opacity: 1, rotateX: 0 }}
							transition={{
								duration: 2,
								delay: 0.5,
								ease: [0.16, 1, 0.3, 1],
								scale: { type: "spring", stiffness: 80, damping: 12 },
							}}
							className="font-russo text-6xl lg:text-8xl xl:text-9xl font-black text-white tracking-tighter leading-[0.8] mb-6 relative"
							style={{
								textShadow:
									"0 0 60px rgba(255,255,255,0.15), 0 0 120px rgba(255,255,255,0.08)",
								filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))",
								WebkitTextStroke: "2px rgba(255,255,255,0.1)",
							}}
						>
							{/* First word with stagger effect */}
							<motion.div className="overflow-hidden">
								<motion.span
									initial={{ y: 200, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{
										duration: 1.2,
										delay: 1,
										ease: [0.25, 0.46, 0.45, 0.94],
									}}
									className="block"
								>
									MARKET
								</motion.span>
							</motion.div>

							{/* Second word with different timing */}
							<motion.div className="overflow-hidden">
								<motion.span
									initial={{ y: 200, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{
										duration: 1.2,
										delay: 1.3,
										ease: [0.25, 0.46, 0.45, 0.94],
									}}
									className="block relative"
								>
									DECODED
									{/* Glitch effect overlay */}
									<motion.span
										initial={{ opacity: 0 }}
										animate={{
											opacity: [0, 0.3, 0],
											x: [0, 2, -2, 0],
											filter: [
												"hue-rotate(0deg)",
												"hue-rotate(90deg)",
												"hue-rotate(0deg)",
											],
										}}
										transition={{
											duration: 0.2,
											delay: 2.5,
											repeat: 3,
											repeatDelay: 0.8,
										}}
										className="absolute inset-0 text-white mix-blend-difference"
									>
										DECODED
									</motion.span>
								</motion.span>
							</motion.div>

							{/* Floating particles around text */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 1, delay: 3 }}
								className="absolute inset-0 pointer-events-none"
							>
								{[...Array(12)].map((_, i) => (
									<motion.div
										key={`text-particle-${Date.now()}-${i}`}
										initial={{ opacity: 0, scale: 0 }}
										animate={{
											opacity: [0, 1, 0],
											scale: [0, 1, 0],
											x: [0, (Math.random() - 0.5) * 400],
											y: [0, (Math.random() - 0.5) * 300],
										}}
										transition={{
											duration: 3,
											delay: 3 + i * 0.1,
											repeat: Number.POSITIVE_INFINITY,
											repeatDelay: 4,
										}}
										className="absolute w-1 h-1 bg-white rounded-full"
										style={{
											left: "50%",
											top: "50%",
										}}
									/>
								))}
							</motion.div>
						</motion.h1>

						{/* Subtitle and Content */}
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{
								duration: 1.2,
								delay: 2.5,
								ease: [0.25, 0.46, 0.45, 0.94],
							}}
							className="max-w-2xl space-y-6"
						>
							<motion.p className="font-outfit text-xl lg:text-2xl font-light text-white/80 leading-relaxed tracking-wide">
								Where chaos becomes clarity
							</motion.p>

							<motion.p
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 1, delay: 3.2 }}
								className="font-outfit text-lg text-white/60 leading-relaxed max-w-xl"
							>
								Experience the future of market analysis through our
								revolutionary 3D visualization engine. Transform complex data
								into actionable insights with unprecedented clarity.
							</motion.p>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 1, delay: 3.8 }}
								className="pt-4"
							>
								<motion.button
									whileHover={{
										scale: 1.05,
										boxShadow: "0 0 30px rgba(255,255,255,0.2)",
									}}
									whileTap={{ scale: 0.95 }}
									className="group relative px-8 py-4 bg-white text-black font-outfit font-semibold text-lg rounded-full overflow-hidden transition-all duration-300"
								>
									<span className="relative z-10">Explore the Platform</span>

									{/* Button glow effect */}
									<motion.div
										className="absolute inset-0 bg-gradient-to-r from-white to-gray-100"
										initial={{ scale: 1 }}
										whileHover={{ scale: 1.05 }}
										transition={{ duration: 0.3 }}
									/>

									{/* Arrow icon */}
									<motion.svg
										className="inline-block w-5 h-5 ml-2 relative z-10"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										initial={{ x: 0 }}
										whileHover={{ x: 5 }}
										transition={{ duration: 0.3 }}
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13 7l5 5m0 0l-5 5m5-5H6"
										/>
									</motion.svg>
								</motion.button>
							</motion.div>
						</motion.div>

						{/* Ambient light rays */}
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 0.6, scale: 1.2 }}
							transition={{ duration: 3, delay: 1 }}
							className="absolute inset-0 pointer-events-none"
							style={{
								background:
									"radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)",
								filter: "blur(40px)",
							}}
						/>
					</motion.div>

					{/* Single continuous experience with Screen wrapper */}
					<Screen
						scale={scale}
						scrollYProgress={scrollYProgress}
						showScreen={true}
					>
						<DemoNavbar y={navbarY} opacity={navbarOpacity} />
						<DemoSidebarLeft x={leftSidebarX} opacity={leftSidebarOpacity} />
						<DemoSidebarRight x={rightSidebarX} opacity={rightSidebarOpacity} />
						{btcSlice && btcSlice.boxes.length > 0 && (
							<ResoBox3DCircular
								slice={btcSlice}
								boxColors={boxColors}
								className="h-full w-full absolute"
								onDominantStateChange={setDominantState}
								onCurrentSliceChange={setCurrentBtcSlice}
								showOnlyBTC={formationProgress < 1}
								introMode={formationProgress < 1}
								formationProgress={formationProgress}
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
