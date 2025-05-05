"use client";

import { StartButton } from "@/components/Sections/StartNowButton";
import type { CandleData } from "@/types/types";
import { motion } from "framer-motion";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { useInView } from "react-intersection-observer";

// Types
interface MarketData {
	pair: string;
	lastUpdated: string;
	candleData: string;
}

interface ProcessedMarketData {
	price: number;
	change: number;
	volume: number;
	points: number[];
}

interface CardPosition {
	x: number;
	y: number;
	z: number;
}

// Constants
// Desktop positions (values need scaling)
const CARD_POSITIONS: CardPosition[] = [
	{ x: -1800, y: -700, z: 10 }, // Top-left far
	{ x: -1300, y: -400, z: 40 }, // Top-left closer
	{ x: -800, y: -600, z: 25 }, // Top-left mid
	{ x: 1200, y: -700, z: 15 }, // Top-right far
	{ x: 1300, y: -100, z: 45 }, // Top-right closer
	{ x: 800, y: -600, z: 30 }, // Top-right mid
	{ x: -1600, y: 600, z: 35 }, // Bottom-left far
	{ x: -1100, y: 700, z: 20 }, // Bottom-left closer
	{ x: -600, y: 550, z: 50 }, // Bottom-left mid
	{ x: 1200, y: 200, z: 20 }, // Bottom-right far
	{ x: 1100, y: 700, z: 40 }, // Bottom-right closer
	{ x: 600, y: 550, z: 30 }, // Bottom-right mid
];

// Mobile positions (direct pixel offsets, no scaling needed)
const CARD_MOBILE_POSITIONS: CardPosition[] = [
	{ x: -160, y: -310, z: 20 }, // Top-left
	{ x: 160, y: -310, z: 25 }, // Top-right
	{ x: -200, y: 0, z: 30 }, // Mid-left
	{ x: 200, y: 0, z: 35 }, // Mid-right
	{ x: -160, y: 260, z: 25 }, // Bottom-left
	{ x: 160, y: 310, z: 20 }, // Bottom-right
];

const ANIMATION_DURATION = 10000;

const POSITION_SCALE = {
	// MOBILE: 0.2, // No longer needed
	DESKTOP: 0.55,
};

// Add default position
const DEFAULT_POSITION: CardPosition = { x: 0, y: 0, z: 0 };

// Add these new constants at the top
const HOVER_TRANSITION = { duration: 0.3, ease: "easeOut" };
const FLOAT_ANIMATION = {
	duration: { min: 3, max: 4 },
	delay: { min: 0.2, max: 0.3 },
};

// Add new types for better type safety
interface AnimationConfig {
	duration: number;
	delay: number;
}

interface FloatAnimation {
	y: AnimationConfig;
	x: AnimationConfig;
}

// Add new animation constants
const CARD_ANIMATION = {
	INITIAL_SCALE: 0.85,
	HOVER_SCALE: 0.95,
	FLOAT_RANGE: { x: 5, y: 10 },
	ROTATION: { x: 5, y: -5 },
};

// Re-add helper function to add random jitter
const addRandomJitter = (value: number, maxOffsetScale = 0.0001): number => {
	if (typeof value !== "number" || !Number.isFinite(value)) return value;
	const valueString = String(value);
	const decimalIndex = valueString.indexOf(".");
	const originalPrecision =
		decimalIndex === -1 ? 0 : valueString.length - decimalIndex - 1;
	const precision = Math.min(originalPrecision, 8);
	const maxOffset = Math.abs(value * maxOffsetScale);
	const offset = (Math.random() - 0.5) * 2 * maxOffset;
	const newValue = value + offset;
	return Number.parseFloat(newValue.toFixed(precision));
};

// Memoize the MarketHeading component
const MarketHeading = memo(() => (
	<div className="relative z-20 text-center">
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
		>
			<div className="mb-8">
				<h2 className="font-outfit text-neutral-gradient relative text-[3em] leading-[1em] font-bold tracking-tight sm:text-[5em] lg:text-[7em]">
					Find Patterns.
					<br />
					Unlock Your Edge.
				</h2>
				<p className="font-outfit text-md text-neutral-gradient mx-auto max-w-2xl px-4 sm:text-lg lg:text-2xl">
					Enter a new dimension to trading and discover the same patterns you
					already trade, visualized in a way never seen before.
				</p>
			</div>

			{/* Updated CTA buttons */}
			<div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
				<StartButton href="#pricing" variant="shimmer">
					Get Started
				</StartButton>
			</div>
		</motion.div>
	</div>
));

