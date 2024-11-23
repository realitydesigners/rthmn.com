'use client';
import { useEffect, useRef, useMemo } from 'react';

const ROWS = 35;
const HIGHLIGHT_CHANCE = 0.03;
const GLOW_INTENSITY = 80;
const GLOW_LAYERS = 2;
const HIGHLIGHT_OPACITY = 1.0;
const SIGNAL_LIFETIME = 3000;
const FADE_IN_DURATION = 500;
const FADE_OUT_DURATION = 500;
const BASE_FONT_SIZE = '12px';
const MIN_SIGNALS = 4;
const MAX_SIGNALS = 8;
const SIGNAL_SPACING = 100;
const VIEWPORT_PADDING = 100;
const SCALE_START = 0.5;
const SCALE_END = 1;
const LABEL_FONT_SIZE = '6px';
const LABEL_SPACING = 2;

const COLORS = {
  emerald: {
    glow: [
      'rgba(52, 211, 153, 1)', // text-emerald-400 full opacity
      'rgba(52, 211, 153, 0.8)' // text-emerald-400 80%
    ],
    text: '#4ade80'
  },
  red: {
    glow: [
      'rgba(248, 113, 113, 1)', // text-red-400 full opacity
      'rgba(248, 113, 113, 0.8)' // text-red-400 80%
    ],
    text: '#ff8080'
  }
};

interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
}

interface NumberCell {
  value: string;
  pair?: string;
  isHighlighted: boolean;
  isPositive: boolean;
  opacity: number;
  x: number;
  y: number;
  z: number;
  scale: number;
  createdAt: number;
  tradeType: 'BUY | LONG' | 'SELL | SHORT';
}

