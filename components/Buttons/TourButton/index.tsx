interface TourButtonProps {
	onClick?: () => void;
	children?: React.ReactNode;
	variant?: "blue" | "black";
	disabled?: boolean;
}

export function TourButton({
	onClick,
	children = "Continue",
	variant = "blue",
	disabled = false,
}: TourButtonProps) {
	const isBlue = variant === "blue";

	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`group relative flex items-center justify-center overflow-hidden rounded-xl border px-6 py-2.5 text-sm font-medium transition-all duration-300 ${
				disabled
					? "cursor-not-allowed border-[#1C1E23] bg-[#0A0B0D] text-white/30"
					: isBlue
						? "border-blue-400/20 bg-gradient-to-b from-blue-400/10 via-blue-400/5 to-transparent text-blue-400 hover:border-blue-400/30 hover:text-blue-400"
						: "border-[#1C1E23] bg-gradient-to-b from-[#0A0B0D] to-[#070809] text-white/90 hover:border-[#32353C] hover:from-[#0A0B0D] hover:to-[#141414] hover:text-white hover:shadow-lg hover:shadow-black/20"
			}`}
		>
			{/* Glow overlay */}
			<div
				className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
					isBlue
						? "bg-blue-400/[0.03]"
						: "bg-gradient-to-b from-white/[0.03] to-transparent"
				}`}
			/>
			{/* Top highlight */}
			<div
				className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${
					isBlue ? "via-blue-400/20" : "via-white/10"
				} to-transparent`}
			/>
			{/* Bottom highlight */}
			<div
				className={`absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent ${
					isBlue ? "via-blue-400/10" : "via-white/5"
				} to-transparent`}
			/>
			<span className="font-outfit relative">{children}</span>
		</button>
	);
}