MarketHeading.displayName = "MarketHeading";

// Memoize SparklineChart
const SparklineChart = memo(
	({ data, change }: { data: number[]; change: number }) => {
		const { ref, inView } = useInView({
			threshold: 0,
			triggerOnce: true,
			delay: 100,
		});

		const pathData = useMemo(() => {
			if (!data?.length) return null;

			const minValue = Math.min(...data);
			const maxValue = Math.max(...data);
			const range = maxValue - minValue;

			return data
				.map(
					(p, i) =>
						`${(i / (data.length - 1)) * 200} ${60 - ((p - minValue) / range) * 60}`,
				)
				.join(" L ");
		}, [data]);

		if (!pathData) return null;

		return (
			<div ref={ref} className="h-full w-full">
				<svg
					width="100%"
					height="100%"
					viewBox="0 0 200 60"
					preserveAspectRatio="none"
					className="overflow-visible"
					aria-labelledby="sparkline-title"
					role="img"
				>
					<title id="sparkline-title">Sparkline Chart</title>
					<defs>
						<linearGradient
							id={`gradient-${change}`}
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="0%"
								stopColor={change >= 0 ? "#4ade80" : "#f87171"}
								stopOpacity="0.8"
							/>
							<stop
								offset="100%"
								stopColor={change >= 0 ? "#4ade80" : "#f87171"}
								stopOpacity="0.2"
							/>
						</linearGradient>
					</defs>

					<path
						d={`M ${pathData}`}
						fill="none"
						stroke={`url(#gradient-${change})`}
						strokeWidth="2"
						vectorEffect="non-scaling-stroke"
						className={inView ? "animate-fadeIn" : "opacity-0"}
					/>

					<path
						d={`M ${pathData}`}
						fill="none"
						stroke={`url(#gradient-${change})`}
						strokeWidth="2"
						vectorEffect="non-scaling-stroke"
						className={inView ? "animate-drawLine" : "opacity-0"}
						style={{
							strokeDasharray: "1000",
							strokeDashoffset: "1000",
						}}
					/>

					{data.length > 0 && (
						<circle
							cx={200}
							cy={
								60 -
								((data[data.length - 1] - Math.min(...data)) /
									(Math.max(...data) - Math.min(...data))) *
									60
							}
							r="3"
							fill={change >= 0 ? "#4ade80" : "#f87171"}
							className={inView ? "animate-dotAppear" : "opacity-0"}
						/>
					)}
				</svg>
			</div>
		);
	},
);

SparklineChart.displayName = "SparklineChart";

// Memoize CardContent
const CardContent = memo(
	({ item, data }: { item: MarketData; data: ProcessedMarketData }) => {
		const [isLoading, setIsLoading] = useState(true);

		useEffect(() => {
			const timer = setTimeout(() => setIsLoading(false), 0);
			return () => clearTimeout(timer);
		}, []);

		if (isLoading) {
			return (
				<div className="flex h-full items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
				</div>
			);
		}

		return (
			<div className="relative z-10">
				<div className="mb-2 flex items-start justify-between">
					<h4 className="text-sm font-medium text-white">
						{item.pair.replace("_", "/")}
					</h4>
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className={`rounded-full px-2 py-0.5 text-xs ${data.change >= 0 ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}`}
					>
						{data.change.toFixed(2)}%
					</motion.div>
				</div>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="mb-3 text-xl font-bold text-white tabular-nums"
				>
					{data.price.toFixed(item.pair.includes("JPY") ? 3 : 5)}
				</motion.div>
				<div className="h-12 w-full">
					<SparklineChart data={data.points} change={data.change} />
				</div>
			</div>
		);
	},
);

CardContent.displayName = "CardContent";

// 1. First, let's create a custom hook to handle the animation frame
const useAnimationProgress = (duration: number) => {
	const [progress, setProgress] = useState(0);
	const [isClient, setIsClient] = useState(false);
	const frameRef = useRef<number | null>(null);

	useEffect(() => {
		setIsClient(true);
		return () => {
			if (frameRef.current) cancelAnimationFrame(frameRef.current);
		};
	}, []);

	useEffect(() => {
		if (!isClient) return;

		const startTime = Date.now();
		const animate = () => {
			const elapsed = Date.now() - startTime;
			const currentProgress = Math.min(elapsed / duration, 1);
			setProgress(currentProgress);

			if (currentProgress < 1) {
				frameRef.current = requestAnimationFrame(animate);
			}
		};

		frameRef.current = requestAnimationFrame(animate);
		return () => {
			if (frameRef.current) cancelAnimationFrame(frameRef.current);
		};
	}, [isClient, duration]);

	return progress;
};

