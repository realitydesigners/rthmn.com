"use client";

import { ONBOARDING_STEPS, useOnboardingStore } from "@/stores/onboardingStore";
import { cn } from "@/utils/cn";
import { useState } from "react";
import { LuCheck, LuChevronDown, LuChevronUp } from "react-icons/lu";

const OnboardingCard = ({
	step,
	isCompleted,
	isCurrent,
	stepNumber,
}: {
	step: (typeof ONBOARDING_STEPS)[0];
	isCompleted: boolean;
	isCurrent: boolean;
	stepNumber: number;
}) => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div
			className={cn(
				"group relative w-full overflow-hidden rounded-xl border border-white/[0.05]  bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] transition-all duration-300 hover:scale-[1.01]",
			)}
		>
			{/* Highlight Effect */}
			<div
				className={cn(
					"absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100",
				)}
			/>

			{/* Content */}
			<div className="relative flex items-center gap-4 rounded-xl bg-black/40 p-3">
				<div className="flex min-w-0 flex-1 flex-col">
					<div className="flex items-center justify-between">
						<h3
							className={cn(
								"truncate text-sm font-medium transition-colors duration-300",
								isCompleted || isCurrent ? "text-white" : "text-neutral-400",
							)}
						>
							{step.title}
						</h3>
						<button
							onClick={() => setIsExpanded(!isExpanded)}
							className="ml-2 rounded-md p-0.5 text-neutral-500 hover:bg-white/5 hover:text-neutral-300"
						>
							{isExpanded ? (
								<LuChevronUp size={14} />
							) : (
								<LuChevronDown size={14} />
							)}
						</button>
					</div>

					{isExpanded && (
						<p className="mt-1 text-xs text-neutral-500 transition-colors duration-300 group-hover:text-neutral-400">
							{step.description}
						</p>
					)}

					<div className="mt-1">
						{isCompleted ? (
							<span className="inline-flex items-center gap-1 rounded-full border border-blue-400/20 bg-blue-400/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
								Completed
							</span>
						) : isCurrent ? (
							<span className="inline-flex items-center gap-1 rounded-full border border-blue-400/10 bg-blue-400/5 px-2 py-0.5 text-[10px] font-medium text-blue-400/80">
								In Progress
							</span>
						) : (
							<span className="inline-flex items-center gap-1 rounded-full border border-[#222] bg-[#111] px-2 py-0.5 text-[10px] font-medium text-neutral-500">
								Not Started
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export const Onboarding = () => {
	const { currentStepId, completedSteps } = useOnboardingStore();
	const handleClearOnboarding = () => {
		localStorage.removeItem("avatar_url");
		useOnboardingStore.getState().reset();
	};

	return (
		<div className="no-select space-y-6 p-4 pb-16">
			{/* Header */}
			<div className="mb-6 flex flex-col">
				{/* <div className="flex flex-col">
					<h2 className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-xl font-bold text-transparent">
						Onboarding Progress
					</h2>
				</div> */}
				<div className="flex items-center gap-2">
					<div className="h-1.5 flex-1 rounded-full bg-[#222]">
						<div
							className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-400/80 transition-all duration-300"
							style={{
								width: `${(completedSteps.length / ONBOARDING_STEPS.length) * 100}%`,
							}}
						/>
					</div>
					<span className="text-xs font-medium text-neutral-400">
						{completedSteps.length}/{ONBOARDING_STEPS.length}
					</span>
				</div>
			</div>

			{/* Steps List */}
			<div className="grid grid-cols-1 gap-2">
				{ONBOARDING_STEPS.map((step, index) => (
					<OnboardingCard
						key={step.id}
						step={step}
						isCompleted={completedSteps.includes(step.id)}
						isCurrent={currentStepId === step.id}
						stepNumber={index + 1}
					/>
				))}
			</div>
			{/* Only show Clear Progress button in development */}
			{process.env.NODE_ENV === "development" && (
				<button
					onClick={handleClearOnboarding}
					className="group relative mt-2 w-full rounded-lg bg-gradient-to-b from-blue-400/20 to-blue-400/10 px-3 py-1.5 text-xs font-medium text-blue-400 transition-all duration-200 hover:from-blue-400/30 hover:to-blue-400/20 hover:shadow-lg hover:shadow-blue-400/20"
				>
					<div className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/[0.07] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
					Clear Progress
				</button>
			)}
		</div>
	);
};
