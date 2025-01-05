import { BoxSlice, PriceData } from '@/types/types';

interface BoxState {
    high: number;
    low: number;
    value: number;
}

export class GridCalculator {
    private boxMap: Map<string, BoxState[]> = new Map();

    initializeBoxes(pair: string, initialBoxes: BoxState[]) {
        this.boxMap.set(pair, [...initialBoxes]);
    }

    updateWithPrice(pair: string, price: number) {
        const boxes = this.boxMap.get(pair);
        if (!boxes) return;

        boxes.forEach((box) => {
            const boxSize = box.high - box.low;
            // If price breaks high
            if (price > box.high) {
                box.high = price;
                box.low = price - boxSize;
                if (box.value < 0) {
                    box.value = Math.abs(box.value); // Make positive when breaking high
                }
            }
            // If price breaks low
            else if (price < box.low) {
                box.low = price;
                box.high = price + boxSize;
                if (box.value > 0) {
                    box.value = -Math.abs(box.value); // Make negative when breaking low
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
