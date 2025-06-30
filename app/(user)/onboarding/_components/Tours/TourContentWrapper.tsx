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
				"no-select overflow-hidden border border-[#1C1E23]/60 bg-black shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-4 relative",
				className,
			)}
		>
			{/* Top highlight */}
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

			<div className="relative flex h-full flex-col items-end justify-end space-y-2">
				{children}
				<TourButton onClick={onComplete} variant="green" />
			</div>
		</div>
	);
}
