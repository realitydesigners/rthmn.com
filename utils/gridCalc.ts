import { BoxSlice } from '@/types/types';

interface BoxState {
    high: number;
    low: number;
    value: number;
}

export class GridCalculator {
    private boxMap: Map<string, BoxState[]> = new Map();

    initializeBoxes(pair: string, initialBoxes: BoxState[]) {
        const boxes = initialBoxes.map((box) => ({
            high: box.high,
            low: box.low,
            value: box.value,
        }));
        this.boxMap.set(pair, boxes);
    }

    updateWithPrice(pair: string, price: number): BoxState[] {
        const boxes = this.boxMap.get(pair);
        if (!boxes) return [];

        boxes.forEach((box) => {
            if (price > box.high) {
                box.high = price;
                box.low = price - Math.abs(box.value);
                if (box.value < 0) {
                    box.value = Math.abs(box.value);
                }
            } else if (price < box.low) {
                box.low = price;
                box.high = price + Math.abs(box.value);
                if (box.value > 0) {
                    box.value = -Math.abs(box.value);
                }
            }
        });

        return boxes.map((box) => ({ ...box }));
    }

    getBoxes(pair: string): BoxState[] | undefined {
        const boxes = this.boxMap.get(pair);
        if (!boxes) return undefined;
        return boxes.map((box) => ({ ...box }));
    }

    getPairData(pair: string, currentOHLC: any): { boxes: BoxSlice[]; currentOHLC: any } | undefined {
        const boxes = this.getBoxes(pair);
        if (!boxes) return undefined;

        return {
            boxes: [
                {
                    boxes,
                    timestamp: new Date().toISOString(),
                    currentOHLC,
                },
            ],
            currentOHLC,
        };
    }

    clearPair(pair: string) {
        this.boxMap.delete(pair);
    }
}
