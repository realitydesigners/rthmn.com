
import { safeISOString } from "./dateUtils";
import fs from "fs";
import path from "path";
import type { CandleData, BoxSlice } from "@/types/types";


export const INSTRUMENTS = {
	CRYPTO: {
		BTCUSD: { point: 1.0, digits: 0 },
		
	}} as const

export const BoxSizes = [
	200, 173, 150, 130, 112, 97, 84, 73, 63, 55, 47, 41, 36, 31, 27, 23,
	20, 17, 15, 13, 11, 10,
];

export class BoxCalculator {
	private boxSizes: Float64Array;
	private boxValues: Int32Array;
	private boxHighs: Float64Array;
	private boxLows: Float64Array;
	private calculationPoint: number;

	constructor(pair: string) {
		const details = Object.values(INSTRUMENTS).find(
			(category) => pair in category,
		)?.[pair] || {
			point: 0.00001,
			digits: 5,
		};
		this.calculationPoint = details.point;

		this.boxSizes = new Float64Array(BoxSizes);
		this.boxValues = new Int32Array(BoxSizes);
		this.boxHighs = new Float64Array(BoxSizes.length);
		this.boxLows = new Float64Array(BoxSizes.length);
	}

	calculateBoxArrays(candles: CandleData[]): any {
		if (candles.length === 0) return {};

		const latestPrice = Number(candles[candles.length - 1].close);
		this.initializeBoxArrays(latestPrice);

		for (const candle of candles) {
			this.updateBoxArraysWithCandleData(
				Number(candle.high),
				Number(candle.low),
			);
		}

		return this.getBoxArrays();
	}

	private initializeBoxArrays(latestPrice: number): void {
		for (let i = 0; i < this.boxSizes.length; i++) {
			const boxSize = this.boxSizes[i] * this.calculationPoint;
			this.boxHighs[i] = latestPrice;
			this.boxLows[i] = latestPrice - boxSize;
			this.boxValues[i] = BoxSizes[i];
		}
	}

	private updateBoxArraysWithCandleData(high: number, low: number): void {
		for (let i = 0; i < this.boxSizes.length; i++) {
			const boxSize = this.boxSizes[i] * this.calculationPoint;

			if (high > this.boxHighs[i]) {
				this.boxHighs[i] = high;
				this.boxLows[i] = this.boxHighs[i] - boxSize;
				if (this.boxValues[i] < 0) {
					this.boxValues[i] = Math.abs(this.boxValues[i]);
				}
			}
			if (low < this.boxLows[i]) {
				this.boxLows[i] = low;
				this.boxHighs[i] = this.boxLows[i] + boxSize;
				if (this.boxValues[i] > 0) {
					this.boxValues[i] = -Math.abs(this.boxValues[i]);
				}
			}
		}
	}

	private getBoxArrays(): any {
		const boxArrays: any = {};
		for (let i = 0; i < this.boxSizes.length; i++) {
			boxArrays[BoxSizes[i].toString()] = {
				high: this.boxHighs[i],
				low: this.boxLows[i],
				value: this.boxValues[i] * this.calculationPoint,
			};
		}
		return boxArrays;
	}
}

export const createBoxCalculator = (pair: string) => new BoxCalculator(pair);



interface ExtendedBoxSlice {
	timestamp: string;
	progressiveValues: {
		high: number;
		low: number;
		value: number;
		size: string;
	}[];
	currentOHLC: {
		open: number;
		high: number;
		low: number;
		close: number;
	};
}

export const processProgressiveBoxValues = (
	boxes: BoxSlice["boxes"],
): BoxSlice["boxes"] => {
	// Sort boxes purely by ASCENDING absolute value to match ResoBox apparent order
	const sortedBoxes = [...boxes].sort(
		(a, b) => Math.abs(a.value) - Math.abs(b.value),
	);

	// Return the boxes sorted by absolute value, WITHOUT snapping
	return sortedBoxes;

};

