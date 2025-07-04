import type { CandleData } from "@/types/types";
import { BoxSizes, INSTRUMENTS } from "@/utils/instruments";

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
