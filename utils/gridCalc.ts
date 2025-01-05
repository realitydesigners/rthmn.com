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
            ...box,
            high: box.high,
            low: box.value > 0 ? box.high - Math.abs(box.value) : box.low,
            value: box.value,
        }));
        this.boxMap.set(pair, boxes);
    }

    updateWithPrice(pair: string, price: number) {
        const boxes = this.boxMap.get(pair);
        if (!boxes) return;

        boxes.forEach((box) => {
            // If price breaks high
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
    }

    getBoxes(pair: string): BoxState[] | undefined {
        return this.boxMap.get(pair);
    }

    getPairData(pair: string, currentOHLC: any): { boxes: BoxSlice[]; currentOHLC: any } | undefined {
        const boxes = this.boxMap.get(pair);
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
