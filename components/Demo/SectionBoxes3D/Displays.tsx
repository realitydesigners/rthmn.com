import { memo } from "react";
import { LuOrbit, LuBox, LuChevronRight, LuChevronLeft } from "react-icons/lu";

// Enhanced Mode Toggle Component
interface ModeToggleProps {
	viewMode: "scene" | "box";
	onToggle: () => void;
}

export const ModeToggle = memo(({ viewMode, onToggle }: ModeToggleProps) => (
	<div className="relative">
		<button
			type="button"
			onClick={onToggle}
			className="group relative flex items-center gap-3 px-6 py-3 rounded-xl border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-[#32353C]/80 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
		>
			{/* Background glow */}
			<div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.02] via-transparent to-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

			{/* Top highlight */}
			<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

			<div className="relative z-10 flex items-center gap-3">
				{/* Mode indicator */}
				<div className="flex items-center gap-2">
					<div
						className={`w-2 h-2 rounded-full transition-all duration-300 ${
							viewMode === "scene"
								? "bg-[#24FF66] shadow-[0_0_8px_rgba(36,255,102,0.6)]"
								: "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
						}`}
					/>
					<span className="font-outfit text-xs font-medium tracking-wider text-[#818181] uppercase">
						{viewMode === "scene" ? "Scene Mode" : "Focus Mode"}
					</span>
				</div>

				{/* Toggle switch */}
				<div className="relative w-12 h-6 bg-[#1C1E23] rounded-full border border-[#32353C]/60">
					<div
						className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ${
							viewMode === "scene"
								? "left-0.5 bg-gradient-to-b from-[#24FF66] to-[#1ECC52] shadow-[0_0_10px_rgba(36,255,102,0.4)]"
								: "left-6 bg-gradient-to-b from-blue-400 to-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
						}`}
					/>
				</div>

				{/* Icon and label */}
				<div className="flex items-center gap-2">
					{viewMode === "scene" ? (
						<>
							<LuOrbit className="w-4 h-4 text-[#24FF66]" />
							<span className="font-outfit text-sm font-medium text-white">
								Switch to Focus
							</span>
						</>
					) : (
						<>
							<LuBox className="w-4 h-4 text-blue-400" />
							<span className="font-outfit text-sm font-medium text-white">
								Back to Scene
							</span>
						</>
					)}
				</div>
			</div>
		</button>
	</div>
));

ModeToggle.displayName = "ModeToggle";

// Enhanced Structure Indicator Component
interface StructureIndicatorProps {
	structures: Array<{ pair: string; name: string }>;
	activeIndex: number;
	onSelect: (index: number) => void;
}

export const StructureIndicator = memo(
	({ structures, activeIndex, onSelect }: StructureIndicatorProps) => (
		<div className="relative">
			<div className="flex items-center gap-4 px-6 py-3 rounded-xl border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
				{/* Background glow */}
				<div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.02] via-transparent to-black/10" />

				{/* Top highlight */}
				<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

				<div className="relative z-10 flex items-center gap-4">
					{/* Current structure info */}
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-gradient-to-b from-[#24FF66]/20 to-[#24FF66]/10 border border-[#24FF66]/30 flex items-center justify-center">
								<span className="font-outfit text-sm font-bold text-[#24FF66]">
									{structures[activeIndex].pair}
								</span>
							</div>
							<div className="flex flex-col">
								<span className="font-outfit text-sm font-medium text-white">
									{structures[activeIndex].name}
								</span>
								<span className="font-outfit text-xs text-[#818181]">
									Active Structure
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	),
);

StructureIndicator.displayName = "StructureIndicator";

interface ControlPanelProps {
	children: React.ReactNode;
	title?: string;
	className?: string;
}

export const ControlPanel = memo(
	({ children, title, className = "" }: ControlPanelProps) => (
		<div
			className={`
		relative overflow-hidden rounded-xl border border-[#1C1E23]/60 
		bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 
		backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)]
		${className}
	`}
		>
			{/* Subtle radial glow */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_50%)]" />

			{/* Top border highlight */}
			<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

			<div className="relative z-10 p-4">
				{title && (
					<div className="mb-3 flex items-center gap-2">
						<span className="font-outfit text-xs font-medium tracking-wider text-[#818181] uppercase">
							{title}
						</span>
					</div>
				)}
				{children}
			</div>
		</div>
	),
);

ControlPanel.displayName = "ControlPanel";

// Modular Button Components
interface BaseButtonProps {
	onClick?: () => void;
	disabled?: boolean;
	className?: string;
	children: React.ReactNode;
	variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
	size?: "sm" | "md" | "lg";
}

export const BaseButton = memo(
	({
		onClick,
		disabled = false,
		className = "",
		children,
		variant = "secondary",
		size = "md",
	}: BaseButtonProps) => {
		const sizeClasses = {
			sm: "h-8 w-8 text-xs",
			md: "h-10 w-10 text-sm",
			lg: "h-12 w-12 text-base",
		};

		const variantClasses = {
			primary:
				"bg-gradient-to-b from-[#24FF66]/20 to-[#24FF66]/10 border-[#24FF66]/30 text-[#24FF66] hover:border-[#24FF66]/50 hover:from-[#24FF66]/30 hover:to-[#24FF66]/15 hover:shadow-[0_0_20px_rgba(36,255,102,0.3)]",
			secondary:
				"bg-gradient-to-b from-[#1C1E23]/60 to-[#0F1012]/40 border-[#1C1E23]/60 text-[#818181] hover:border-[#32353C]/80 hover:from-[#1C1E23]/80 hover:to-[#0F1012]/60 hover:text-white hover:shadow-[0_0_15px_rgba(0,0,0,0.4)]",
			ghost:
				"bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/60 border-[#1C1E23]/40 text-white/70 hover:bg-[#1C1E23]/60 hover:border-[#32353C]/60 hover:text-white backdrop-blur-sm",
			danger:
				"bg-gradient-to-b from-red-500/20 to-red-500/10 border-red-500/30 text-red-400 hover:border-red-500/50 hover:from-red-500/30 hover:to-red-500/15 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]",
			success:
				"bg-gradient-to-b from-blue-500/20 to-blue-500/10 border-blue-500/30 text-blue-400 hover:border-blue-500/50 hover:from-blue-500/30 hover:to-blue-500/15 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]",
		};

		return (
			<button
				type="button"
				onClick={onClick}
				disabled={disabled}
				className={`
				group relative flex items-center justify-center rounded-lg border transition-all duration-300 backdrop-blur-sm
				${sizeClasses[size]}
				${variantClasses[variant]}
				${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"}
				${className}
			`}
			>
				{/* Subtle inner glow */}
				<div className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/[0.02] via-transparent to-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

				{/* Top highlight */}
				<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

				{/* Content */}
				<div className="relative z-10">{children}</div>
			</button>
		);
	},
);

BaseButton.displayName = "BaseButton";

// Navigation Button Component
interface NavButtonProps {
	direction: "left" | "right";
	onClick: () => void;
	disabled?: boolean;
}

export const NavButton = memo(
	({ direction, onClick, disabled }: NavButtonProps) => (
		<BaseButton
			onClick={onClick}
			disabled={disabled}
			variant="ghost"
			size="lg"
			className="shadow-lg"
		>
			{direction === "left" ? (
				<LuChevronLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
			) : (
				<LuChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
			)}
		</BaseButton>
	),
);

NavButton.displayName = "NavButton";
