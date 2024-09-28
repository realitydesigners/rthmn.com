import { BoxSlice } from '@/types';

export interface OHLC {
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface PairData {
  boxes: BoxSlice[];
  currentOHLC: OHLC;
}
