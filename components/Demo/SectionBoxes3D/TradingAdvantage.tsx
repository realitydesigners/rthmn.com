"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { memo } from "react";

export const TradingAdvantage = memo(() => {
	return (
		<section className="relative min-h-screen w-full pt-16 sm:pt-24">
			<div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
				<div className="max-w-7xl mx-auto space-y-12 sm:space-y-20">
					{/* Header */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="text-center space-y-4 sm:space-y-8"
					>
						<h2 className="font-russo text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-black text-white tracking-tighter leading-[0.85] uppercase">
							A NEW TRADING
							<span className="block text-[#24FF66] mt-1 sm:mt-2">
								PARADIGM
							</span>
						</h2>
						<p className="font-outfit text-base sm:text-lg lg:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
							Start seeing what other traders can't see. Gain a split-second
							advantage that turns losses into wins.
						</p>
					</motion.div>

					{/* Feature Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
							<div
								key={feature.title}
								className="group relative overflow-hidden rounded-xl border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[#24FF66]/30 transition-all duration-500 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
							>
								{/* Background glow */}
								<div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

								{/* Top highlight */}
								<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

								{/* Hover glow effect */}
								<div className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#24FF66]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

								<div className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4">
									{/* Category badge */}
									<div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-[#24FF66]/20 to-[#24FF66]/10 border border-[#24FF66]/30">
										<span className="font-russo text-xs font-semibold text-[#24FF66] uppercase tracking-wider">
											{feature.category}
										</span>
									</div>

									{/* Title */}
									<h3 className="font-russo text-base sm:text-lg lg:text-xl font-bold text-white group-hover:text-[#24FF66] transition-colors duration-300 uppercase tracking-tight leading-tight">
										{feature.title}
									</h3>

									{/* Description */}
									<p className="font-russo text-sm lg:text-base text-white/60 leading-relaxed group-hover:text-white/80 transition-colors duration-300">
										{feature.description}
									</p>

									{/* Bottom accent line */}
									<div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-[#24FF66] to-transparent group-hover:w-full transition-all duration-500" />
								</div>
							</div>
						))}
					</div>

					{/* Call to Action */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.6 }}
						className="text-center space-y-6 sm:space-y-8 px-4 sm:px-0"
					>
						<h3 className="font-russo text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-white uppercase tracking-tighter">
							Ready to start making money?
						</h3>

						<div className="flex flex-col gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto sm:flex-row sm:items-center sm:justify-center">
							<Link href="/pricing">
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="group relative inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#24FF66] to-[#1ECC52] text-black font-russo font-bold rounded-xl hover:shadow-[0_0_30px_rgba(36,255,102,0.3)] transition-all duration-300 text-sm sm:text-base"
								>
									<span>Discover Your Edge</span>
									<svg
										className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1"
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
							</Link>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
});

TradingAdvantage.displayName = "TradingAdvantage";
