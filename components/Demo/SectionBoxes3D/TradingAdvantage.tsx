"use client";

import { motion } from "framer-motion";
import { memo } from "react";

export const TradingAdvantage = memo(() => {
	return (
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
							YOUR TRADING
							<span className="block text-[#24FF66] mt-2">EDGE UNLEASHED</span>
						</h2>
						<p className="font-outfit text-lg lg:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
							Stop losing money to the market. Our 3D visualization reveals what
							other traders can't see - giving you the split-second advantage
							that turns losses into wins.
						</p>
					</motion.div>

					{/* Feature Grid */}
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
						{[
							{
								title: "Instant Market Edge",
								description:
									"Spot profitable opportunities in milliseconds. Our real-time 3D analysis reveals market moves before they happen, giving you first-mover advantage.",
								category: "PROFIT",
							},
							{
								title: "Multi-Asset Domination",
								description:
									"Trade Bitcoin, Ethereum, Forex, and stocks from one unified dashboard. Never miss a profitable trade across any market again.",
								category: "OPPORTUNITY",
							},
							{
								title: "Smart Money Insights",
								description:
									"See exactly where big money is flowing. Our 3D structures reveal institutional moves so you can follow the smart money and profit.",
								category: "INTELLIGENCE",
							},
							{
								title: "Risk-Free Confidence",
								description:
									"Know exactly when to enter and exit trades. Our precision signals eliminate guesswork and protect your capital from devastating losses.",
								category: "PROTECTION",
							},
							{
								title: "Professional Analytics",
								description:
									"Get institutional-grade tools that hedge funds pay millions for. Level the playing field and trade like the pros do.",
								category: "ADVANTAGE",
							},
							{
								title: "AI Trading Assistant",
								description:
									"Our AI identifies support, resistance, and breakout levels automatically. Get personalized trade recommendations that actually work.",
								category: "AUTOMATION",
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
										<span className="font-russo text-xs font-semibold text-[#24FF66] uppercase tracking-wider">
											{feature.category}
										</span>
									</div>

									{/* Title */}
									<h3 className="font-russo text-lg lg:text-xl font-bold text-white group-hover:text-[#24FF66] transition-colors duration-300 uppercase tracking-tight">
										{feature.title}
									</h3>

									{/* Description */}
									<p className="font-russo text-sm lg:text-base text-white/60 leading-relaxed group-hover:text-white/80 transition-colors duration-300">
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
							{
								value: "89%",
								label: "Win Rate",
								sublabel: "Average trader success",
							},
							{ value: "$47K", label: "Avg Profit", sublabel: "Per month" },
							{
								value: "< 50ms",
								label: "Execution",
								sublabel: "Lightning fast",
							},
							{
								value: "24/7",
								label: "Opportunities",
								sublabel: "Never miss trades",
							},
						].map((stat, index) => (
							<motion.div
								key={stat.label}
								initial={{ opacity: 0, scale: 0.9 }}
								whileInView={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
								className="text-center group"
							>
								<div className="space-y-2">
									<div className="font-russo text-3xl lg:text-4xl font-black text-[#24FF66] tracking-tighter group-hover:scale-110 transition-transform duration-300">
										{stat.value}
									</div>
									<div className="space-y-1">
										<div className="font-russo text-sm font-semibold text-white uppercase tracking-wider">
											{stat.label}
										</div>
										<div className="font-russo text-xs text-white/50">
											{stat.sublabel}
										</div>
									</div>
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
							Ready to start making money?
						</h3>

						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#24FF66] to-[#1ECC52] text-black font-russo font-bold rounded-xl hover:shadow-[0_0_30px_rgba(36,255,102,0.3)] transition-all duration-300"
							>
								<span>Claim Your Edge</span>
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
								className="group relative inline-flex items-center gap-3 px-8 py-4 border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm text-white font-russo font-semibold rounded-xl hover:border-[#32353C]/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300"
							>
								<span>See Live Profits</span>
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
										d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
									/>
								</svg>
							</motion.button>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
});

TradingAdvantage.displayName = "TradingAdvantage";
