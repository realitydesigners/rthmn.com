interface ConnectionStatusProps {
	isConnected: boolean;
}

export const ConnectionBadge: React.FC<ConnectionStatusProps> = ({
	isConnected,
}) => {
	return (
		<div
			className={`flex items-center gap-2 rounded-full border px-2 py-1.5 transition-all duration-300 ${isConnected ? "border-[#1C1E23] bg-[#1C1E23]" : "border-[#1C1E23] bg-black/40"} `}
		>
			<div className="relative flex h-3 w-3 items-center justify-center">
				<div
					className={`absolute inset-0 rounded-full transition-transform duration-700 ${isConnected ? "bg-[#32353C]" : "bg-[#1C1E23]"} `}
				/>
				<div
					className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${isConnected ? "bg-white/80" : "bg-white/30"} `}
				/>
			</div>
			<span
				className={`font-russo pr-1 text-[10px] font-medium tracking-wide transition-colors duration-300 ${isConnected ? "text-white/70" : "text-white/40"} `}
			>
				{isConnected ? "Connected" : "Disconnected"}
			</span>
		</div>
	);
};
