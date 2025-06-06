"use client";

import { StartButton } from "@/components/Sections/StartNowButton";
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
			className="absolute top-1/2 left-1/2 lg:left-0 transform -translate-x-1/2 lg:translate-x-0 -translate-y-1/2 flex flex-col items-center lg:items-start justify-center z-50 text-center lg:text-left lg:pl-16 xl:pl-24 px-4 lg:px-0"
		>
			<h1
				className="font-russo text-6xl lg:text-8xl xl:text-9xl font-black text-white tracking-tighter leading-[0.8] mb-6 relative"
				
			
			>
				<span className="block text-6xl lg:text-8xl xl:text-9xl">TRADE</span>
				<span className="block text-6xl lg:text-8xl xl:text-9xl">SMARTER</span>
			</h1>

			<div className="flex flex-col px-0 ">
				<p className="font-outfit text-lg lg:text-xl text-white/80 leading-relaxed lg:max-w-xl">
				
					Our revolutionary 3D visualization reveals hidden opportunities and gives you the unfair
					advantage every trader needs. 
				</p>

				<div className="pt-4">
					<StartButton href="/pricing" variant="shimmer">
						Start Winning Trades
					</StartButton>
				</div>
			</div>
		</motion.div>
	);
});

HeroText.displayName = "HeroText";
