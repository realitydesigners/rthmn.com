"use client";

import { memo } from "react";
import {
	LuTrendingUp,
	LuTrendingDown,
	LuActivity,
	LuBarChart3,
	LuClock,
	LuX,
} from "react-icons/lu";

// Trading Data Interface
export interface TradingData {
	pair: string;
	name: string;
	price: string;
	change24h: number;
	volume: string;
	marketCap: string;
	high24h: string;
	low24h: string;
	volatility: number;
	trend: "bullish" | "bearish" | "neutral";
	support: string;
	resistance: string;
	rsi: number;
	macd: "positive" | "negative";
}

// Mock trading data
export const mockTradingData: Record<string, TradingData> = {
	BTC: {
		pair: "BTC",
		name: "Bitcoin",
		price: "$43,250.00",
		change24h: 2.45,
		volume: "$28.5B",
		marketCap: "$847.2B",
		high24h: "$43,890.00",
		low24h: "$42,100.00",
		volatility: 3.2,
		trend: "bullish",
		support: "$42,000",
		resistance: "$44,500",
		rsi: 65,
		macd: "positive",
	},
	ETH: {
		pair: "ETH",
		name: "Ethereum",
		price: "$2,580.00",
		change24h: -1.23,
		volume: "$15.2B",
		marketCap: "$310.4B",
		high24h: "$2,650.00",
		low24h: "$2,520.00",
		volatility: 4.1,
		trend: "bearish",
		support: "$2,500",
		resistance: "$2,700",
		rsi: 42,
		macd: "negative",
	},
	SOL: {
		pair: "SOL",
		name: "Solana",
		price: "$98.50",
		change24h: 5.67,
		volume: "$2.8B",
		marketCap: "$42.1B",
		high24h: "$102.00",
		low24h: "$93.20",
		volatility: 6.8,
		trend: "bullish",
		support: "$95.00",
		resistance: "$105.00",
		rsi: 72,
		macd: "positive",
	},
	ADA: {
		pair: "ADA",
		name: "Cardano",
		price: "$0.485",
		change24h: -0.89,
		volume: "$420M",
		marketCap: "$17.2B",
		high24h: "$0.495",
		low24h: "$0.478",
		volatility: 2.9,
		trend: "neutral",
		support: "$0.470",
		resistance: "$0.500",
		rsi: 48,
		macd: "negative",
	},
};

// Base Button Component for the panel
interface BaseButtonProps {
	onClick?: () => void;
	disabled?: boolean;
	className?: string;
	children: React.ReactNode;
	variant?: "primary" | "secondary" | "ghost" | "danger";
	size?: "sm" | "md" | "lg";
}

const BaseButton = memo(
	({
		onClick,
		disabled = false,
		className = "",
		children,
		variant = "secondary",
		size = "md",
	}: BaseButtonProps) => {
		const sizeClasses = {
			sm: "h-8 w-8 text-xs",
			md: "h-10 w-10 text-sm",
			lg: "h-12 w-12 text-base",
		};

		const variantClasses = {
			primary:
				"bg-gradient-to-b from-white/20 via-white/10 to-transparent border-white/40 text-white hover:border-white/60 hover:from-white/30 hover:via-white/15 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]",
			secondary:
				"bg-gradient-to-b from-[#1C1E23]/80 via-[#0F1012]/60 to-[#0A0B0D]/40 border-[#1C1E23]/60 text-white/80 hover:border-[#32353C]/80 hover:from-[#1C1E23] hover:via-[#0F1012] hover:text-white hover:shadow-[0_0_15px_rgba(0,0,0,0.4)]",
			ghost:
				"bg-black/40 backdrop-blur-sm border-white/30 text-white hover:bg-white/10 hover:border-white/60 hover:text-white",
			danger:
				"bg-gradient-to-b from-red-500/20 via-red-500/10 to-transparent border-red-500/40 text-red-400 hover:border-red-500/60 hover:from-red-500/30 hover:via-red-500/15 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]",
		};

		return (
			<button
				type="button"
				onClick={onClick}
				disabled={disabled}
				className={`
				group relative flex items-center justify-center rounded-full border transition-all duration-300
				${sizeClasses[size]}
				${variantClasses[variant]}
				${disabled ? "opacity-50 cursor-not-allowed" : ""}
				${className}
			`}
			>
				{/* Subtle inner glow */}
				<div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.03] via-transparent to-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

				{/* Top highlight */}
				<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

				{/* Content */}
				<div className="relative z-10">{children}</div>
			</button>
		);
	},
);

BaseButton.displayName = "BaseButton";

// Trading Info Side Panel Component
interface TradingInfoPanelProps {
	isOpen: boolean;
	onClose: () => void;
	tradingData: TradingData;
}

