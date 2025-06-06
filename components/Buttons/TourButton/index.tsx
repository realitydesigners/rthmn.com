import { FaArrowRight } from "react-icons/fa";

interface TourButtonProps {
	onClick?: () => void;
	children?: React.ReactNode;
	variant?: "blue" | "black" | "green";
	disabled?: boolean;
}

export function TourButton({
	onClick,
	children = "Continue",
	variant = "blue",
	disabled = false,
}: TourButtonProps) {
	const isBlue = variant === "blue";
	const isGreen = variant === "green";

	const getVariantStyles = () => {
		if (isGreen) {
			return {
				wrapper: "bg-[#24FF66] text-black hover:bg-[#1ECC52] border border-[#24FF66]/50 shadow-[0_0_20px_rgba(36,255,102,0.3)] hover:shadow-[0_0_30px_rgba(36,255,102,0.5)] before:absolute before:inset-0 before:bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.3)_50%,transparent_70%)] before:bg-[length:200%_200%] before:animate-[shimmer_3s_ease-in-out_infinite]",
				glow: "",
				highlight: "",
			};
		}
		if (isBlue) {
			return {
				wrapper: "border-blue-400/20 bg-gradient-to-b from-blue-400/10 via-blue-400/5 to-transparent text-blue-400 hover:border-blue-400/30 hover:text-blue-400",
				glow: "bg-blue-400/[0.03]",
				highlight: "via-blue-400/20",
			};
		}
		return {
			wrapper: "border-[#1C1E23] bg-gradient-to-b from-[#0A0B0D] to-[#070809] text-white/90 hover:border-[#32353C] hover:from-[#0A0B0D] hover:to-[#141414] hover:text-white hover:shadow-lg hover:shadow-black/20",
			glow: "bg-gradient-to-b from-white/[0.03] to-transparent",
			highlight: "via-white/10",
		};
	};

	const styles = getVariantStyles();

	return (
		<>
			<style jsx global>{`
                @keyframes shimmer {
                    0% {
                        background-position: -200% -200%;
                    }
                    100% {
                        background-position: 200% 200%;
                    }
                }
            `}</style>
			<button
				onClick={onClick}
				disabled={disabled}
				className={`group relative flex items-center justify-center overflow-hidden rounded-xl border px-6 py-2.5 text-sm font-medium transition-all duration-300 ${
					disabled
						? "cursor-not-allowed border-[#1C1E23] bg-[#0A0B0D] text-white/30"
						: `${styles.wrapper} ${!isGreen ? "" : "hover:scale-[1.02] active:scale-[0.98]"}`
				}`}
			>
				{!isGreen && (
					<>
						{/* Glow overlay */}
						<div
							className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${styles.glow}`}
						/>
						{/* Top highlight */}
						<div
							className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${styles.highlight} to-transparent`}
						/>
						{/* Bottom highlight */}
						<div
							className={`absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent ${isBlue ? "via-blue-400/10" : "via-white/5"} to-transparent`}
						/>
					</>
				)}
				
				<span className={`font-russo relative flex items-center gap-2 ${isGreen ? "font-kodemono uppercase font-semibold tracking-wide group-hover:tracking-wider" : ""}`}>
					{children}
					{isGreen && (
						<FaArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
					)}
				</span>
			</button>
		</>
	);
}
