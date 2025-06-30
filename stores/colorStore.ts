import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Preset {
	name: string;
	positive: string;
	negative: string;
	styles: Required<NonNullable<BoxColors["styles"]>>;
}

interface PresetState {
	presets: Preset[];
	selectedPreset: string | null;
	selectPreset: (name: string | null) => void;
}

const DEFAULT_PRESETS: Preset[] = [
	{
		name: "FLUX.01",
		positive: "#FF4B6B", // Warm red glow
		negative: "#303238",
		styles: {
			borderRadius: 4,
			shadowIntensity: 0.4,
			opacity: 0.61,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,

			viewMode: "default",
		},
	},
	{
		name: "NOVA.02",
		positive: "#FFA264", // Warm orange pulse
		negative: "#303238",
		styles: {
			borderRadius: 4,
			shadowIntensity: 0.4,
			opacity: 0.61,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,

			viewMode: "default",
		},
	},
	{
		name: "SYNC.03",
		positive: "#FFE64D", // Electric yellow
		negative: "#303238",
		styles: {
			borderRadius: 4,
			shadowIntensity: 0.4,
			opacity: 0.61,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,

			viewMode: "default",
		},
	},
	{
		name: "GRID.04",
		positive: "#24FF66", // Matrix blue
		negative: "#303238",
		styles: {
			borderRadius: 4,
			shadowIntensity: 0.4,
			opacity: 0.61,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,

			viewMode: "default",
		},
	},
	{
		name: "WAVE.05",
		positive: "#4DB4FF", // Data stream blue
		negative: "#303238",
		styles: {
			borderRadius: 4,
			shadowIntensity: 0.4,
			opacity: 0.61,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,

			viewMode: "default",
		},
	},
	{
		name: "NEON.06",
		positive: "#7C7CFF", // Electric purple
		negative: "#303238",
		styles: {
			borderRadius: 4,
			shadowIntensity: 0.4,
			opacity: 0.61,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,

			viewMode: "default",
		},
	},
	{
		name: "PULSE.07",
		positive: "#FF4BC2", // Hot pink
		negative: "#303238",
		styles: {
			borderRadius: 4,
			shadowIntensity: 0.4,
			opacity: 0.61,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,

			viewMode: "default",
		},
	},
	{
		name: "ZERO.08",
		positive: "#DB6BFF", // Bio-electric magenta
		negative: "#303238",
		styles: {
			borderRadius: 4,
			shadowIntensity: 0.4,
			opacity: 0.61,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,

			viewMode: "default",
		},
	},
	{
		name: "VOID.09",
		positive: "#FFFFFF", // Pure white
		negative: "#303238",
		styles: {
			borderRadius: 4,
			shadowIntensity: 0.4,
			opacity: 0.61,
			showBorder: true,
			globalTimeframeControl: false,
			showLineChart: false,

			viewMode: "default",
		},
	},
];

export const usePresetStore = create<PresetState>()((set) => ({
	presets: DEFAULT_PRESETS,
	selectedPreset: null,
	selectPreset: (name) => {
		console.log("Selecting preset:", name);
		set({ selectedPreset: name });
	},
}));

export interface BoxColors {
	positive: string;
	negative: string;
	styles?: {
		borderRadius: number;
		shadowIntensity: number;
		opacity: number;
		showBorder: boolean;
		globalTimeframeControl: boolean;
		showLineChart: boolean;
		viewMode?: "default" | "3d" | "line";
	};
}

export interface ColorState {
	boxColors: BoxColors;
	updateBoxColors: (colors: Partial<BoxColors>) => void;
	updateStyles: (styles: Partial<BoxColors["styles"]>) => void;
	setPresetColors: (preset: Preset) => void;
}

const DEFAULT_BOX_COLORS: BoxColors = {
	positive: "#24FF66", // Matrix blue
	negative: "#303238",
	styles: {
		borderRadius: 4,
		shadowIntensity: 0.4,
		opacity: 0.61,
		showBorder: true,
		globalTimeframeControl: false,
		showLineChart: false,

		viewMode: "default",
	},
};

export const useColorStore = create<ColorState>()(
	persist(
		(set, get) => ({
			boxColors: DEFAULT_BOX_COLORS,

			updateBoxColors: (colors) => {
				console.log("Updating box colors:", colors);
				set((state) => ({
					boxColors: {
						...state.boxColors,
						...colors,
						styles: colors.styles
							? {
									...state.boxColors.styles,
									...colors.styles,
								}
							: state.boxColors.styles,
					},
				}));
			},

			updateStyles: (styles) => {
				console.log("Updating styles:", styles);
				set((state) => ({
					boxColors: {
						...state.boxColors,
						styles: {
							...state.boxColors.styles,
							...styles,
						},
					},
				}));
			},

			setPresetColors: (preset) => {
				console.log("Setting preset colors:", preset.name);
				const currentState = get();
				set({
					boxColors: {
						...currentState.boxColors,
						positive: preset.positive,
						negative: preset.negative,
					},
				});
			},
		}),
		{
			name: "color-storage",
		},
	),
);
