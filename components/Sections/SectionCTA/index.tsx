"use client";

import { StartButton } from "@/components/Sections/StartNowButton";
import { motion } from "framer-motion";

export const SectionCTA = () => {
	return (
		<section className="relative overflow-hidden bg-black py-24 sm:py-32">
			{/* Content Wrapper */}
			<div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.1 }}
					viewport={{ once: true }}
					className="relative"
				>
					{/* Main heading */}
					<h2 className="font-russo mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl uppercase">
						Ready to Elevate Your Trading?
					</h2>
					
					{/* Subheading */}
					<p className="font-kodemono mx-auto mt-6 max-w-2xl text-lg text-white/60 leading-relaxed">
						Join RTHMN today and start identifying high-probability patterns
						with confidence. Gain your edge.
					</p>
					
					{/* Features list */}
					<div className="mx-auto mt-8 mb-12 max-w-2xl">
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
							<div className="flex items-center justify-center gap-2">
								<div className="h-2 w-2 rounded-full bg-[#24FF66]"></div>
								<span className="text-sm text-white/80 font-kodemono">Real-time Analysis</span>
							</div>
							<div className="flex items-center justify-center gap-2">
								<div className="h-2 w-2 rounded-full bg-[#24FF66]"></div>
								<span className="text-sm text-white/80 font-kodemono">Advanced Patterns</span>
							</div>
							<div className="flex items-center justify-center gap-2">
								<div className="h-2 w-2 rounded-full bg-[#24FF66]"></div>
								<span className="text-sm text-white/80 font-kodemono">Expert Insights</span>
							</div>
						</div>
					</div>
					
					{/* Button */}
					<div className="flex justify-center">
						<StartButton href="/pricing" variant="shimmer">
							Get Started
						</StartButton>
					</div>
				</motion.div>
			</div>
		</section>
	);
};
