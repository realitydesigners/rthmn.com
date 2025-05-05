import { LuBookOpen, LuGraduationCap, LuTrophy } from "react-icons/lu";
import { TourButton } from "./TourButton";

interface OnboardingContentProps {
	onComplete?: () => void;
}

export function OnboardingContent({ onComplete }: OnboardingContentProps) {
	return (
		<div className="no-select w-[350px] overflow-hidden rounded-xl border border-[#222] bg-gradient-to-b from-[#141414] via-[#111] to-[#0A0A0A] p-4 shadow-2xl before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.05),rgba(255,255,255,0))]">
			<div className="relative flex h-full flex-col items-end justify-end space-y-2">
				<div className="w-full p-2">
					<h3 className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-2xl font-bold text-transparent">
						Learn
					</h3>
					<p className="text-[13px] leading-relaxed text-neutral-400">
						Your personal trading education and onboarding center.
					</p>
				</div>
				<div className="space-y-2">
					<div className="group relative overflow-hidden rounded-xl transition-all duration-300">
						<div className="relative flex items-start gap-3 rounded-xl p-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#3FFFA2]/20 via-[#3FFFA2]/10 to-[#3FFFA2]/5 transition-colors duration-300 group-hover:from-[#3FFFA2]/30">
								<LuGraduationCap className="h-4 w-4 text-[#3FFFA2] transition-colors duration-300 group-hover:text-[#3FFFA2]/80" />
							</div>
							<div className="flex-1">
								<div className="text-sm font-medium text-neutral-200 transition-colors duration-300 group-hover:text-white">
									Onboarding Progress
								</div>
								<div className="text-xs text-neutral-500 transition-colors duration-300 group-hover:text-neutral-400">
									Complete your setup and learn platform basics
								</div>
							</div>
						</div>
					</div>

					<div className="group relative overflow-hidden rounded-xl transition-all duration-300">
						<div className="relative flex items-start gap-3 rounded-xl p-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#3FFFA2]/20 via-[#3FFFA2]/10 to-[#3FFFA2]/5 transition-colors duration-300 group-hover:from-[#3FFFA2]/30">
								<LuBookOpen className="h-4 w-4 text-[#3FFFA2] transition-colors duration-300 group-hover:text-[#3FFFA2]/80" />
							</div>
							<div className="flex-1">
								<div className="text-sm font-medium text-neutral-200 transition-colors duration-300 group-hover:text-white">
									Trading Courses
								</div>
								<div className="text-xs text-neutral-500 transition-colors duration-300 group-hover:text-neutral-400">
									Access interactive lessons and trading guides
								</div>
							</div>
						</div>
					</div>

					<div className="group relative overflow-hidden rounded-xl transition-all duration-300">
						<div className="relative flex items-start gap-3 rounded-xl p-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#3FFFA2]/20 via-[#3FFFA2]/10 to-[#3FFFA2]/5 transition-colors duration-300 group-hover:from-[#3FFFA2]/30">
								<LuTrophy className="h-4 w-4 text-[#3FFFA2] transition-colors duration-300 group-hover:text-[#3FFFA2]/80" />
							</div>
							<div className="flex-1">
								<div className="text-sm font-medium text-neutral-200 transition-colors duration-300 group-hover:text-white">
									Skill Assessment
								</div>
								<div className="text-xs text-neutral-500 transition-colors duration-300 group-hover:text-neutral-400">
									Test your knowledge with trading quizzes
								</div>
							</div>
						</div>
					</div>
				</div>
				<TourButton onClick={onComplete} />
			</div>
		</div>
	);
}
