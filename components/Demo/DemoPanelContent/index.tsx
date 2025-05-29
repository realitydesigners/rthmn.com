"use client";

import { memo } from "react";
import {
	LuTrendingUp,
	LuTrendingDown,
	LuActivity,
	LuBarChart3,
	LuPieChart,
	LuSettings,
	LuUser,
	LuBell,
} from "react-icons/lu";

// Demo Instruments Panel Content
export const DemoInstrumentsPanel = memo(() => {
	const mockInstruments = [
		{ symbol: "BTC/USD", price: "$43,250.00", change: "+2.45%", trend: "up" },
		{ symbol: "ETH/USD", price: "$2,680.50", change: "+1.82%", trend: "up" },
		{ symbol: "SOL/USD", price: "$98.75", change: "-0.95%", trend: "down" },
		{ symbol: "ADA/USD", price: "$0.485", change: "+3.21%", trend: "up" },
		{ symbol: "MATIC/USD", price: "$0.825", change: "-1.15%", trend: "down" },
	];

	return (
		<div className="space-y-4 p-4">
			<div className="space-y-2">
				<h3 className="font-russo text-sm font-medium text-white">
					Active Instruments
				</h3>
				<p className="font-russo text-xs text-[#818181]">
					Real-time cryptocurrency market data
				</p>
			</div>

			<div className="space-y-2">
				{mockInstruments.map((instrument) => (
					<div
						key={instrument.symbol}
						className="group flex items-center justify-between rounded-lg border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/60 p-3 transition-all duration-200 hover:border-[#32353C]/80 hover:from-[#1C1E23]/40 hover:to-[#0F1012]/40"
					>
						<div className="flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#24FF66]/20 to-[#24FF66]/10 border border-[#24FF66]/30">
								<LuActivity size={14} className="text-[#24FF66]" />
							</div>
							<div>
								<div className="font-russo text-sm font-medium text-white">
									{instrument.symbol}
								</div>
								<div className="font-russo text-xs text-[#818181]">
									{instrument.price}
								</div>
							</div>
						</div>
						<div className="flex items-center gap-2">
							{instrument.trend === "up" ? (
								<LuTrendingUp size={14} className="text-[#24FF66]" />
							) : (
								<LuTrendingDown size={14} className="text-red-400" />
							)}
							<span
								className={`font-russo text-xs font-medium ${
									instrument.trend === "up" ? "text-[#24FF66]" : "text-red-400"
								}`}
							>
								{instrument.change}
							</span>
						</div>
					</div>
				))}
			</div>

			<div className="rounded-lg border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/60 p-4">
				<h4 className="font-russo text-sm font-medium text-white mb-2">
					Market Overview
				</h4>
				<div className="grid grid-cols-2 gap-4">
					<div className="text-center">
						<div className="font-russo text-lg font-bold text-[#24FF66]">
							+5.2%
						</div>
						<div className="font-russo text-xs text-[#818181]">24h Change</div>
					</div>
					<div className="text-center">
						<div className="font-russo text-lg font-bold text-white">$2.1T</div>
						<div className="font-russo text-xs text-[#818181]">Market Cap</div>
					</div>
				</div>
			</div>
		</div>
	);
});

DemoInstrumentsPanel.displayName = "DemoInstrumentsPanel";