// 2. Create a memoized transform component to handle card positioning
const CardTransform = memo(
	({
		children,
		position,
		index,
		change,
	}: {
		children: React.ReactNode;
		position: CardPosition;
		index: number;
		change: number;
	}) => {
		const [isMobile, setIsMobile] = useState(false);

		useEffect(() => {
			const checkMobile = () => {
				setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
			};

			checkMobile();
			window.addEventListener("resize", checkMobile);
			return () => window.removeEventListener("resize", checkMobile);
		}, []);

		const floatAnimation: FloatAnimation = useMemo(
			() => ({
				y: {
					duration: FLOAT_ANIMATION.duration.min + (index % 3),
					delay: index * FLOAT_ANIMATION.delay.min,
				},
				x: {
					duration: FLOAT_ANIMATION.duration.max + (index % 2),
					delay: index * FLOAT_ANIMATION.delay.max,
				},
			}),
			[index],
		);

		// Calculate final positions based on mobile state
		const targetX = isMobile ? position.x : position.x * POSITION_SCALE.DESKTOP;
		const targetY = isMobile ? position.y : position.y * POSITION_SCALE.DESKTOP;

		// Define animation variants based on mobile state
		const animateProps = {
			y: isMobile
				? targetY
				: targetY + Math.sin(index * 0.8) * CARD_ANIMATION.FLOAT_RANGE.y,
			x: isMobile
				? targetX
				: targetX + Math.cos(index * 0.5) * CARD_ANIMATION.FLOAT_RANGE.x,
			opacity: 1,
			transition: isMobile
				? {
						// Mobile: Simple fade-in
						opacity: {
							duration: 0.5,
							delay: index * 0.1,
						},
					}
				: {
						// Desktop: Floating + fade-in
						y: {
							duration: floatAnimation.y.duration,
							repeat: Number.POSITIVE_INFINITY,
							repeatType: "reverse",
							ease: "easeInOut",
							delay: floatAnimation.y.delay,
						},
						x: {
							duration: floatAnimation.x.duration,
							repeat: Number.POSITIVE_INFINITY,
							repeatType: "reverse",
							ease: "easeInOut",
							delay: floatAnimation.x.delay,
						},
						opacity: {
							duration: 0.5,
							delay: index * 0.1,
						},
					},
		};

		return (
			<motion.div
				className="absolute top-1/2 left-1/2 h-[130px] w-[160px] -translate-x-1/2 -translate-y-1/2 cursor-pointer will-change-transform sm:h-[160px] sm:w-[180px]"
				initial={{
					x: targetX,
					y: targetY,
					z: position.z, // Use z directly
					scale: CARD_ANIMATION.INITIAL_SCALE,
					rotateX: (index % 3) * CARD_ANIMATION.ROTATION.x,
					rotateY: (index % 2) * CARD_ANIMATION.ROTATION.y,
					opacity: 0,
				}}
				animate={animateProps} // Use the conditional animateProps
				whileHover={{
					scale: CARD_ANIMATION.HOVER_SCALE,
					z: position.z + 100, // Use z directly
					rotateX: 0,
					rotateY: 0,
					transition: HOVER_TRANSITION,
				}}
				style={{
					transformStyle: "preserve-3d",
					backfaceVisibility: "hidden",
				}}
			>
				{children}
			</motion.div>
		);
	},
);

CardTransform.displayName = "CardTransform";

// 3. Optimize the market card data processing
const useProcessedMarketData = (marketData: MarketData[], progress: number) => {
	return useMemo(() => {
		const cache = new Map<string, ProcessedMarketData>();

		return marketData
			.map((item) => {
				const cacheKey = `${item.pair}-${progress}`;
				if (!cache.has(cacheKey)) {
					try {
						const data = JSON.parse(item.candleData) as CandleData[];
						if (!data?.length) return null;

						const dataPoints = Math.floor(data.length * progress);
						const animatedData = data.slice(0, Math.max(2, dataPoints + 1));

						const latest = animatedData[animatedData.length - 1];
						const first = data[0];
						const change =
							((Number.parseFloat(latest.mid.c) -
								Number.parseFloat(first.mid.o)) /
								Number.parseFloat(first.mid.o)) *
							100;

						const processed = {
							price: Number.parseFloat(latest.mid.c),
							change,
							volume: latest.volume,
							points: animatedData.map((d) => Number.parseFloat(d.mid.c)),
						};

						cache.set(cacheKey, processed);
					} catch {
						return null;
					}
				}

				const cachedData = cache.get(cacheKey);
				if (!cachedData) {
					console.error(`Cache miss for key: ${cacheKey}`);
					return null;
				}

				return {
					item,
					data: cachedData,
				};
			})
			.filter(
				(item): item is { item: MarketData; data: ProcessedMarketData } =>
					item !== null,
			);
	}, [marketData, progress]);
};

