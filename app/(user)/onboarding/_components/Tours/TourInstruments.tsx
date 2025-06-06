import { LuLayoutGrid, LuZap } from "react-icons/lu";
import { TourContentWrapper } from "./TourContentWrapper";

interface InstrumentsContentProps {
	onComplete?: () => void;
}

export function TourInstruments({ onComplete }: InstrumentsContentProps) {
	return (
		<TourContentWrapper className="w-[350px]" onComplete={onComplete}>
			<div className="w-full p-2">
				<h3 className="font-russo text-2xl font-bold text-white">
					Instruments
				</h3>
				<p className="font-kodemono text-[13px] leading-relaxed text-white/60">
					Track real-time market data across multiple assets.
				</p>
			</div>
			<div className="space-y-2">
				<div className="group relative overflow-hidden rounded-xl transition-all duration-300">
					<div className="relative flex items-start gap-3 rounded-xl p-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#24FF66]/20 via-[#24FF66]/10 to-[#24FF66]/5 transition-colors duration-300 group-hover:from-[#24FF66]/30">
							<LuZap className="h-4 w-4 text-[#24FF66] transition-colors duration-300 group-hover:text-[#1ECC52]" />
						</div>
						<div className="flex-1">
							<div className="font-kodemono text-sm font-medium text-white transition-colors duration-300 group-hover:text-white">
								Live Price Updates
							</div>
							<div className="font-kodemono text-xs text-white/60 transition-colors duration-300 group-hover:text-white/70">
								Track real-time prices for FX, Crypto, Stocks & ETFs
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
								Instrument Selection
							</div>
							<div className="font-kodemono text-xs text-white/60 transition-colors duration-300 group-hover:text-white/70">
								Easily add or remove trading pairs from your watchlist
							</div>
						</div>
					</div>
				</div>
			</div>
		</TourContentWrapper>
	);
}
