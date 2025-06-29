import { LuBookOpen, LuGraduationCap, LuTrophy } from "react-icons/lu";
import { TourContentWrapper } from "./TourContentWrapper";

interface OnboardingContentProps {
	onComplete?: () => void;
}

export function TourOnboarding({ onComplete }: OnboardingContentProps) {
	return (
		<TourContentWrapper className="w-[350px]" onComplete={onComplete}>
			<div className="w-full p-2">
				<h3 className="font-russo text-2xl font-bold text-white">Learn</h3>
				<p className="font-kodemono text-[13px] leading-relaxed text-white/60">
					Your personal trading education and onboarding center.
				</p>
			</div>
			<div className="space-y-2">
				<div className="group relative overflow-hidden rounded-xl transition-all duration-300">
					<div className="relative flex items-start gap-3 rounded-xl p-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#24FF66]/20 via-[#24FF66]/10 to-[#24FF66]/5 transition-colors duration-300 group-hover:from-[#24FF66]/30">
							<LuGraduationCap className="h-4 w-4 text-[#24FF66] transition-colors duration-300 group-hover:text-[#1ECC52]" />
						</div>
						<div className="flex-1">
							<div className="font-kodemono text-sm font-medium text-white transition-colors duration-300 group-hover:text-white">
								Onboarding Progress
							</div>
							<div className="font-kodemono text-xs text-white/60 transition-colors duration-300 group-hover:text-white/70">
								Complete your setup and learn platform basics
							</div>
						</div>
					</div>
				</div>

				<div className="group relative overflow-hidden rounded-xl transition-all duration-300">
					<div className="relative flex items-start gap-3 rounded-xl p-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#24FF66]/20 via-[#24FF66]/10 to-[#24FF66]/5 transition-colors duration-300 group-hover:from-[#24FF66]/30">
							<LuBookOpen className="h-4 w-4 text-[#24FF66] transition-colors duration-300 group-hover:text-[#1ECC52]" />
						</div>
						<div className="flex-1">
							<div className="font-kodemono text-sm font-medium text-white transition-colors duration-300 group-hover:text-white">
								Trading Courses
							</div>
							<div className="font-kodemono text-xs text-white/60 transition-colors duration-300 group-hover:text-white/70">
								Access interactive lessons and trading guides
							</div>
						</div>
					</div>
				</div>

				<div className="group relative overflow-hidden rounded-xl transition-all duration-300">
					<div className="relative flex items-start gap-3 rounded-xl p-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#24FF66]/20 via-[#24FF66]/10 to-[#24FF66]/5 transition-colors duration-300 group-hover:from-[#24FF66]/30">
							<LuTrophy className="h-4 w-4 text-[#24FF66] transition-colors duration-300 group-hover:text-[#1ECC52]" />
						</div>
						<div className="flex-1">
							<div className="font-kodemono text-sm font-medium text-white transition-colors duration-300 group-hover:text-white">
								Skill Assessment
							</div>
							<div className="font-kodemono text-xs text-white/60 transition-colors duration-300 group-hover:text-white/70">
								Test your knowledge with trading quizzes
							</div>
						</div>
					</div>
				</div>
			</div>
		</TourContentWrapper>
	);
}
