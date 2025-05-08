import type React from "react";
import { memo, useCallback, useEffect, useState, useRef } from "react";
import { LuPalette } from "react-icons/lu";
import { PanelSection } from "../PanelSection";
import { cn } from "@/utils/cn";
import type { Preset } from "@/stores/colorStore";
import { usePresetStore, useColorStore } from "@/stores/colorStore";

interface ColorStyleOptionsProps {
	noContainer?: boolean;
	className?: string;
}

// Debounce hook from CustomColorPicker
const useDebounce = (value: any, delay: number) => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
};

// ColorInput component from CustomColorPicker
const ColorInput = memo(
	({
		label,
		value,
		onChange,
	}: { label: string; value: string; onChange: (value: string) => void }) => {
		const [localValue, setLocalValue] = useState(value);
		const isInternalChange = useRef(false);

		useEffect(() => {
			if (value !== localValue && !isInternalChange.current) {
				setLocalValue(value);
			}
		}, [value, localValue]);

		const debouncedValue = useDebounce(localValue, 50);

		useEffect(() => {
			if (debouncedValue !== value && isInternalChange.current) {
				onChange(debouncedValue);
			}
		}, [debouncedValue, onChange, value]);

		const handleChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				isInternalChange.current = true;
				setLocalValue(e.target.value);
			},
			[],
		);

		const handleBlur = useCallback(() => {
			isInternalChange.current = false;
		}, []);

		return (
			<div className="group flex flex-col gap-2">
				<div className="relative h-10 w-full overflow-hidden rounded-lg border border-[#222] bg-[#0C0C0C] transition-all duration-200 hover:border-[#1C1E23]  hover:bg-[#111]">
					<div className="absolute inset-0 flex items-center px-3">
						<span className="font-outfit text-[8px] font-medium tracking-wider text-[#32353C] uppercase">
							{label}
						</span>
						<div
							className="ml-auto h-6 w-6 rounded-full shadow-lg"
							style={{
								background: localValue,
								boxShadow: `0 0 10px ${localValue}33`,
							}}
						/>
					</div>
					<input
						type="color"
						value={localValue}
						onChange={handleChange}
						onBlur={handleBlur}
						className="h-full w-full cursor-pointer opacity-0"
					/>
				</div>
			</div>
		);
	},
);

// PresetButton component from ColorPresets
const PresetButton = memo(
	({
		preset,
		isSelected,
		onClick,
	}: { preset: Preset; isSelected: boolean; onClick: () => void }) => (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"group relative flex h-[72px] flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border bg-gradient-to-b p-2 transition-all duration-200",
				isSelected
					? "border-[#1C1E23]  from-[#181818]/80 to-[#0F0F0F]/90 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-[#32353C] hover:from-[#1c1c1c]/80 hover:to-[#141414]/90"
					: "border-[#222] from-[#141414]/30 to-[#0A0A0A]/40 hover:border-[#1C1E23]  hover:from-[#181818]/40 hover:to-[#0F0F0F]/50",
			)}
			style={{
				backgroundImage: `radial-gradient(circle at 30% 30%, ${preset.positive}${isSelected ? "11" : "05"}, ${preset.negative}${isSelected ? "22" : "08"})`,
				backdropFilter: "blur(20px)",
			}}
		>
			<div
				className={cn(
					"absolute inset-0",
					isSelected ? "opacity-50" : "opacity-20",
				)}
				style={{
					background: `radial-gradient(circle at 30% 30%, ${preset.positive}${isSelected ? "22" : "11"}, ${preset.negative}${isSelected ? "33" : "15"})`,
				}}
			/>

			<div className="relative h-8 w-8 overflow-hidden rounded-full shadow-xl">
				<div
					className="absolute inset-0 transition-transform duration-200 group-hover:scale-110"
					style={{
						background: `radial-gradient(circle at 30% 30%, ${preset.positive}, ${preset.negative})`,
						boxShadow: `
                        inset 0 0 15px ${preset.positive}66,
                        inset 2px 2px 4px ${preset.positive}33,
                        0 0 20px ${preset.positive}22
                    `,
					}}
				/>
			</div>

			<div className="relative flex flex-col items-center">
				<span className="font-kodemono text-[8px] font-medium tracking-widest text-[#32353C] uppercase transition-colors group-hover:text-[#818181]">
					{preset.name}
				</span>
			</div>
		</button>
	),
);

export const ColorStyleOptions = memo(
	({ noContainer = false, className }: ColorStyleOptionsProps) => {
		const [isExpanded, setIsExpanded] = useState(true);

		// Get all necessary state and actions from stores
		const boxColors = useColorStore((state) => state.boxColors);
		const updateBoxColors = useColorStore((state) => state.updateBoxColors);
		const setPresetColors = useColorStore((state) => state.setPresetColors);
		const presets = usePresetStore((state) => state.presets);
		const selectedPreset = usePresetStore((state) => state.selectedPreset);
		const selectPreset = usePresetStore((state) => state.selectPreset);

		// Debug current state
		useEffect(() => {
			console.log("Current state:", {
				selectedPreset,
				positive: boxColors.positive,
				negative: boxColors.negative,
			});
		}, [selectedPreset, boxColors]);

		// Handle individual color changes
		const handlePositiveChange = useCallback(
			(value: string) => {
				console.log("Changing positive color to:", value);
				selectPreset(null);
				updateBoxColors({ positive: value });
			},
			[updateBoxColors, selectPreset],
		);

		const handleNegativeChange = useCallback(
			(value: string) => {
				console.log("Changing negative color to:", value);
				selectPreset(null);
				updateBoxColors({ negative: value });
			},
			[updateBoxColors, selectPreset],
		);

		// Handle preset selection
		const handlePresetSelect = useCallback(
			(preset: Preset) => {
				console.log("Selecting preset:", preset.name);
				// First update the colors
				setPresetColors(preset);
				// Then update the selected preset
				selectPreset(preset.name);
			},
			[setPresetColors, selectPreset],
		);

		const content = (
			<div className="flex flex-col gap-4 p-2">
				{/* Presets Grid */}
				<div className="grid grid-cols-3 gap-2">
					{presets.map((preset) => (
						<PresetButton
							key={preset.name}
							preset={preset}
							isSelected={selectedPreset === preset.name}
							onClick={() => handlePresetSelect(preset)}
						/>
					))}
				</div>

				{/* Custom Color Inputs */}
				<div className="flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<span className="font-kodemono text-[10px] font-medium tracking-wider text-[#32353C] uppercase">
							Custom Colors
						</span>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<ColorInput
							label="Up Trend"
							value={boxColors.positive}
							onChange={handlePositiveChange}
						/>
						<ColorInput
							label="Dn Trend"
							value={boxColors.negative}
							onChange={handleNegativeChange}
						/>
					</div>
				</div>
			</div>
		);

		if (noContainer) {
			return content;
		}

		return (
			<PanelSection
				title="Color Style"
				icon={LuPalette}
				isExpanded={isExpanded}
				onToggle={() => setIsExpanded(!isExpanded)}
				className={className}
			>
				{content}
			</PanelSection>
		);
	},
);
