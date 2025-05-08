import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import type { IconType } from "react-icons";
import { cn } from "@/utils/cn";

interface PanelSectionProps {
	title: string;
	icon: IconType;
	isExpanded: boolean;
	onToggle: () => void;
	children?: React.ReactNode;
	className?: string;
}

export const PanelSection = ({
	title,
	icon: Icon,
	isExpanded,
	onToggle,
	children,
	className,
}: PanelSectionProps) => {
	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<button
				type="button"
				onClick={onToggle}
				className="group flex h-10 items-center justify-between rounded-lg border border-white/[0.02] bg-gradient-to-b from-[#0A0B0D] to-[#070809] px-2 transition-all duration-300 hover:border-[#1C1E23] hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.5)]"
			>
				<div className="flex items-center">
					<div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#0A0B0D] to-[#070809] shadow-xl">
						<Icon
							size={14}
							className="text-[#32353C] transition-colors group-hover:text-[#545963]"
						/>
					</div>
					<span className="font-outfit text-[13px] font-medium tracking-wide text-[#32353C] transition-colors group-hover:text-[#545963]">
						{title}
					</span>
				</div>
				{isExpanded ? (
					<LuChevronUp
						size={14}
						className="text-[#32353C] transition-colors group-hover:text-[#545963]"
					/>
				) : (
					<LuChevronDown
						size={14}
						className="text-[#32353C] transition-colors group-hover:text-[#545963]"
					/>
				)}
			</button>

			{isExpanded && (
				<div className="rounded-lg border border-white/[0.02] bg-gradient-to-b from-[#0A0B0D] to-[#070809] transition-all duration-300">
					{children}
				</div>
			)}
		</div>
	);
};
