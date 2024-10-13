"use client";
import React, { useState, useEffect } from "react";
import { Signal } from "@/types";
import { useSignals } from "@/providers/SignalProviderClient";
import { getTimeAgo } from "@/utils/dateUtils";
import { CondensedIcon, DetailedIcon } from "@/public/icons/icons";
import { oxanium, russo } from "@/fonts";

export function SignalSidebar() {
	const { signalsData, hasSubscription } = useSignals();
	const [viewMode, setViewMode] = useState<"condensed" | "detailed">(
		"detailed",
	);
	const [interactedSignals, setInteractedSignals] = useState<Set<string>>(
		new Set(),
	);
	const [isCondensedHovered, setIsCondensedHovered] = useState(false);
	const [isDetailedHovered, setIsDetailedHovered] = useState(false);

	useEffect(() => {
		const savedViewMode = localStorage.getItem("viewMode") as
			| "condensed"
			| "detailed";
		if (savedViewMode) {
			setViewMode(savedViewMode);
		}

		const savedInteractedSignals = localStorage.getItem("interactedSignals");
		if (savedInteractedSignals) {
			setInteractedSignals(new Set(JSON.parse(savedInteractedSignals)));
		}
	}, []);

	const toggleViewMode = (mode: "condensed" | "detailed") => {
		setViewMode(mode);
		localStorage.setItem("viewMode", mode);
	};

	const handleSignalHover = (signalId: string) => {
		setInteractedSignals((prev) => {
			const newInteractedSignals = new Set(prev);
			newInteractedSignals.add(signalId);
			localStorage.setItem(
				"interactedSignals",
				JSON.stringify(Array.from(newInteractedSignals)),
			);
			return newInteractedSignals;
		});
	};

	const renderDetailedView = (signal: Signal, index: number) => {
		const pairName = signal.pair.substring(0, 7).replace(/_/g, "");
		const isNewSignal =
			!interactedSignals.has(signal.id) &&
			new Date().getTime() - new Date(signal.start_time || "").getTime() <
				2 * 60 * 60 * 1000;

		return (
			<div
				key={`${signal.id}-${signal.pair}-${index}`}
				className={`mt-30 mb-1 flex w-full items-center justify-between border border-transparent bg-[#0a0a0a] ${
					isNewSignal ? "bg-opacity-20" : ""
				} transition-colors duration-300 ease-in-out hover:bg-[#121212]`}
				onMouseEnter={() => handleSignalHover(signal.id)}
			>
				<div className="flex flex-1 flex-col p-2 text-xs uppercase">
					<div className="flex gap-2">
						<p
							className={`heading-text mb-2 inline-block rounded px-1.5 py-0.5 text-xs ${oxanium.className}`}
						>
							{signal.pattern_type === "defaultType"
								? "BUY"
								: signal.pattern_type}
						</p>
						<p
							className={`text-base font-bold text-white/70 ${oxanium.className}`}
						>
							{signal.start_price}
						</p>
					</div>
					<div
						className={`text-2xl font-bold text-white/50 ${russo.className}`}
					>
						{pairName}
					</div>
				</div>
				<div className="ml-auto flex items-center p-3.5">
					<div
						className={`text-right text-xs text-[#828385] ${oxanium.className}`}
					>
						{getTimeAgo(signal.start_time || "")}
						<StatusCircle status={signal.status} />
					</div>
				</div>
			</div>
		);
	};

	const renderCondensedView = (signal: Signal, index: number) => {
		const pairName = signal.pair.substring(0, 7).replace(/_/g, "");
		const isNewSignal =
			!interactedSignals.has(signal.id) &&
			new Date().getTime() - new Date(signal.start_time || "").getTime() <
				2 * 60 * 60 * 1000;

		return (
			<div
				key={`${signal.id}-${signal.pair}-${index}`}
				className={`mb-2 flex w-full items-center justify-between border border-transparent bg-[#0a0a0a] ${
					isNewSignal ? "bg-opacity-20" : ""
				} transition-colors duration-300 ease-in-out hover:bg-[#121212]`}
				onMouseEnter={() => handleSignalHover(signal.id)}
			>
				<div className="flex flex-1 flex-row items-center justify-between p-2 text-xs">
					<div
						className={`mr-2.5 w-[70px] text-base font-bold text-white/50 ${russo.className}`}
					>
						{pairName}
					</div>
					<p
						className={`heading-text inline-block w-[50px] rounded border-[#747578] px-1.5 py-0.5 text-center text-xs ${oxanium.className}`}
					>
						{signal.pattern_type === "defaultType"
							? "BUY"
							: signal.pattern_type}
					</p>
					<p
						className={`w-[70px] text-left text-sm font-bold text-white/70 ${oxanium.className}`}
					>
						{signal.start_price}
					</p>
					<StatusCircleCondensed status={signal.status} />
				</div>
			</div>
		);
	};

	return (
		<div
			className={`fixed bottom-0 right-0 top-20 z-[1000] w-[300px] overflow-y-auto border border-[#181818] bg-black p-2 shadow-md ${oxanium.className}`}
		>
			<div className="mb-2 flex justify-between">
				<button
					type="button"
					onMouseEnter={() => setIsDetailedHovered(true)}
					onMouseLeave={() => setIsDetailedHovered(false)}
					onClick={() => toggleViewMode("detailed")}
					className={`p-2 ${viewMode === "detailed" ? "bg-[#121212]" : "bg-black"} rounded`}
				>
					<DetailedIcon isDetailedHovered={isDetailedHovered} />
				</button>
				<button
					type="button"
					onMouseEnter={() => setIsCondensedHovered(true)}
					onMouseLeave={() => setIsCondensedHovered(false)}
					onClick={() => toggleViewMode("condensed")}
					className={`p-2 ${viewMode === "condensed" ? "bg-[#121212]" : "bg-black"} rounded`}
				>
					<CondensedIcon isCondensedHovered={isCondensedHovered} />
				</button>
			</div>
			<div className="h-[calc(100%-60px)] overflow-y-auto">
				{signalsData ? (
					signalsData.map((signal, index) =>
						viewMode === "detailed"
							? renderDetailedView(signal, index)
							: renderCondensedView(signal, index),
					)
				) : (
					<div className="mb-2 flex w-full items-center justify-between border border-transparent bg-[#0a0a0a]">
						Loading signals data...
					</div>
				)}
			</div>
		</div>
	);
}

