export const StyleControl: React.FC<{
	label: string;
	value: number;
	onChange: (value: number) => void;
	min: number;
	max: number;
	step: number;
	unit?: string;
	hideLabel?: boolean;
	preview?: React.ReactNode;
}> = ({
	label,
	value,
	onChange,
	min,
	max,
	step,
	unit = "",
	hideLabel = false,
	preview,
}) => {
	const percentage = ((value - min) / (max - min)) * 100;

	return (
		<div className="group relative space-y-1.5">
			{!hideLabel && (
				<div className="flex items-center justify-between px-0.5">
					<div className="flex items-center gap-2">
						<span className="font-outfit text-[8px] font-medium tracking-wider text-[#BFC2CA] uppercase">
							{label}
						</span>
					</div>
					<div className="flex items-center gap-1">
						<span className="font-outfit text-[8px] text-white/70">
							{step < 1 ? value.toFixed(2) : value}
						</span>
						{unit && (
							<span className="font-outfit text-[8px] tracking-wider text-white/30 uppercase">
								{unit}
							</span>
						)}
					</div>
				</div>
			)}
			<div className="relative">
				{preview && (
					<div className="mb-2 h-10 rounded-md border border-white/[0.08] bg-[#111215]">
						{preview}
					</div>
				)}
				<div className="absolute inset-y-0 left-0 flex w-full items-center px-2">
					<div className="relative h-[1px] w-full bg-white/[0.06]">
						<div
							className="absolute h-full bg-gradient-to-r from-[#32353C] to-[#1C1E23]"
							style={{ width: `${percentage}%` }}
						/>
					</div>
				</div>
				<input
					type="range"
					min={min}
					max={max}
					step={step}
					value={value}
					onChange={(e) => onChange(Number.parseFloat(e.target.value))}
					className="relative h-6 w-full cursor-pointer appearance-none rounded-md bg-transparent transition-all hover:cursor-grab active:cursor-grabbing"
					style={
						{
							"--thumb-size": "12px",
							"--thumb-color": "#fff",
						} as React.CSSProperties
					}
				/>
				<style jsx global>{`
                    input[type='range']::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        height: var(--thumb-size);
                        width: var(--thumb-size);
                        border-radius: 50%;
                        background: var(--thumb-color);
                        box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        cursor: grab;
                        transition: all 0.15s ease;
                    }
                    input[type='range']::-webkit-slider-thumb:hover {
                        transform: scale(1.1);
                        box-shadow: 0 0 15px rgba(255, 255, 255, 0.15);
                        border-color: rgba(255, 255, 255, 0.25);
                    }
                    input[type='range']::-webkit-slider-thumb:active {
                        cursor: grabbing;
                        transform: scale(0.95);
                        box-shadow: 0 0 8px rgba(255, 255, 255, 0.08);
                    }
                    input[type='range']::-webkit-slider-runnable-track {
                        background: transparent;
                    }
                `}</style>
			</div>
		</div>
	);
};
