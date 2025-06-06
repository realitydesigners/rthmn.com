"use client";

import { motion } from "framer-motion";
import { FaChartBar, FaChartLine, FaCoins } from "react-icons/fa";

const MARKETS = [
	{
		title: "Forex Markets",
		icon: FaChartLine,
		stats: "83% accuracy",
		description:
			"Spot major currency moves before they develop. Perfect for both scalping and swing trading.",
		highlight: "EUR/USD • GBP/USD • USD/JPY",
	},
	{
		title: "Stock Markets",
		icon: FaChartBar,
		stats: "Real-time alerts",
		description:
			"Know exactly when stocks are about to break out or reverse. Avoid false signals that trap most traders.",
		highlight: "US500 • NASDAQ • DOW30",
	},
	{
		title: "Crypto Markets",
		icon: FaCoins,
		stats: "24/7 monitoring",
		description:
			"Navigate crypto volatility with confidence. Stay on the right side of major moves.",
		highlight: "BTC • ETH • SOL",
	},
];

export function SectionAboutAlgorithm() {
	return (
		<section className="relative z-100 px-8 px-[5vw] py-12 xl:px-[15vw] 2xl:px-[15vw]">
			<div className="relative rounded-xl border border-[#1C1E23] bg-black/90 p-6 backdrop-blur-md">
				{/* Effects */}
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_30%)]" />
					<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#BFC2CA] to-transparent" />
				</div>

				<div className="mb-8 text-center">
					<h2 className="font-russo bg-linear-to-r from-white via-white/90 to-white/80 bg-clip-text py-8 text-5xl font-bold text-transparent">
						Multi-Market Analysis
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-white/60">
						Our algorithm adapts to different market conditions, providing
						accurate signals across multiple assets.
					</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{MARKETS.map((market, index) => (
						<motion.div
							key={market.title}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="group relative overflow-hidden rounded-lg border border-[#1C1E23] bg-black/40 p-6 hover:border-[#1C1E23]"
						>
							<div className="mb-4 flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-400/20 bg-blue-400/10">
										<market.icon className="h-5 w-5 text-blue-400" />
									</div>
									<h3 className="font-russo text-xl font-semibold text-white/90">
										{market.title}
									</h3>
								</div>
								<span className="rounded-full bg-blue-400/10 px-3 py-1 text-sm font-medium text-blue-400">
									{market.stats}
								</span>
							</div>

							<p className="mb-4 text-base text-white/70">
								{market.description}
							</p>

							<div className="font-kodemono  text-sm primary-text">
								{market.highlight}
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
