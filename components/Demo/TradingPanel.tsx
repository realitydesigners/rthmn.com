"use client";

import { memo } from "react";
import {
	LuActivity,
	LuBarChart3,
	LuClock,
	LuTrendingDown,
	LuTrendingUp,
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
		fixed top-20 right-20 h-[calc(100vh-8rem)] w-80 z-50 transition-all duration-300 ease-in-out
		${isOpen ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"}
	`}
		>
			{/* Panel */}
			<div className="relative h-full bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-xl border border-[#1C1E23]/40 shadow-[0_0_40px_rgba(0,0,0,0.6)] rounded-xl overflow-hidden">
				{/* Subtle glow effect */}
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02),transparent_50%)] rounded-xl" />

				{/* Top border highlight */}
				<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

				{/* Header */}
				<div className="relative z-10 p-4 border-b border-[#1C1E23]/30">
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-3">
							<div>
								<h2 className="font-russo text-lg font-bold text-white">
									{tradingData.name}
								</h2>
								<p className="font-russo text-xs text-white/50">
									Live Market Data
								</p>
							</div>
						</div>
						<div>
							<BaseButton
								onClick={onClose}
								variant="ghost"
								size="sm"
								className="pointer-events-auto"
							>
								<LuX className="w-4 h-4" />
							</BaseButton>
						</div>
					</div>

					{/* Price and Change */}
					<div className="flex items-center justify-between">
						<span className="font-russo text-xl font-bold text-white">
							{tradingData.price}
						</span>
						<div
							className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
								tradingData.change24h > 0
									? "bg-[#24FF66]/10 text-[#24FF66] border border-[#24FF66]/20"
									: "bg-red-500/10 text-red-400 border border-red-500/20"
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
				<div className="relative z-10 p-4 space-y-4 overflow-y-auto h-[calc(100%-140px)]">
					{/* Market Overview */}
					<div className="grid grid-cols-2 gap-3">
						<div className="p-3 rounded-lg bg-gradient-to-br from-[#1C1E23]/40 to-[#0F1012]/20 border border-[#1C1E23]/30">
							<p className="font-russo text-xs text-white/50 mb-1">
								24h Volume
							</p>
							<p className="font-russo text-sm font-medium text-white">
								{tradingData.volume}
							</p>
						</div>
						<div className="p-3 rounded-lg bg-gradient-to-br from-[#1C1E23]/40 to-[#0F1012]/20 border border-[#1C1E23]/30">
							<p className="font-russo text-xs text-white/50 mb-1">
								Market Cap
							</p>
							<p className="font-russo text-sm font-medium text-white">
								{tradingData.marketCap}
							</p>
						</div>
						<div className="p-3 rounded-lg bg-gradient-to-br from-[#24FF66]/5 to-transparent border border-[#24FF66]/20">
							<p className="font-russo text-xs text-white/50 mb-1">24h High</p>
							<p className="font-russo text-sm font-medium text-[#24FF66]">
								{tradingData.high24h}
							</p>
						</div>
						<div className="p-3 rounded-lg bg-gradient-to-br from-red-500/5 to-transparent border border-red-500/20">
							<p className="font-russo text-xs text-white/50 mb-1">24h Low</p>
							<p className="font-russo text-sm font-medium text-red-400">
								{tradingData.low24h}
							</p>
						</div>
					</div>

					{/* Technical Indicators */}
					<div className="space-y-3">
						<h3 className="font-russo text-sm font-medium text-white/80 uppercase tracking-wider">
							Technical Indicators
						</h3>
						<div className="space-y-2">
							<div className="flex items-center justify-between p-2 rounded-lg bg-[#1C1E23]/20">
								<span className="font-russo text-sm text-white/70">RSI</span>
								<span
									className={`font-russo text-sm font-medium ${
										tradingData.rsi > 70
											? "text-red-400"
											: tradingData.rsi < 30
												? "text-[#24FF66]"
												: "text-white"
									}`}
								>
									{tradingData.rsi}
								</span>
							</div>
							<div className="flex items-center justify-between p-2 rounded-lg bg-[#1C1E23]/20">
								<span className="font-russo text-sm text-white/70">MACD</span>
								<span
									className={`font-russo text-sm font-medium ${
										tradingData.macd === "positive"
											? "text-[#24FF66]"
											: "text-red-400"
									}`}
								>
									{tradingData.macd.toUpperCase()}
								</span>
							</div>
							<div className="flex items-center justify-between p-2 rounded-lg bg-[#1C1E23]/20">
								<span className="font-russo text-sm text-white/70">
									Volatility
								</span>
								<span className="font-russo text-sm font-medium text-white">
									{tradingData.volatility}%
								</span>
							</div>
						</div>
					</div>

					{/* Key Levels */}
					<div className="space-y-3">
						<h3 className="font-russo text-sm font-medium text-white/80 uppercase tracking-wider">
							Key Levels
						</h3>
						<div className="space-y-2">
							<div className="flex items-center justify-between p-2 rounded-lg bg-[#24FF66]/5 border border-[#24FF66]/20">
								<span className="font-russo text-sm text-white/70">
									Support
								</span>
								<span className="font-russo text-sm font-medium text-[#24FF66]">
									{tradingData.support}
								</span>
							</div>
							<div className="flex items-center justify-between p-2 rounded-lg bg-red-500/5 border border-red-500/20">
								<span className="font-russo text-sm text-white/70">
									Resistance
								</span>
								<span className="font-russo text-sm font-medium text-red-400">
									{tradingData.resistance}
								</span>
							</div>
						</div>
					</div>

					{/* Market Analysis */}
					<div className="p-3 rounded-lg bg-gradient-to-br from-[#1C1E23]/30 to-[#0F1012]/10 border border-[#1C1E23]/20">
						<div className="flex items-start gap-3">
							<div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
								<LuActivity className="w-3 h-3 text-white/70" />
							</div>
							<div className="space-y-1">
								<p className="font-russo text-sm font-medium text-white">
									Market Outlook
								</p>
								<p className="font-russo text-xs text-white/60 leading-relaxed">
									{tradingData.trend === "bullish"
										? `Strong bullish momentum with RSI at ${tradingData.rsi}. Testing resistance at ${tradingData.resistance}.`
										: tradingData.trend === "bearish"
											? `Bearish pressure with RSI at ${tradingData.rsi}. Support at ${tradingData.support} being tested.`
											: `Consolidating range. Watch for breakout above ${tradingData.resistance} or breakdown below ${tradingData.support}.`}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	),
);

TradingInfoPanel.displayName = "TradingInfoPanel";