// 4. Update the main component to use these optimizations
export const SectionMarketDisplay = memo(
	({ marketData }: { marketData: MarketData[] }) => {
		const { ref, inView } = useInView({
			threshold: 0.1, // Trigger when 10% of the section is visible
			triggerOnce: false, // Keep monitoring visibility
		});

		const progress = useAnimationProgress(ANIMATION_DURATION);
		const rawProcessedData = useProcessedMarketData(marketData, progress);

		// Add mobile detection here
		const [isMobile, setIsMobile] = useState(false);
		useEffect(() => {
			const checkMobile = () => {
				setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
			};
			checkMobile(); // Initial check
			window.addEventListener("resize", checkMobile);
			return () => window.removeEventListener("resize", checkMobile);
		}, []);

		// Choose position array based on mobile state
		const chosenPositions = useMemo(() => {
			return isMobile ? CARD_MOBILE_POSITIONS : CARD_POSITIONS;
		}, [isMobile]);

		// Re-introduce displayData state
		const [displayData, setDisplayData] = useState(() => {
			const limit = chosenPositions.length;
			// Initialize based on initial raw data
			return rawProcessedData.slice(0, limit);
		});

		// Effect to update displayData during animation
		useEffect(() => {
			if (progress < 1) {
				const limit = chosenPositions.length;
				setDisplayData(rawProcessedData.slice(0, limit));
			}
			// Initialize if state is empty and raw data is available (handles edge cases)
			else if (displayData.length === 0 && rawProcessedData.length > 0) {
				const limit = chosenPositions.length;
				setDisplayData(rawProcessedData.slice(0, limit));
			}
		}, [progress, rawProcessedData, chosenPositions, displayData.length]);

		// Effect for post-animation randomization (Slow and Subtle Jitter)
		useEffect(() => {
			let intervalId: NodeJS.Timeout | null = null;
			if (progress === 1 && inView && displayData.length > 0) {
				intervalId = setInterval(() => {
					setDisplayData((currentDisplayData) => {
						if (!currentDisplayData || currentDisplayData.length === 0)
							return [];
						return currentDisplayData.map(({ item, data }) => {
							if (!data) return { item, data };
							const randomizedData: ProcessedMarketData = {
								...data,
								// Use addRandomJitter with small scales
								price: addRandomJitter(data.price, 0.0001),
								change: addRandomJitter(data.change, 0.01),
							};
							return { item, data: randomizedData };
						});
					});
				}, 2500); // Slow interval (2.5 seconds)
			}
			return () => {
				if (intervalId) clearInterval(intervalId);
			};
		}, [progress, inView, displayData.length]);

		// Grid background style
		const gridStyle = {
			backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
        `,
			backgroundSize: "60px 60px", // Adjusted size for better visual density
		};

		return (
			<section
				ref={ref}
				className="relative min-h-screen overflow-hidden bg-black" // Ensure base bg color
				style={gridStyle} // Apply grid style
			>
				{/* Center content wrapper */}
				<div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
					{/* Centered heading */}
					<div className="absolute top-1/2 left-1/2 z-20 w-full max-w-6xl -translate-x-1/2 -translate-y-1/2 transform px-4">
						<MarketHeading />
					</div>
					{/* 3D Cards Container */}
					<div className="absolute inset-0 z-10">
						<div className="relative h-full [perspective:2500px]">
							{/* Render using displayData */}
							{inView &&
								displayData.map(({ item, data }, index) => {
									if (!data) return null;
									return (
										<CardTransform
											key={item.pair}
											position={chosenPositions[index] || DEFAULT_POSITION}
											index={index}
											change={data.change}
										>
											<div className="relative h-full w-full rounded-xl border border-white/10 bg-black/60 p-4 backdrop-blur-md transition-all duration-300 group-hover:bg-black/80">
												<CardContent item={item} data={data} />
											</div>
										</CardTransform>
									);
								})}
						</div>
					</div>
				</div>
			</section>
		);
	},
);

SectionMarketDisplay.displayName = "SectionMarketDisplay";
