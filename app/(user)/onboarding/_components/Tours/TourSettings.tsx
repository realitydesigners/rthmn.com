import { LuBox, LuLayoutGrid, LuPalette } from "react-icons/lu";
import { TourContentWrapper } from "./TourContentWrapper";

interface SettingsContentProps {
	onComplete?: () => void;
}

export function TourSettings({ onComplete }: SettingsContentProps) {
	return (
		<TourContentWrapper
			className="w-[350px]"
			onComplete={onComplete}
		>
			<div className="w-full p-2">
				<h3 className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-2xl font-bold text-transparent">
					Settings
				</h3>
				<p className="text-[13px] leading-relaxed primary-text">
					Customize your trading view and visualization preferences.
				</p>
			</div>
			<div className="space-y-2">
				<div className="group relative overflow-hidden rounded-xl transition-all duration-300">
					<div className="relative flex items-start gap-3 rounded-xl p-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-blue-400/20 via-blue-400/10 to-blue-400/5 transition-colors duration-300 group-hover:from-blue-400/30">
							<LuPalette className="h-4 w-4 text-blue-400 transition-colors duration-300 group-hover:text-blue-400/80" />
						</div>
						<div className="flex-1">
							<div className="text-sm font-medium text-neutral-200 transition-colors duration-300 group-hover:text-white">
								Color Themes
							</div>
							<div className="text-xs primary-text transition-colors duration-300 group-hover:primary-text">
								Choose from preset themes or customize your colors
							</div>
						</div>
					</div>
				</div>

				<div className="group relative overflow-hidden rounded-xl transition-all duration-300">
					<div className="relative flex items-start gap-3 rounded-xl p-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-blue-400/20 via-blue-400/10 to-blue-400/5 transition-colors duration-300 group-hover:from-blue-400/30">
							<LuLayoutGrid className="h-4 w-4 text-blue-400 transition-colors duration-300 group-hover:text-blue-400/80" />
						</div>
						<div className="flex-1">
							<div className="text-sm font-medium text-neutral-200 transition-colors duration-300 group-hover:text-white">
								Timeframe Control
							</div>
							<div className="text-xs primary-text transition-colors duration-300 group-hover:primary-text">
								Adjust visible timeframes and global controls
							</div>
						</div>
					</div>
				</div>

				<div className="group relative overflow-hidden rounded-xl transition-all duration-300">
					<div className="relative flex items-start gap-3 rounded-xl p-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-blue-400/20 via-blue-400/10 to-blue-400/5 transition-colors duration-300 group-hover:from-blue-400/30">
							<LuBox className="h-4 w-4 text-blue-400 transition-colors duration-300 group-hover:text-blue-400/80" />
						</div>
						<div className="flex-1">
							<div className="text-sm font-medium text-neutral-200 transition-colors duration-300 group-hover:text-white">
								Visual Style
							</div>
							<div className="text-xs primary-text transition-colors duration-300 group-hover:primary-text">
								Configure box styles, borders, and opacity
							</div>
						</div>
					</div>
				</div>
			</div>
		</TourContentWrapper>
	);
}
