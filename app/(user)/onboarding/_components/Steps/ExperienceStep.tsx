"use client";

import { motion } from "framer-motion";
import { LuBrain, LuGraduationCap, LuLineChart } from "react-icons/lu";

interface Props {
	experience: string;
	setExperience: (experience: string) => void;
}

const experiences = [
	{
		id: "beginner",
		icon: LuBrain,
		title: "Beginner",
		description: "I'm new to trading or have less than a year of experience",
	},
	{
		id: "intermediate",
		icon: LuGraduationCap,
		title: "Intermediate",
		description: "I have 1-3 years of trading experience",
	},
	{
		id: "advanced",
		icon: LuLineChart,
		title: "Advanced",
		description: "I have more than 3 years of trading experience",
	},
];

export default function ExperienceStep({ experience, setExperience }: Props) {
	return (
		<div className="space-y-6 sm:space-y-8">
			<div className="space-y-2">
				<motion.h2
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="font-russo text-2xl sm:text-3xl font-bold text-white"
				>
					Trading Experience
				</motion.h2>
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="font-kodemono text-sm sm:text-base text-white/60"
				>
					Help us personalize your experience by telling us about your trading
					background.
				</motion.p>
			</div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.2 }}
				className="grid gap-3 sm:gap-4"
			>
				{experiences.map((level, index) => {
					const Icon = level.icon;
					const isSelected = experience === level.id;

					return (
						<motion.button
							key={level.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 + index * 0.1 }}
							onClick={() => setExperience(level.id)}
							className={`group relative w-full overflow-hidden rounded-xl border transition-all duration-300 ${
								isSelected
									? "border-[#24FF66]/50 bg-black shadow-[0_0_20px_rgba(36,255,102,0.2)]"
									: "border-[#1C1E23]/60 bg-black shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[#24FF66]/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
							}`}
						>
							{/* Top highlight */}
							<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

							{/* Highlight Effect */}
							<div
								className={`absolute inset-0 bg-gradient-to-b transition-opacity duration-300 ${
									isSelected
										? "from-[#24FF66]/10 to-transparent opacity-100"
										: "from-[#24FF66]/5 to-transparent opacity-0 group-hover:opacity-100"
								}`}
							/>

							{/* Content Container */}
							<div className="relative flex items-center gap-3 sm:gap-4 rounded-xl p-3 sm:p-4">
								{/* Icon Container */}
								<div
									className={`rounded-lg p-2.5 sm:p-3 transition-colors duration-300 ${
										isSelected
											? "bg-[#24FF66]/20 text-[#24FF66]"
											: "bg-[#1C1E23] text-white/60 group-hover:text-white/80"
									}`}
								>
									<Icon className="h-5 w-5 sm:h-6 sm:w-6" />
								</div>

								{/* Text Content */}
								<div className="flex-1 text-left">
									<div
										className={`font-russo text-sm sm:text-base font-medium transition-colors duration-300 ${isSelected ? "text-white" : "text-white/80"}`}
									>
										{level.title}
									</div>
									<div
										className={`font-kodemono text-xs sm:text-sm transition-colors duration-300 ${isSelected ? "text-white/70" : "text-white/60"}`}
									>
										{level.description}
									</div>
								</div>

								{/* Selection Indicator */}
								<div
									className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-colors duration-300 ${isSelected ? "bg-[#24FF66]" : "bg-[#32353C] group-hover:bg-[#24FF66]/50"}`}
								/>
							</div>
						</motion.button>
					);
				})}
			</motion.div>
		</div>
	);
}