export function processInitialBoxData(
	processedCandles: {
		timestamp: number;
		open: number;
		high: number;
		low: number;
		close: number;
	}[],
	pair: string,
	defaultVisibleBoxesCount = 7,
	defaultHeight = 200,
	initialBarWidth = 20,
) {
	// Reset previous values at the start of processing

	const boxCalculator = createBoxCalculator(pair.toUpperCase());
	const boxTimeseriesData = processedCandles.map((candle, index) => {
		const candleSlice = processedCandles.slice(0, index + 1).map((c) => ({
			timestamp: safeISOString(c.timestamp),
			open: c.open,
			high: c.high,
			low: c.low,
			close: c.close,
			mid: {
				o: c.open.toString(),
				h: c.high.toString(),
				l: c.low.toString(),
				c: c.close.toString(),
			},
		}));

		return {
			timestamp: safeISOString(candle.timestamp),
			boxes: boxCalculator.calculateBoxArrays(candleSlice),
			currentOHLC: {
				open: candle.open,
				high: candle.high,
				low: candle.low,
				close: candle.close,
			},
		};
	});

	// First create base histogram boxes with initial deduplication
	const histogramBoxes: ExtendedBoxSlice[] = [];
	let previousBoxes: any[] = [];

	boxTimeseriesData.forEach((timepoint, index) => {
		// Convert current timepoint boxes to array format with size capture
		const currentBoxes = Object.entries(timepoint.boxes).map(
			([size, data]: [
				string,
				{ high: number; low: number; value: number },
			]) => ({
				high: Number(data.high),
				low: Number(data.low),
				value: data.value,
				size: size, // Capture the size identifier
			}),
		);

		// Process boxes and get progressive values
		const progressiveBoxes = processProgressiveBoxValues(currentBoxes);
		const progressiveValues = progressiveBoxes.map((box) => ({
			high: box.high,
			low: box.low,
			value: box.value,
			size: box.size,
		}));

		// Check if there are any changes from previous frame
		const hasChanges =
			index === 0 ||
			progressiveValues.some((box, i) => {
				const prevBox = previousBoxes[i];
				return (
					!prevBox ||
					prevBox.high !== box.high ||
					prevBox.low !== box.low ||
					prevBox.value !== box.value
				);
			});

		// Always add the first frame and frames with changes
		if (hasChanges) {
			histogramBoxes.push({
				timestamp: timepoint.timestamp,
				progressiveValues,
				currentOHLC: timepoint.currentOHLC,
			});
			previousBoxes = progressiveValues;
		}
	});

	// Create simple interpolation function
	const createSimpleInterpolation = (
		prevFrame: ExtendedBoxSlice,
		nextFrame: ExtendedBoxSlice
	): ExtendedBoxSlice[] => {
		const interpolatedFrames: ExtendedBoxSlice[] = [];

		// Create a map for quick lookup by size
		const nextBoxMap = new Map(nextFrame.progressiveValues.map(box => [box.size, box]));
		
		// Find boxes that have meaningful changes (sign flips or significant high/low changes)
		const meaningfulChanges: { 
			size: string; 
			prevBox: any; 
			nextBox: any; 
			hasSignChange: boolean;
			hasHighChange: boolean;
			hasLowChange: boolean;
		}[] = [];
		
		prevFrame.progressiveValues.forEach(prevBox => {
			const nextBox = nextBoxMap.get(prevBox.size);
			if (!nextBox) return;
			
			const hasSignChange = Math.sign(prevBox.value) !== Math.sign(nextBox.value);
			const hasHighChange = prevBox.high !== nextBox.high;
			const hasLowChange = prevBox.low !== nextBox.low;
			
			// Only consider changes that matter for visualization
			if (hasSignChange || hasHighChange || hasLowChange) {
				meaningfulChanges.push({ 
					size: prevBox.size, 
					prevBox, 
					nextBox, 
					hasSignChange,
					hasHighChange,
					hasLowChange
				});
			}
		});

		// Only create interpolation if there are meaningful changes
		if (meaningfulChanges.length === 0) {
			return [];
		}

		// Sort changes by box size (smallest first) to show logical progression
		meaningfulChanges.sort((a, b) => Math.abs(a.prevBox.value) - Math.abs(b.prevBox.value));

		// Create intermediate frames showing progression
		let currentState = prevFrame.progressiveValues.map(box => ({ ...box }));
		
		for (const change of meaningfulChanges) {
			// Find the box in current state
			const boxIndex = currentState.findIndex(box => box.size === change.size);
			if (boxIndex === -1) continue;

			// Create new state with this box updated to its final values
			const newState = currentState.map((box, index) => {
				if (index === boxIndex) {
					// Update to final state for this box, preserving the exact values from nextBox
					return {
						...box,
						high: change.nextBox.high,
						low: change.nextBox.low,
						value: change.nextBox.value
					};
				}
				return { ...box }; // Keep other boxes unchanged
			});

			// Only add frame if it's actually different from current state
			const isDifferent = currentState[boxIndex].value !== newState[boxIndex].value ||
							   currentState[boxIndex].high !== newState[boxIndex].high ||
							   currentState[boxIndex].low !== newState[boxIndex].low;
			
			if (isDifferent) {
				interpolatedFrames.push({
					timestamp: prevFrame.timestamp,
					progressiveValues: newState,
					currentOHLC: prevFrame.currentOHLC,
				});

				// Update current state for next iteration
				currentState = newState;
			}
		}

		return interpolatedFrames;
	};

	// Process frames to ensure we capture all state changes
	const processedFrames: ExtendedBoxSlice[] = [];

	histogramBoxes.forEach((frame, index) => {
		if (index === 0) {
			processedFrames.push(frame);
			return;
		}

		// Get the actual previous frame from histogramBoxes, not processedFrames
		const prevFrame = histogramBoxes[index - 1];
		const currentBoxes = frame.progressiveValues;
		const prevBoxes = prevFrame.progressiveValues;

		// Check for any value changes or trend changes
		const hasValueChanges = currentBoxes.some((box, i) => {
			const prevBox = prevBoxes[i];
			return Math.abs(box.value) !== Math.abs(prevBox.value);
		});

		const hasTrendChanges = currentBoxes.some((box, i) => {
			const prevBox = prevBoxes[i];
			return Math.sign(box.value) !== Math.sign(prevBox.value);
		});

		// Add interpolation frames for smooth transitions only if there are actual changes
		if (hasTrendChanges || hasValueChanges) {
			const interpolatedFrames = createSimpleInterpolation(prevFrame, frame);
			processedFrames.push(...interpolatedFrames);
			// Add the actual frame after interpolation
			processedFrames.push(frame);
		}
	});

	// Write debug JSON file
	try {
		const debugData = processedFrames.map(frame => ({
			time: frame.timestamp,
			boxes: frame.progressiveValues
				.filter(box => box.value < 0)
				.sort((a, b) => a.value - b.value)
				.map(box => box.value)
				.concat(
					frame.progressiveValues
						.filter(box => box.value >= 0)
						.sort((a, b) => a.value - b.value)
						.map(box => box.value)
				)
		}));

		const debugContent = debugData.map(entry => JSON.stringify(entry)).join('\n');
		const debugPath = path.join(process.cwd(), 'app', '(user)', 'pair', 'debug-boxes.json');
		fs.writeFileSync(debugPath, debugContent, 'utf8');
		console.log(`Debug boxes written to: ${debugPath}`);
	} catch (error) {
		console.error('Error writing debug file:', error);
	}

	// Calculate maxSize and prepare initialFramesWithPoints
	const maxSize = processedFrames.reduce((max, slice) => {
		const sliceMax = slice.progressiveValues.reduce(
			(boxMax, box) => Math.max(boxMax, Math.abs(box.value)),
			0,
		);
		return Math.max(max, sliceMax);
	}, 0);

	const initialFramesWithPoints = processedFrames.map((slice) => {
		const boxHeight = defaultHeight / defaultVisibleBoxesCount;
		const visibleBoxes = slice.progressiveValues.slice(
			0,
			defaultVisibleBoxesCount,
		);
		const positiveBoxesCount = visibleBoxes.filter(
			(box) => box.value > 0,
		).length;
		const negativeBoxesCount = defaultVisibleBoxesCount - positiveBoxesCount;

		const totalNegativeHeight = negativeBoxesCount * boxHeight;
		const meetingPointY =
			totalNegativeHeight +
			(defaultHeight - totalNegativeHeight - positiveBoxesCount * boxHeight) /
				2;

		const smallestBox = visibleBoxes.reduce((smallest, current) =>
			Math.abs(current.value) < Math.abs(smallest.value) ? current : smallest,
		);
		const price = smallestBox.value >= 0 ? smallestBox.high : smallestBox.low;
		const high = Math.max(...visibleBoxes.map((box) => box.high));
		const low = Math.min(...visibleBoxes.map((box) => box.low));

		return {
			frameData: {
				boxArray: slice.progressiveValues.map((box) => ({
					high: box.high,
					low: box.low,
					value: box.value,
					size: box.size,
				})),
				isSelected: false,
				meetingPointY,
				sliceWidth: initialBarWidth,
				price,
				high,
				low,
				progressiveValues: slice.progressiveValues,
			},
			meetingPointY,
			sliceWidth: initialBarWidth,
		};
	});

	return {
		histogramBoxes: processedFrames,
		histogramPreProcessed: {
			maxSize,
			initialFramesWithPoints,
			defaultVisibleBoxesCount,
			defaultHeight,
		},
	};
}
