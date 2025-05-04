import { create } from "zustand";
import type { BoxColors } from "./colorStore";

export interface Preset {
	name: string;
	positive: string;
	negative: string;
	styles: Required<NonNullable<BoxColors["styles"]>>;
}

interface PresetState {
	presets: Preset[];
	selectedPreset: string | null;
	selectPreset: (name: string) => void;
}

const DEFAULT_PRESETS: Preset[] = [
	{
		name: "CYBER.01",
		positive: "#00ffd5", // Cyan
		negative: "#ff2975", // Hot pink
		styles: {
			borderRadius: 4,
			shadowIntensity: 0.1,
			opacity: 0.2,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,
			perspective: false,
			viewMode: "default",
		},
	},
	{
		name: "HOLO.02",
		positive: "#39ff14", // Matrix green
		negative: "#b91dff", // Electric purple
		styles: {
			borderRadius: 6,
			shadowIntensity: 0.1,
			opacity: 0.2,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,
			perspective: false,
			viewMode: "default",
		},
	},
	{
		name: "VOID.03",
		positive: "#e6e6ff", // Soft white
		negative: "#6600cc", // Deep purple
		styles: {
			borderRadius: 8,
			shadowIntensity: 0.1,
			opacity: 0.2,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,
			perspective: false,
			viewMode: "default",
		},
	},
	{
		name: "PLSM.04",
		positive: "#ff9933", // Orange
		negative: "#6600ff", // Royal purple
		styles: {
			borderRadius: 5,
			shadowIntensity: 0.1,
			opacity: 0.2,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,
			perspective: false,
			viewMode: "default",
		},
	},
	{
		name: "CRYO.05",
		positive: "#ffffff", // Pure white
		negative: "#0066ff", // Bright blue
		styles: {
			borderRadius: 6,
			shadowIntensity: 0.1,
			opacity: 0.2,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,
			perspective: false,
			viewMode: "default",
		},
	},
	{
		name: "PRPL.06",
		positive: "#b3b3ff", // Light purple
		negative: "#4d0099", // Deep purple
		styles: {
			borderRadius: 7,
			shadowIntensity: 0.1,
			opacity: 0.2,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,
			perspective: false,
			viewMode: "default",
		},
	},
	{
		name: "FLUX.07",
		positive: "#1aff1a", // Bright green
		negative: "#ff1a1a", // Bright red
		styles: {
			borderRadius: 6,
			shadowIntensity: 0.1,
			opacity: 0.2,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,
			perspective: false,
			viewMode: "default",
		},
	},
	{
		name: "FRST.08",
		positive: "#e6ffff", // Ice white
		negative: "#0099ff", // Sky blue
		styles: {
			borderRadius: 5,
			shadowIntensity: 0.1,
			opacity: 0.2,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,
			perspective: false,
			viewMode: "default",
		},
	},
	{
		name: "ZERO.09",
		positive: "#ffffff", // Pure white
		negative: "#ff0000", // Pure red
		styles: {
			borderRadius: 4,
			shadowIntensity: 0.1,
			opacity: 0.2,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,
			perspective: false,
			viewMode: "default",
		},
	},
];

export const usePresetStore = create<PresetState>()((set) => ({
	presets: DEFAULT_PRESETS,
	selectedPreset: null,
	selectPreset: (name) => set({ selectedPreset: name }),
}));
