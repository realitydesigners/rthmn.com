"use client";

import { ONBOARDING_STEPS, useOnboardingStore } from "@/stores/onboardingStore";
import { cn } from "@/utils/cn";
import { useState } from "react";
import { 
	LuCheck, 
	LuChevronRight, 
	LuLock, 
	LuPlay, 
	LuBookOpen, 
	LuGraduationCap, 
	LuTrophy,
	LuSettings,
	LuZap
} from "react-icons/lu";

// Future learning materials with lock mechanism
const FUTURE_LEARNING_MATERIALS = [
	{
		id: "advanced-patterns",
		title: "Advanced Pattern Recognition",
		description: "Master complex market patterns and trend analysis",
		icon: LuZap,
		category: "Advanced",
		locked: true,
	},
	{
		id: "risk-management",
		title: "Risk Management Strategies", 
		description: "Learn professional risk management techniques",
		icon: LuSettings,
		category: "Advanced",
		locked: true,
	},
	{
		id: "algo-trading",
		title: "Algorithmic Trading Basics",
		description: "Introduction to automated trading systems",
		icon: LuGraduationCap,
		category: "Expert",
		locked: true,
	},
];

const OnboardingCard = ({
	step,
	isCompleted,
	isCurrent,
}: {
	step: (typeof ONBOARDING_STEPS)[0];
	isCompleted: boolean;
	isCurrent: boolean;
}) => {
	return (
		<div
			className={cn(
				"group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
				isCompleted
					? "border-[#24FF66]/30 bg-black shadow-[0_0_20px_rgba(36,255,102,0.1)]"
					: isCurrent
					? "border-[#24FF66]/50 bg-black shadow-[0_0_20px_rgba(36,255,102,0.2)]"
					: "border-[#1C1E23]/60 bg-black shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[#24FF66]/20"
			)}
		>
			{/* Top highlight */}
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />
			
			{/* Success glow for completed */}
			{isCompleted && (
				<div className="absolute inset-0 bg-gradient-to-b from-[#24FF66]/5 to-transparent" />
			)}

			{/* Content */}
			<div className="relative flex items-center gap-3 p-4">
				{/* Status indicator */}
				<div
					className={cn(
						"flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300",
						isCompleted
							? "border-[#24FF66]/50 bg-[#24FF66]/10 text-[#24FF66]"
							: isCurrent
							? "border-[#24FF66]/30 bg-[#24FF66]/5 text-[#24FF66]/80"
							: "border-[#32353C] bg-[#1C1E23] text-[#32353C] group-hover:border-[#24FF66]/20 group-hover:text-[#24FF66]/40"
					)}
				>
					{isCompleted ? (
						<LuCheck size={16} />
					) : isCurrent ? (
						<LuPlay size={14} />
					) : (
						<LuBookOpen size={16} />
					)}
				</div>

				{/* Content */}
				<div className="flex min-w-0 flex-1 flex-col">
					<h3 className="font-russo text-sm font-medium text-white mb-1">
						{step.title}
					</h3>
					<p className="font-kodemono text-xs text-white/50 leading-relaxed">
						{step.description}
					</p>
				</div>

				{/* Action indicator */}
				<div className="flex items-center">
					{isCurrent && !isCompleted && (
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full bg-[#24FF66] animate-pulse" />
							<LuChevronRight 
								size={16} 
								className="text-[#24FF66] transition-transform duration-300 group-hover:translate-x-1" 
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

const FutureLearningCard = ({
	material,
}: {
	material: typeof FUTURE_LEARNING_MATERIALS[0];
}) => {
	const Icon = material.icon;
	
	return (
		<div className="group relative overflow-hidden rounded-xl border border-[#1C1E23]/60 bg-black shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
			{/* Top highlight */}
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

			{/* Diagonal stripes for locked state */}
			<div
				className="absolute inset-0 opacity-[0.04]"
				style={{
					backgroundImage: `repeating-linear-gradient(
						135deg,
						#000,
						#000 1px,
						transparent 1.5px,
						transparent 8px
					)`,
				}}
			/>
			
			{/* Lock icon */}
			<div className="pointer-events-none absolute -top-1 -right-1">
				<div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#1C1E23] bg-gradient-to-b from-black/90 to-black/95 shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
					<LuLock className="h-3 w-3 text-white/60" />
				</div>
			</div>

			{/* Content */}
			<div className="relative flex items-center gap-3 p-4">
				{/* Icon */}
				<div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#32353C]/50 bg-[#1C1E23]/50 text-[#32353C]">
					<Icon size={16} />
				</div>

				{/* Content */}
				<div className="flex min-w-0 flex-1 flex-col">
					<div className="flex items-center gap-2 mb-1">
						<h3 className="font-russo text-sm font-medium text-white/40">
							{material.title}
						</h3>
						<span className="font-kodemono text-[10px] px-2 py-0.5 rounded-full bg-[#1C1E23]/80 text-white/30 border border-[#32353C]/30">
							{material.category}
						</span>
					</div>
					<p className="font-kodemono text-xs text-white/30 leading-relaxed">
						{material.description}
					</p>
				</div>
			</div>
		</div>
	);
};

export const Onboarding = () => {
	const { currentStepId, completedSteps } = useOnboardingStore();
	const progressPercentage = (completedSteps.length / ONBOARDING_STEPS.length) * 100;

	const handleClearOnboarding = () => {
		localStorage.removeItem("avatar_url");
		useOnboardingStore.getState().reset();
	};

	return (
		<div className="no-select space-y-6 p-4 pb-16">
			{/* Progress Overview */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="font-russo text-lg font-bold text-white">
						Learning Progress
					</h2>
					<span className="font-kodemono text-sm text-white/60">
						{completedSteps.length}/{ONBOARDING_STEPS.length}
					</span>
				</div>
				
				{/* Progress bar */}
				<div className="relative h-2 overflow-hidden rounded-full bg-[#1C1E23]">
					<div
						className="h-full rounded-full bg-gradient-to-r from-[#24FF66] to-[#1ECC52] transition-all duration-500 ease-out"
						style={{ width: `${progressPercentage}%` }}
					/>
					{/* Glow effect */}
					<div
						className="absolute top-0 h-full rounded-full bg-gradient-to-r from-[#24FF66]/50 to-[#1ECC52]/50 blur-sm"
						style={{ width: `${progressPercentage}%` }}
					/>
				</div>

				{/* Progress status */}
				<div className="flex items-center gap-2">
					<div className={cn(
						"h-2 w-2 rounded-full transition-all duration-300",
						progressPercentage === 100 ? "bg-[#24FF66]" : "bg-[#24FF66]/60"
					)} />
					<span className="font-kodemono text-xs text-white/50">
						{progressPercentage === 100 
							? "Onboarding Complete! 🎉" 
							: `${Math.round(progressPercentage)}% Complete`
						}
					</span>
				</div>
			</div>

			{/* Current Steps */}
			<div className="space-y-3">
				<h3 className="font-russo text-sm font-medium text-white/80 uppercase tracking-wider">
					Getting Started
				</h3>
				<div className="space-y-2">
					{ONBOARDING_STEPS.map((step) => (
						<OnboardingCard
							key={step.id}
							step={step}
							isCompleted={completedSteps.includes(step.id)}
							isCurrent={currentStepId === step.id}
						/>
					))}
				</div>
			</div>

			{/* Future Learning Materials */}
			<div className="space-y-3">
				<div className="flex items-center gap-2">
					<h3 className="font-russo text-sm font-medium text-white/60 uppercase tracking-wider">
						Coming Soon
					</h3>
					<LuLock className="h-3 w-3 text-white/40" />
				</div>
				<div className="space-y-2">
					{FUTURE_LEARNING_MATERIALS.map((material) => (
						<FutureLearningCard
							key={material.id}
							material={material}
						/>
					))}
				</div>
			</div>

			{/* Only show Clear Progress button in development */}
			{process.env.NODE_ENV === "development" && (
				<button
					onClick={handleClearOnboarding}
					className="group relative mt-4 w-full rounded-lg border border-[#24FF66]/20 bg-[#24FF66]/10 px-4 py-2 text-sm font-medium text-[#24FF66] transition-all duration-200 hover:border-[#24FF66]/30 hover:bg-[#24FF66]/20 hover:shadow-[0_0_20px_rgba(36,255,102,0.2)]"
				>
					<div className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
					Clear Progress
				</button>
			)}
		</div>
	);
};