// Demo Visualizer Panel Content
export const DemoVisualizerPanel = memo(() => {
	const chartTypes = [
		{ name: "3D Boxes", icon: LuBarChart3, active: true },
		{ name: "Heat Map", icon: LuPieChart, active: false },
		{ name: "Line Chart", icon: LuActivity, active: false },
	];

	return (
		<div className="space-y-4 p-4">
			<div className="space-y-2">
				<h3 className="font-russo text-sm font-medium text-white">
					Visualization Options
				</h3>
				<p className="font-russo text-xs text-[#818181]">
					Choose how to display market data
				</p>
			</div>

			<div className="space-y-2">
				{chartTypes.map((chart) => {
					const IconComponent = chart.icon;
					return (
						<div
							key={chart.name}
							className={`group flex items-center gap-3 rounded-lg border p-3 transition-all duration-200 cursor-pointer ${
								chart.active
									? "border-[#24FF66]/30 bg-gradient-to-b from-[#24FF66]/20 to-[#24FF66]/10"
									: "border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/60 hover:border-[#32353C]/80 hover:from-[#1C1E23]/40 hover:to-[#0F1012]/40"
							}`}
						>
							<div
								className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
									chart.active
										? "border-[#24FF66]/30 bg-gradient-to-b from-[#24FF66]/20 to-[#24FF66]/10"
										: "border-[#1C1E23]/60 bg-gradient-to-b from-[#1C1E23]/40 to-[#0F1012]/20"
								}`}
							>
								<IconComponent
									size={14}
									className={chart.active ? "text-[#24FF66]" : "text-[#818181]"}
								/>
							</div>
							<div className="flex-1">
								<div
									className={`font-russo text-sm font-medium ${
										chart.active ? "text-[#24FF66]" : "text-white"
									}`}
								>
									{chart.name}
								</div>
								<div className="font-russo text-xs text-[#818181]">
									{chart.active ? "Currently active" : "Click to activate"}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<div className="rounded-lg border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/60 p-4">
				<h4 className="font-russo text-sm font-medium text-white mb-3">
					Display Settings
				</h4>
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="font-russo text-xs text-[#818181]">
							Animation Speed
						</span>
						<div className="w-20 h-2 bg-[#1C1E23] rounded-full">
							<div className="w-12 h-2 bg-[#24FF66] rounded-full" />
						</div>
					</div>
					<div className="flex items-center justify-between">
						<span className="font-russo text-xs text-[#818181]">
							Transparency
						</span>
						<div className="w-20 h-2 bg-[#1C1E23] rounded-full">
							<div className="w-16 h-2 bg-[#24FF66] rounded-full" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
});

DemoVisualizerPanel.displayName = "DemoVisualizerPanel";

// Demo Analytics Panel Content
export const DemoAnalyticsPanel = memo(() => {
	const metrics = [
		{ label: "RSI", value: "68.5", status: "overbought" },
		{ label: "MACD", value: "+0.025", status: "bullish" },
		{ label: "Volume", value: "2.1B", status: "high" },
		{ label: "Volatility", value: "12.3%", status: "moderate" },
	];

	return (
		<div className="space-y-4 p-4">
			<div className="space-y-2">
				<h3 className="font-russo text-sm font-medium text-white">
					Technical Analysis
				</h3>
				<p className="font-russo text-xs text-[#818181]">
					Real-time market indicators and signals
				</p>
			</div>

			<div className="grid grid-cols-2 gap-2">
				{metrics.map((metric) => (
					<div
						key={metric.label}
						className="rounded-lg border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/60 p-3"
					>
						<div className="font-russo text-xs text-[#818181] mb-1">
							{metric.label}
						</div>
						<div className="font-russo text-sm font-bold text-white mb-1">
							{metric.value}
						</div>
						<div
							className={`font-russo text-xs ${
								metric.status === "bullish" || metric.status === "high"
									? "text-[#24FF66]"
									: metric.status === "overbought"
										? "text-red-400"
										: "text-blue-400"
							}`}
						>
							{metric.status}
						</div>
					</div>
				))}
			</div>

			<div className="rounded-lg border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/60 p-4">
				<h4 className="font-russo text-sm font-medium text-white mb-3">
					Trading Signals
				</h4>
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-[#24FF66] rounded-full" />
						<span className="font-russo text-xs text-white">
							Strong Buy Signal - BTC
						</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-blue-400 rounded-full" />
						<span className="font-russo text-xs text-white">
							Hold Signal - ETH
						</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-red-400 rounded-full" />
						<span className="font-russo text-xs text-white">
							Sell Signal - SOL
						</span>
					</div>
				</div>
			</div>
		</div>
	);
});

DemoAnalyticsPanel.displayName = "DemoAnalyticsPanel";

// Demo Settings Panel Content
export const DemoSettingsPanel = memo(() => {
	const settings = [
		{ label: "Dark Mode", enabled: true },
		{ label: "Real-time Updates", enabled: true },
		{ label: "Sound Alerts", enabled: false },
		{ label: "Email Notifications", enabled: true },
	];

	return (
		<div className="space-y-4 p-4">
			<div className="space-y-2">
				<h3 className="font-russo text-sm font-medium text-white">
					Application Settings
				</h3>
				<p className="font-russo text-xs text-[#818181]">
					Customize your trading experience
				</p>
			</div>

			<div className="space-y-2">
				{settings.map((setting) => (
					<div
						key={setting.label}
						className="flex items-center justify-between rounded-lg border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/60 p-3"
					>
						<span className="font-russo text-sm text-white">
							{setting.label}
						</span>
						<div
							className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
								setting.enabled ? "bg-[#24FF66]" : "bg-[#1C1E23]"
							}`}
						>
							<div
								className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
									setting.enabled ? "translate-x-5" : "translate-x-0.5"
								}`}
							/>
						</div>
					</div>
				))}
			</div>

			<div className="rounded-lg border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/60 p-4">
				<h4 className="font-russo text-sm font-medium text-white mb-3">
					Account Info
				</h4>
				<div className="space-y-2">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#24FF66]/20 to-[#24FF66]/10 border border-[#24FF66]/30">
							<LuUser size={14} className="text-[#24FF66]" />
						</div>
						<div>
							<div className="font-russo text-sm text-white">Demo User</div>
							<div className="font-russo text-xs text-[#818181]">
								demo@rthmn.com
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
});

DemoSettingsPanel.displayName = "DemoSettingsPanel";
