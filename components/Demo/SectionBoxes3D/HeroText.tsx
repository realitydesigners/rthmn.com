"use client";

import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { memo } from "react";

interface HeroTextProps {
	opacity?: MotionValue<number> | number;
}

export const HeroText = memo(({ opacity = 1 }: HeroTextProps) => {
	return (
		<motion.div
			style={{ opacity }}
			className="absolute top-1/2 left-0 transform -translate-y-1/2  flex  flex-col items-center justify-center z-50 text-left lg:pl-16 lg:pl-24"
		>
			<motion.h1
				initial={{ scale: 0.5, rotateX: -30 }}
				animate={{ scale: 1, rotateX: 0 }}
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
						initial={{ y: 200 }}
						animate={{ y: 0 }}
						transition={{
							duration: 1.2,
							delay: 0.1,
							ease: [0.25, 0.46, 0.45, 0.94],
						}}
						className="block"
					>
						TRADE
					</motion.span>
				</motion.div>

				{/* Second word with different timing */}
				<motion.div className="overflow-hidden">
					<motion.span
						initial={{ y: 200 }}
						animate={{ y: 0 }}
						transition={{
							duration: 1.2,
							delay: 0.2,
							ease: [0.25, 0.46, 0.45, 0.94],
						}}
						className="block"
					>
						SMARTER
					</motion.span>
				</motion.div>
			</motion.h1>

			{/* Subtitle and Content - No opacity animations */}
			<motion.div
				initial={{ y: 20 }}
				animate={{ y: 0 }}
				transition={{
					duration: 1,
					delay: 1.5,
					ease: "easeOut",
				}}
				className="flex  flex-col px-12"
			>
				<p className="font-outfit text-xl text-white/80 leading-relaxed max-w-xl">
					Turn market chaos into profitable trades. Our revolutionary 3D
					visualization reveals hidden opportunities and gives you the unfair
					advantage every trader needs.
				</p>

				<motion.div
					initial={{ y: 15 }}
					animate={{ y: 0 }}
					transition={{
						duration: 0.8,
						delay: 2.2,
						ease: "easeOut",
					}}
					className="pt-4"
				>
					<motion.button
						whileHover={{
							scale: 1.05,
							transition: { duration: 0.2 },
						}}
						whileTap={{ scale: 0.95 }}
						className="group relative px-8 py-4 bg-[#24FF66] text-black font-outfit font-bold text-lg rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(36,255,102,0.4)]"
					>
						<span className="relative z-10">Start Winning Trades</span>

						{/* Simplified Arrow */}
						<motion.svg
							className="inline-block w-5 h-5 ml-2 relative z-10"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							whileHover={{ x: 3 }}
							transition={{ duration: 0.2 }}
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
		</motion.div>
	);
});

HeroText.displayName = "HeroText";
