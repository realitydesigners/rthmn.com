import type React from "react";

interface ToggleProps {
	isEnabled: boolean;
	onToggle: () => void;
	size?: "sm" | "md";
	title?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
	isEnabled,
	onToggle,
	size = "sm",
	title,
}) => {
	const sizeClasses = {
		sm: {
			container: "h-5 w-10",
			thumb: "h-5 w-5",
		},
	};

	return (
		<div className="flex w-full items-center justify-between">
			{title && (
				<span className="font-kodemono text-[10px] font-medium tracking-wider text-[#666] uppercase">
					{title}
				</span>
			)}
			<div
				onClick={onToggle}
				className={`relative ${sizeClasses[size].container} cursor-pointer rounded-full bg-[#111] transition-all duration-300`}
			>
				<div
					className={`absolute inset-0 rounded-full bg-[#333] opacity-0 transition-opacity duration-300 ${isEnabled ? "opacity-100" : "opacity-0"}`}
				/>
				<div
					className={`absolute ${sizeClasses[size].thumb} rounded-full bg-[#666] transition-all duration-300 ${isEnabled ? "translate-x-5" : "translate-x-0"}`}
				/>
			</div>
		</div>
	);
};
