import { motion } from "framer-motion";
import { memo } from "react";

interface PriceChartProps {
	entryPrice: number;
	stopLoss: number;
	takeProfit: number;
	direction: "long" | "short";
}

export const PriceChart = memo(
	({ entryPrice, stopLoss, takeProfit, direction }: PriceChartProps) => {
		const isLong = direction === "long";
		const profitDistance = Math.abs(takeProfit - entryPrice);
		const riskDistance = Math.abs(stopLoss - entryPrice);
		const ratio = profitDistance / riskDistance;

		return (
			<div className="relative h-[300px] w-full rounded-xl border border-[#1C1E23] bg-black/40 p-6">
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_50%)]" />
					<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />
				</div>

				<div className="relative h-full">
					{/* Take Profit Line */}
					<motion.div
						initial={{ width: 0 }}
						animate={{ width: "100%" }}
						transition={{ duration: 0.5 }}
						className="absolute left-0 h-px bg-blue-400"
						style={{ top: isLong ? "20%" : "80%" }}
					>
						<div className="absolute -top-3 right-0 flex items-center gap-2">
							<div className="rounded bg-blue-400/10 px-2 py-1">
								<span className="font-dmmono  text-xs text-blue-400">
									Take Profit: ${takeProfit.toFixed(2)}
								</span>
							</div>
						</div>
					</motion.div>

					{/* Entry Price Line */}
					<motion.div
						initial={{ width: 0 }}
						animate={{ width: "100%" }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="absolute left-0 h-px bg-white/40"
						style={{ top: "50%" }}
					>
						<div className="absolute -top-3 right-0 flex items-center gap-2">
							<div className="rounded bg-[#1C1E23] px-2 py-1">
								<span className="font-dmmono  text-xs text-white">
									Entry: ${entryPrice.toFixed(2)}
								</span>
							</div>
						</div>
					</motion.div>

					{/* Stop Loss Line */}
					<motion.div
						initial={{ width: 0 }}
						animate={{ width: "100%" }}
						transition={{ duration: 0.5, delay: 0.4 }}
						className="absolute left-0 h-px bg-red-400"
						style={{ top: isLong ? "80%" : "20%" }}
					>
						<div className="absolute -top-3 right-0 flex items-center gap-2">
							<div className="rounded bg-red-400/10 px-2 py-1">
								<span className="font-dmmono  text-xs text-red-400">
									Stop Loss: ${stopLoss.toFixed(2)}
								</span>
							</div>
						</div>
					</motion.div>

					{/* Direction Arrow */}
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ duration: 0.5, delay: 0.6 }}
						className="absolute left-4"
						style={{ top: "50%", transform: "translateY(-50%)" }}
					>
						<div
							className={`flex h-20 items-center justify-center ${isLong ? "flex-col" : "flex-col-reverse"}`}
						>
							<div
								className={`h-16 w-1 ${isLong ? "bg-blue-400/20" : "bg-red-400/20"}`}
							/>
							<div
								className={`h-4 w-4 rotate-45 transform ${isLong ? "bg-blue-400/20" : "bg-red-400/20"}`}
							/>
						</div>
					</motion.div>

					{/* Risk/Reward Label */}
					<div className="absolute bottom-4 left-4">
						<div className="rounded-full bg-[#1C1E23] px-3 py-1">
							<span className="font-dmmono  text-sm text-white/60">
								Risk/Reward: 1:{ratio.toFixed(2)}
							</span>
						</div>
					</div>
				</div>
			</div>
		);
	},
);

PriceChart.displayName = "PriceChart";
