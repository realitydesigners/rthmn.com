export type Point = [number, number];

export interface PriceLine {
    price: number;
    y: number;
    x1: number;
    x2: number;
    isPositive: boolean;
    intersectX: number;
}

export interface Dimensions {
    width: number;
    height: number;
}
