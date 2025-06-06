import { LuBox, LuLayoutGrid, LuPalette } from "react-icons/lu";
import { TourContentWrapper } from "./TourContentWrapper";

interface SettingsContentProps {
	onComplete?: () => void;
}

export function TourSettings({ onComplete }: SettingsContentProps) {
	return (
		<TourContentWrapper className="w-[350px]" onComplete={onComplete}>
			<div className="w-full p-2">
				<h3 className="font-russo text-2xl font-bold text-white">
					Settings
				</h3>
				<p className="font-kodemono text-[13px] leading-relaxed text-white/60">
					Customize your trading view and visualization preferences.
				</p>
			</div>
			<div className="space-y-2">
				<div className="group relative overflow-hidden rounded-xl transition-all duration-300">
					<div className="relative flex items-start gap-3 rounded-xl p-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#24FF66]/20 via-[#24FF66]/10 to-[#24FF66]/5 transition-colors duration-300 group-hover:from-[#24FF66]/30">
							<LuPalette className="h-4 w-4 text-[#24FF66] transition-colors duration-300 group-hover:text-[#1ECC52]" />
						</div>
						<div className="flex-1">
							<div className="font-kodemono text-sm font-medium text-white transition-colors duration-300 group-hover:text-white">
								Color Themes
							</div>
							<div className="font-kodemono text-xs text-white/60 transition-colors duration-300 group-hover:text-white/70">
								Choose from preset themes or customize your colors
							</div>
						</div>
					</div>
				</div>

				<div className="group relative overflow-hidden rounded-xl transition-all duration-300">
					<div className="relative flex items-start gap-3 rounded-xl p-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#24FF66]/20 via-[#24FF66]/10 to-[#24FF66]/5 transition-colors duration-300 group-hover:from-[#24FF66]/30">
							<LuLayoutGrid className="h-4 w-4 text-[#24FF66] transition-colors duration-300 group-hover:text-[#1ECC52]" />
						</div>
						<div className="flex-1">
							<div className="font-kodemono text-sm font-medium text-white transition-colors duration-300 group-hover:text-white">
								Timeframe Control
							</div>
							<div className="font-kodemono text-xs text-white/60 transition-colors duration-300 group-hover:text-white/70">
								Adjust visible timeframes and global controls
							</div>
						</div>
					</div>
				</div>

				<div className="group relative overflow-hidden rounded-xl transition-all duration-300">
					<div className="relative flex items-start gap-3 rounded-xl p-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#24FF66]/20 via-[#24FF66]/10 to-[#24FF66]/5 transition-colors duration-300 group-hover:from-[#24FF66]/30">
							<LuBox className="h-4 w-4 text-[#24FF66] transition-colors duration-300 group-hover:text-[#1ECC52]" />
						</div>
						<div className="flex-1">
							<div className="font-kodemono text-sm font-medium text-white transition-colors duration-300 group-hover:text-white">
								Visual Style
							</div>
							<div className="font-kodemono text-xs text-white/60 transition-colors duration-300 group-hover:text-white/70">
								Configure box styles, borders, and opacity
							</div>
						</div>
					</div>
				</div>
			</div>
		</TourContentWrapper>
	);
}