export const TradingInfoPanel = memo(
	({ isOpen, onClose, tradingData }: TradingInfoPanelProps) => (
		<div
			className={`
		fixed top-0 right-0 h-[70vh] w-80 z-40 mr-4 transform transition-transform duration-300 ease-in-out mt-20
		${isOpen ? "translate-x-0" : "translate-x-full"}
	`}
		>
			{/* Backdrop */}
			{isOpen && (
				<button
					type="button"
					className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 cursor-pointer"
					onClick={onClose}
					onKeyDown={(e) => e.key === "Escape" && onClose()}
					aria-label="Close trading panel"
				/>
			)}

			{/* Panel */}
			<div className="relative h-full bg-gradient-to-b from-[#0A0B0D]/98 via-[#070809]/95 to-[#050506]/92 backdrop-blur-xl border-l border-[#1C1E23]/60 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-40 rounded-l-xl">
				{/* Subtle radial glow */}
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,rgba(255,255,255,0.03),transparent_50%)] rounded-l-xl" />

				{/* Header */}
				<div className="relative z-10 p-6 border-b border-[#1C1E23]/40">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
								<LuBarChart3 className="w-4 h-4 text-white" />
							</div>
							<div>
								<h2 className="font-russo text-lg font-bold text-white">
									{tradingData.pair}
								</h2>
								<p className="font-russo text-sm text-white/60">
									{tradingData.name}
								</p>
							</div>
						</div>
						<BaseButton onClick={onClose} variant="ghost" size="sm">
							<LuX className="w-4 h-4" />
						</BaseButton>
					</div>

					{/* Price and Change */}
					<div className="flex items-center gap-4">
						<span className="font-russo text-2xl font-bold text-white">
							{tradingData.price}
						</span>
						<div
							className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
								tradingData.change24h > 0
									? "bg-green-500/10 text-green-400"
									: "bg-red-500/10 text-red-400"
							}`}
						>
							{tradingData.change24h > 0 ? (
								<LuTrendingUp className="w-3 h-3" />
							) : (
								<LuTrendingDown className="w-3 h-3" />
							)}
							{Math.abs(tradingData.change24h).toFixed(2)}%
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="relative z-10 p-6 space-y-6 overflow-y-auto h-[calc(100%-140px)]">
					{/* Market Data */}
					<div className="space-y-4">
						<h3 className="font-russo text-sm font-medium text-[#818181] uppercase tracking-wider">
							Market Data
						</h3>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1">
								<p className="font-russo text-xs text-white/60">24h Volume</p>
								<p className="font-russo text-sm font-medium text-white">
									{tradingData.volume}
								</p>
							</div>
							<div className="space-y-1">
								<p className="font-russo text-xs text-white/60">Market Cap</p>
								<p className="font-russo text-sm font-medium text-white">
									{tradingData.marketCap}
								</p>
							</div>
							<div className="space-y-1">
								<p className="font-russo text-xs text-white/60">24h High</p>
								<p className="font-russo text-sm font-medium text-green-400">
									{tradingData.high24h}
								</p>
							</div>
							<div className="space-y-1">
								<p className="font-russo text-xs text-white/60">24h Low</p>
								<p className="font-russo text-sm font-medium text-red-400">
									{tradingData.low24h}
								</p>
							</div>
						</div>
					</div>

					{/* Technical Analysis */}
					<div className="space-y-4">
						<h3 className="font-russo text-sm font-medium text-[#818181] uppercase tracking-wider">
							Technical Analysis
						</h3>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="font-russo text-sm text-white/80">Trend</span>
								<div
									className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
										tradingData.trend === "bullish"
											? "bg-green-500/10 text-green-400"
											: tradingData.trend === "bearish"
												? "bg-red-500/10 text-red-400"
												: "bg-yellow-500/10 text-yellow-400"
									}`}
								>
									<LuActivity className="w-3 h-3" />
									{tradingData.trend.toUpperCase()}
								</div>
							</div>

							<div className="flex items-center justify-between">
								<span className="font-russo text-sm text-white/80">RSI</span>
								<span
									className={`font-russo text-sm font-medium ${
										tradingData.rsi > 70
											? "text-red-400"
											: tradingData.rsi < 30
												? "text-green-400"
												: "text-white"
									}`}
								>
									{tradingData.rsi}
								</span>
							</div>

							<div className="flex items-center justify-between">
								<span className="font-russo text-sm text-white/80">MACD</span>
								<span
									className={`font-russo text-sm font-medium ${
										tradingData.macd === "positive"
											? "text-green-400"
											: "text-red-400"
									}`}
								>
									{tradingData.macd.toUpperCase()}
								</span>
							</div>

							<div className="flex items-center justify-between">
								<span className="font-russo text-sm text-white/80">
									Volatility
								</span>
								<span className="font-russo text-sm font-medium text-white">
									{tradingData.volatility}%
								</span>
							</div>
						</div>
					</div>

					{/* Support & Resistance */}
					<div className="space-y-4">
						<h3 className="font-russo text-sm font-medium text-[#818181] uppercase tracking-wider">
							Key Levels
						</h3>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="font-russo text-sm text-white/80">
									Support
								</span>
								<span className="font-russo text-sm font-medium text-green-400">
									{tradingData.support}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="font-russo text-sm text-white/80">
									Resistance
								</span>
								<span className="font-russo text-sm font-medium text-red-400">
									{tradingData.resistance}
								</span>
							</div>
						</div>
					</div>

					{/* Trading Conditions */}
					<div className="space-y-4">
						<h3 className="font-russo text-sm font-medium text-[#818181] uppercase tracking-wider">
							Current Conditions
						</h3>
						<div className="p-4 rounded-lg bg-gradient-to-br from-[#1C1E23]/40 to-[#0F1012]/20 border border-[#1C1E23]/30">
							<div className="flex items-start gap-3">
								<div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
									<LuClock className="w-3 h-3 text-white" />
								</div>
								<div className="space-y-2">
									<p className="font-russo text-sm font-medium text-white">
										Market Analysis
									</p>
									<p className="font-russo text-xs text-white/70 leading-relaxed">
										{tradingData.trend === "bullish"
											? `${tradingData.name} is showing strong bullish momentum with RSI at ${tradingData.rsi}. Price is testing resistance at ${tradingData.resistance}.`
											: tradingData.trend === "bearish"
												? `${tradingData.name} is experiencing bearish pressure with RSI at ${tradingData.rsi}. Support level at ${tradingData.support} is being tested.`
												: `${tradingData.name} is consolidating in a neutral range. Watch for breakout above ${tradingData.resistance} or breakdown below ${tradingData.support}.`}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	),
);

TradingInfoPanel.displayName = "TradingInfoPanel";
