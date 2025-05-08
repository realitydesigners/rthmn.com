import type { BoxColors } from "@/types/types";
import type React from "react";
import { memo, useCallback, useEffect, useState } from "react";

interface CustomColorPickerProps {
	boxColors: BoxColors;
	onColorChange: (colors: BoxColors) => void;
}

interface ColorInputProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
}

// Debounce function to improve performance
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

const ColorInput = memo(
	({ label, value, onChange }: ColorInputProps) => {
		// Use local state for immediate visual feedback
		const [localValue, setLocalValue] = useState(value);

		// Update local state when prop changes
		useEffect(() => {
			setLocalValue(value);
		}, [value]);

		// Debounce the color changes
		const debouncedValue = useDebounce(localValue, 50);

		// Only trigger parent onChange when debounced value changes
		useEffect(() => {
			if (debouncedValue !== value) {
				onChange(debouncedValue);
			}
		}, [debouncedValue, onChange, value]);

		const handleChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				setLocalValue(e.target.value);
			},
			[],
		);

		return (
			<div className="group flex flex-col gap-2">
				<div className="relative h-10 w-full overflow-hidden rounded-lg border border-[#222] bg-[#0C0C0C] transition-all duration-200 hover:border-[#1C1E23]  hover:bg-[#111]">
					<div className="absolute inset-0 flex items-center px-3">
						<span className="font-kodemono text-[10px] font-medium tracking-wider text-[#32353C] uppercase">
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
						className="h-full w-full cursor-pointer opacity-0"
					/>
				</div>
			</div>
		);
	},
	(prevProps, nextProps) => prevProps.value === nextProps.value,
); // Custom equality check

export const CustomColorPicker = memo(
	({ boxColors, onColorChange }: CustomColorPickerProps) => {
		const handlePositiveChange = useCallback(
			(value: string) =>
				onColorChange({
					...boxColors,
					positive: value,
				}),
			[boxColors, onColorChange],
		);

		const handleNegativeChange = useCallback(
			(value: string) =>
				onColorChange({
					...boxColors,
					negative: value,
				}),
			[boxColors, onColorChange],
		);

		return (
			<div className="mt-4 flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<span className="font-kodemono text-[10px] font-medium tracking-wider text-[#32353C] uppercase">
						Custom Colors
					</span>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<ColorInput
						label="Positive"
						value={boxColors.positive}
						onChange={handlePositiveChange}
					/>
					<ColorInput
						label="Negative"
						value={boxColors.negative}
						onChange={handleNegativeChange}
					/>
				</div>
			</div>
		);
	},
	(prevProps, nextProps) =>
		prevProps.boxColors.positive === nextProps.boxColors.positive &&
		prevProps.boxColors.negative === nextProps.boxColors.negative,
);
