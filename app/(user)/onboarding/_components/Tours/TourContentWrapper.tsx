import { ReactNode } from "react";
import { TourButton } from "@/components/Buttons/TourButton";
import { cn } from "@/utils/cn";

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
		<div className={cn(
			"no-select overflow-hidden rounded-xl border border-[#0A0B0D] bg-gradient-to-b from-[#0A0B0D] to-[#070809] p-4 shadow-2xl before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.05),rgba(255,255,255,0))]",
			className
		)}>
			<div className="relative flex h-full flex-col items-end justify-end space-y-2">
				{children}
				<TourButton onClick={onComplete} />
			</div>
		</div>
	);
} 