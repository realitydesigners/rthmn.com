import { TourButton } from "@/components/Buttons/TourButton";
import { cn } from "@/utils/cn";
import type { ReactNode } from "react";

interface TourContentWrapperProps {
	children: ReactNode;
	className?: string;
	onComplete?: () => void;
}

export function TourContentWrapper({
	children,
	className,
	onComplete,
}: TourContentWrapperProps) {
	return (
		<div
			className={cn(
				"no-select overflow-hidden  border border-[#1C1E23] bg-gradient-to-b from-[#0A0B0D] to-[#070809] p-4 shadow-2xl",
				className,
			)}
		>
			<div className="relative flex h-full flex-col items-end justify-end space-y-2">
				{children}
				<TourButton onClick={onComplete} />
			</div>
		</div>
	);
}