export function MarketWall({ marketData }: { marketData: MarketData[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellsRef = useRef<NumberCell[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const getRandomPosition = (ctx: CanvasRenderingContext2D) => {
    const padding = VIEWPORT_PADDING;
    const width = ctx.canvas.width / window.devicePixelRatio;
    const height = ctx.canvas.height / window.devicePixelRatio;

    const gridCols = 4;
    const gridRows = 3;
    const sectionWidth = (width - padding * 2) / gridCols;
    const sectionHeight = (height - padding * 2) / gridRows;

    const gridX = Math.floor(Math.random() * gridCols);
    const gridY = Math.floor(Math.random() * gridRows);

    const x = padding + gridX * sectionWidth + Math.random() * sectionWidth;
    const y = padding + gridY * sectionHeight + Math.random() * sectionHeight;

    return { x, y };
  };

  const isTooClose = (x: number, y: number) => {
    return cellsRef.current.some((cell) => {
      const dx = cell.x - x;
      const dy = cell.y - y;
      return Math.sqrt(dx * dx + dy * dy) < SIGNAL_SPACING;
    });
  };

  const generateNumber = (x: number, y: number, z: number): NumberCell => {
    const randomPair =
      marketData[Math.floor(Math.random() * marketData.length)]?.pair;
    const isPositive = Math.random() > 0.3;
    return {
      value: (Math.random() * 2 + 0.1).toFixed(4),
      pair: randomPair,
      isHighlighted: true,
      isPositive,
      opacity: 0,
      x,
      y,
      z,
      scale: SCALE_START,
      createdAt: Date.now(),
      tradeType: isPositive ? 'BUY | LONG' : 'SELL | SHORT'
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    for (let i = 0; i < MIN_SIGNALS; i++) {
      let position;
      do {
        position = getRandomPosition(ctx);
      } while (isTooClose(position.x, position.y));

      cellsRef.current.push(
        generateNumber(position.x, position.y, Math.random() * ROWS)
      );
    }

    const drawCell = (cell: NumberCell, currentTime: number) => {
      const age = currentTime - cell.createdAt;

      if (age < FADE_IN_DURATION) {
        const progress = age / FADE_IN_DURATION;
        cell.opacity = progress * HIGHLIGHT_OPACITY;
        cell.scale = SCALE_START + (SCALE_END - SCALE_START) * progress;
      } else if (age < SIGNAL_LIFETIME) {
        const settleProgress = Math.min(1, (age - FADE_IN_DURATION) / 300);
        cell.opacity = HIGHLIGHT_OPACITY;
        cell.scale = SCALE_END - (SCALE_END - 1) * settleProgress;
      } else if (age < SIGNAL_LIFETIME + FADE_OUT_DURATION) {
        const progress = (age - SIGNAL_LIFETIME) / FADE_OUT_DURATION;
        cell.opacity = HIGHLIGHT_OPACITY * (1 - progress);
        cell.scale = 1 + progress * 0.2;
      } else {
        cell.opacity = 0;
        return;
      }

      ctx.save();
      ctx.globalAlpha = cell.opacity;
      ctx.translate(cell.x, cell.y);
      ctx.scale(cell.scale, cell.scale);
      ctx.translate(-cell.x, -cell.y);

      const colors = cell.isPositive ? COLORS.emerald : COLORS.red;

      if (cell.pair) {
        const text = `${cell.pair.replace('_', '/')} ${cell.value}`;

        // Multiple glow layers for main text
        for (let i = 0; i < GLOW_LAYERS; i++) {
          ctx.save();
          ctx.font = `${BASE_FONT_SIZE} "Kode Mono"`;
          ctx.shadowColor = colors.glow[i];
          ctx.shadowBlur = GLOW_INTENSITY * (1 - i * 0.2) * cell.scale;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.fillStyle = colors.text;
          ctx.fillText(text, cell.x, cell.y);
          ctx.restore();
        }

        // Final sharp layer for main text
        ctx.font = `${BASE_FONT_SIZE} "Kode Mono"`;
        ctx.fillStyle = colors.text;
        ctx.fillText(text, cell.x, cell.y);

        // Label with smaller glow
        const labelText = cell.tradeType;
        const mainTextWidth = ctx.measureText(text).width;
        const labelY = cell.y + parseInt(BASE_FONT_SIZE) + LABEL_SPACING;
        const labelX =
          cell.x + (mainTextWidth - ctx.measureText(labelText).width) / 2;

        // Multiple glow layers for label
        for (let i = 0; i < GLOW_LAYERS; i++) {
          ctx.save();
          ctx.font = `${LABEL_FONT_SIZE} "Kode Mono"`;
          ctx.shadowColor = colors.glow[i];
          ctx.shadowBlur = GLOW_INTENSITY * 0.6 * (1 - i * 0.2) * cell.scale;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.fillStyle = colors.text;
          ctx.fillText(labelText, labelX, labelY);
          ctx.restore();
        }

        // Final sharp layer for label
        ctx.font = `${LABEL_FONT_SIZE} "Kode Mono"`;
        ctx.fillStyle = colors.text;
        ctx.fillText(labelText, labelX, labelY);
      }

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const currentTime = Date.now();

      if (
        cellsRef.current.length < MAX_SIGNALS &&
        Math.random() < HIGHLIGHT_CHANCE
      ) {
        let position;
        do {
          position = getRandomPosition(ctx);
        } while (isTooClose(position.x, position.y));

        cellsRef.current.push(
          generateNumber(position.x, position.y, Math.random() * ROWS)
        );
      }

      if (cellsRef.current.length < MIN_SIGNALS) {
        let position = getRandomPosition(ctx);
        cellsRef.current.push(
          generateNumber(position.x, position.y, Math.random() * ROWS)
        );
      }

      cellsRef.current.forEach((cell) => drawCell(cell, currentTime));

      cellsRef.current = cellsRef.current.filter(
        (cell) =>
          currentTime - cell.createdAt < SIGNAL_LIFETIME + FADE_OUT_DURATION
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [marketData]);

  return (
    <div className="absolute inset-0 z-0 h-screen max-h-screen w-screen overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
