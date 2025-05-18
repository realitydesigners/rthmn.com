interface TourButtonProps {
	onClick?: () => void;
	children?: React.ReactNode;
}

export function TourButton({
	onClick,
	children = "Continue",
}: TourButtonProps) {
	return (
		<button
			onClick={onClick}
			className="group relative flex items-center justify-center overflow-hidden rounded-xl border border-blue-400/20 bg-gradient-to-b from-blue-400/10 via-blue-400/5 to-transparent px-6 py-2.5 text-sm font-medium text-blue-400 transition-all duration-300 hover:border-blue-400/30 hover:text-blue-400 "
		>
			{/* Glow overlay */}
			<div className="absolute inset-0 rounded-xl bg-blue-400/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
			{/* Top highlight */}
			<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
			{/* Bottom highlight */}
			<div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/10 to-transparent" />
			<span className="font-outfit relative">{children}</span>
		</button>
	);
}
