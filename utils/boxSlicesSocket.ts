import { PairData, Box, OHLC, BoxSlice } from '@/types';
import { wsClient } from './websocketClient';

export async function getBoxSlicesSocket(
  pair: string,
  lastTimestamp?: string,
  count?: number
): Promise<BoxSlice[]> {
  return new Promise((resolve) => {
    const boxSlices: BoxSlice[] = [];

    const handler = (data: BoxSlice) => {
      boxSlices.push(data);
      if (!count || boxSlices.length >= count) {
        wsClient.unsubscribe(pair);
        resolve(boxSlices);
      }
    };

    wsClient.subscribe(pair, handler);
  });
}

export async function getLatestBoxSlicesSocket(): Promise<
  Record<string, PairData>
> {
  return new Promise((resolve) => {
    const latestData: Record<string, PairData> = {};
    const pairs = ['EURUSD', 'GBPUSD', 'USDJPY'];
    let receivedCount = 0;

    const handler = (pair: string) => (data: BoxSlice) => {
      if (data.currentOHLC) {
        latestData[pair] = {
          boxes: [data],
          currentOHLC: data.currentOHLC
        };
        receivedCount++;

        if (receivedCount === pairs.length) {
          pairs.forEach((p) => wsClient.unsubscribe(p));
          resolve(latestData);
        }
      } else {
        console.error(`Received data for ${pair} without currentOHLC`);
      }
    };

    pairs.forEach((pair) => wsClient.subscribe(pair, handler(pair)));
  });
}

export function compareSlices(
  slice1: BoxSlice,
  slice2: BoxSlice,
  offset: number,
  visibleBoxesCount: number
): boolean {
  const boxes1 = slice1.boxes.slice(offset, offset + visibleBoxesCount);
  const boxes2 = slice2.boxes.slice(offset, offset + visibleBoxesCount);

  if (boxes1.length !== boxes2.length) return false;

  for (let i = 0; i < boxes1.length; i++) {
    if (boxes1[i].value !== boxes2[i].value) return false;
  }

  return true;
}