const StatusCircle: React.FC<{ status: string }> = ({ status }) => {
	const getStatusColor = {
		failed: "bg-red-200/50 text-red-200 border-red-200",
		active: "bg-yellow-200/50 text-yellow-200 border-yellow-200",
		succeeded: "bg-teal-200/50 text-teal-200 border-teal-200",
	}[status];

	return (
		<div
			className={`mt-4 flex items-center justify-center rounded px-1.5 py-0.5 font-bold uppercase ${getStatusColor} ${oxanium.className}`}
		>
			{status === "active" && (
				<div className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-200" />
			)}
			{status === "succeeded" && (
				<div className="bg-tea-200 mr-1 h-1.5 w-1.5 rounded-full bg-teal-200" />
			)}
			{status === "failed" && (
				<div className="mr-1 h-1.5 w-1.5 rounded-full bg-red-200" />
			)}
			<div className="text-xs">
				{status === "succeeded" ? "success" : status}
			</div>
		</div>
	);
};

const StatusCircleCondensed: React.FC<{ status: string }> = ({ status }) => {
	const getStatusColor = {
		failed: "bg-red-400",
		active: "bg-yellow-200/50 ",
		succeeded: "bg-green-400",
	}[status];

	return (
		<div className={`flex items-center justify-center ${getStatusColor}`}>
			{status === "active" && (
				<div className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-200" />
			)}
			{status === "succeeded" && (
				<div className="h-1.5 w-1.5 rounded-full bg-teal-200" />
			)}
			{status === "failed" && (
				<div className="h-1.5 w-1.5 rounded-full bg-red-200" />
			)}
		</div>
	);
};
