'use client';
import { useEffect, useState, useRef } from 'react';
import type { CandleData } from '@/types/types';

interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
}

interface MarketWallProps {
  marketData: MarketData[];
}

interface NumberCell {
  value: string;
  isHighlighted: boolean;
  isPositive: boolean;
  opacity: number;
  pair?: string;
}

export function MarketWall({ marketData }: { marketData: MarketData[] }) {
  const [cells, setCells] = useState<NumberCell[][]>([]);
  const frameRef = useRef(0);
  const ROWS = 15;
  const COLS = 25;

  const generateNumber = () => {
    if (Math.random() < 0.4 && marketData.length > 0) {
      const randomPair =
        marketData[Math.floor(Math.random() * marketData.length)]?.pair;
      return {
        value: getRealPrice(randomPair) || (Math.random() * 2 + 0.1).toFixed(4),
        pair: randomPair
      };
    }
    return {
      value: (Math.random() * 2 + 0.1).toFixed(4),
      pair: undefined
    };
  };

  const getRealPrice = (pair: string) => {
    try {
      const data = marketData.find((m) => m.pair === pair);
      if (!data || !data.candleData) return null;

      const candles = JSON.parse(data.candleData);

      if (!Array.isArray(candles) || candles.length === 0) {
        console.warn(`No valid candles for ${pair}`);
        return null;
      }

      const newestCandle = candles[0];
      if (!newestCandle?.mid?.c) {
        console.warn(`Invalid candle data for ${pair}`);
        return null;
      }

      const price = parseFloat(newestCandle.mid.c).toFixed(4);
      return price;
    } catch (e) {
      console.error('Error parsing price for', pair, e);
      return null;
    }
  };

  useEffect(() => {
    const initialCells: NumberCell[][] = [];
    for (let i = 0; i < ROWS; i++) {
      const row: NumberCell[] = [];
      for (let j = 0; j < COLS; j++) {
        const generated = generateNumber();
        row.push({
          value: generated.value,
          isHighlighted: false,
          isPositive: Math.random() > 0.5,
          opacity: 0.2,
          pair: generated.pair
        });
      }
      initialCells.push(row);
    }
    setCells(initialCells);

    let frameCount = 0;
    const animate = () => {
      frameCount++;

      if (frameCount % 3 === 0) {
        setCells((prev) => {
          const newCells = [...prev];

          if (Math.random() > 0.8) {
            const row = Math.floor(Math.random() * ROWS);
            const col = Math.floor(Math.random() * COLS);
            const generated = generateNumber();

            newCells[row][col] = {
              value: generated.value,
              isHighlighted: true,
              isPositive: Math.random() > 0.5,
              opacity: 0.8,
              pair: generated.pair
            };
          }

          return newCells.map((row) =>
            row.map((cell) => ({
              ...cell,
              opacity: cell.isHighlighted
                ? Math.max(0.2, cell.opacity - 0.01)
                : cell.opacity,
              isHighlighted: cell.isHighlighted ? cell.opacity > 0.2 : false
            }))
          );
        });
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [marketData]);

  return (
    <div className="max-w-screen absolute inset-0 z-0 h-screen max-h-screen w-screen overflow-hidden">
      <div
        className="grid h-full w-full transform-gpu"
        style={{
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          transform: 'scale(1.1) rotate(-1deg)'
        }}
      >
        {cells.map((row, i) => (
          <div key={i} className="flex">
            {row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className={`flex-1 font-kodemono text-xs ${
                  cell.isHighlighted
                    ? cell.isPositive
                      ? 'text-emerald-300'
                      : 'text-red-300'
                    : 'text-white/50'
                }`}
                style={{
                  opacity: cell.opacity
                }}
              >
                {cell.value}
                {cell.pair && (
                  <span className="ml-1 text-[8px] opacity-50">
                    {cell.pair.replace('_', '/')}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
