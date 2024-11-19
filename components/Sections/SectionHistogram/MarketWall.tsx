'use client';
import { useEffect, useState, useRef, useMemo } from 'react';

// Increased density
const ROWS = 30;
const COLS = 40;
const BASE_OPACITY = 0.2;
const HIGHLIGHT_OPACITY = 0.8;
const UPDATE_INTERVAL = 3;
const HIGHLIGHT_CHANCE = 0.2;
const MIN_FONT_SIZE = 10; // Smaller font size to fit more numbers
const BASE_FONT_SIZE = 10;

interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
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

  // Memoize price lookup function
  const getRealPrice = useMemo(() => {
    const priceMap = new Map();
    marketData.forEach((data) => {
      try {
        const candles = JSON.parse(data.candleData);
        if (
          Array.isArray(candles) &&
          candles.length > 0 &&
          candles[0]?.mid?.c
        ) {
          priceMap.set(data.pair, parseFloat(candles[0].mid.c).toFixed(4));
        }
      } catch (e) {
        console.error('Error parsing price for', data.pair, e);
      }
    });
    return (pair: string) => priceMap.get(pair) || null;
  }, [marketData]);

  const generateNumber = (shouldIncludePair = false) => {
    if (shouldIncludePair && marketData.length > 0) {
      const randomPair =
        marketData[Math.floor(Math.random() * marketData.length)]?.pair;
      return {
        value: getRealPrice(randomPair) || (Math.random() * 2 + 0.1).toFixed(4),
        pair: randomPair,
        isHighlighted: true,
        isPositive: Math.random() > 0.5
      };
    }
    return {
      value: (Math.random() * 2 + 0.1).toFixed(4),
      pair: undefined,
      isHighlighted: false,
      isPositive: false
    };
  };

  useEffect(() => {
    // Initialize cells with mostly background numbers
    const initialCells: NumberCell[][] = Array(ROWS)
      .fill(null)
      .map((_, i) =>
        Array(COLS)
          .fill(null)
          .map((_, j) => ({
            ...generateNumber(Math.random() < 0.1), // 10% chance of being a pair
            opacity: BASE_OPACITY
          }))
      );
    setCells(initialCells);

    let frameCount = 0;
    const animate = () => {
      frameCount++;

      if (frameCount % UPDATE_INTERVAL === 0) {
        setCells((prev) => {
          const newCells = [...prev];

          // Update random cell with highlight
          if (Math.random() < HIGHLIGHT_CHANCE) {
            const row = Math.floor(Math.random() * ROWS);
            const col = Math.floor(Math.random() * COLS);
            const generated = generateNumber(true);

            newCells[row][col] = {
              ...generated,
              opacity: HIGHLIGHT_OPACITY
            };
          }

          // Fade out highlights
          return newCells.map((row) =>
            row.map((cell) => ({
              ...cell,
              opacity: cell.isHighlighted
                ? Math.max(BASE_OPACITY, cell.opacity - 0.01)
                : cell.opacity,
              isHighlighted: cell.isHighlighted
                ? cell.opacity > BASE_OPACITY
                : false
            }))
          );
        });
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [marketData]);

  // Rest of the render code remains similar, but with optimized cell rendering
  return (
    <div className="absolute inset-0 z-0 h-screen max-h-screen w-screen overflow-hidden bg-gradient-to-b from-transparent to-black/40">
      <div
        className="grid h-full w-full transform-gpu"
        style={{
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          transform: 'rotateX(45deg) rotateZ(0deg) scale(2.5) translateY(25%) ',
          transformOrigin: 'center 50%',
          transformStyle: 'preserve-3d'
        }}
      >
        {cells.map((row, i) => (
          <div
            key={i}
            className="relative flex"
            style={{
              transform: `translateZ(${i * 4}px)`,
              opacity: 1 - i * 0.02,
              gap: '2px'
            }}
          >
            {row.map((cell, j) => {
              const randomX = Math.sin(i * j * 0.5) * 50;
              const randomY = Math.cos(i * j * 0.7) * 100;

              return (
                <div
                  key={`${i}-${j}`}
                  className={`relative flex flex-1 items-center justify-between px-0.5 font-kodemono transition-all duration-300 ease-out ${
                    cell.isHighlighted ? 'z-10 scale-110' : 'scale-100'
                  } ${
                    cell.isHighlighted
                      ? cell.isPositive
                        ? 'text-emerald-300'
                        : 'text-red-300'
                      : 'text-white/25'
                  } ${cell.isHighlighted ? 'animate-[float_3s_ease-in-out_infinite]' : ''} `}
                  style={{
                    opacity: cell.opacity,
                    fontSize: `${Math.max(MIN_FONT_SIZE, BASE_FONT_SIZE - i * 0.1)}px`,
                    transform: cell.isHighlighted
                      ? `translateZ(${8}px) translateY(${Math.sin(Date.now() * 0.003) * 2}px)`
                      : `translate(${randomX}px, ${randomY}px)`,
                    position: 'relative',
                    left: `${Math.sin(i * j * 0.3) * 30}px`
                  }}
                >
                  {/* Glow layers first (behind text) */}
                  {cell.isHighlighted && (
                    <>
                      <div
                        className={`absolute inset-0 -z-20 blur-lg ${cell.isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'} scale-125`}
                      />
                      <div
                        className={`absolute inset-0 -z-20 blur-md ${cell.isPositive ? 'bg-emerald-500/30' : 'bg-red-500/30'} `}
                      />
                    </>
                  )}
                  {/* Crisp text on top */}
                  <div className="relative z-20 flex w-full items-center justify-between gap-4">
                    <span
                      className={`transition-opacity duration-300 ${cell.isHighlighted ? 'opacity-90' : 'opacity-30'} ${cell.pair ? '' : 'invisible'} `}
                    >
                      {cell.pair?.replace('_', '/') || 'XXX/XXX'}
                    </span>
                    <span>{cell.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
