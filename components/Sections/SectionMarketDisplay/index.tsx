'use client';
import { useState, useEffect } from 'react';
import { MotionDiv } from '@/components/MotionDiv';

// Types
interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
}

interface CandleData {
  mid: { c: string; o: string };
  volume: number;
}

interface ProcessedMarketData {
  price: number;
  change: number;
  volume: number;
  points: number[];
}

interface CardPosition {
  x: number;
  y: number;
  z: number;
}

// Constants
const CARD_POSITIONS: CardPosition[] = [
  { x: -400, y: -400, z: 25 },
  { x: 100, y: -450, z: 30 },
  { x: 450, y: -350, z: 20 },
  { x: -500, y: -100, z: 35 },
  { x: 200, y: -50, z: 40 },
  { x: 500, y: -150, z: 30 },
  { x: -450, y: 200, z: 25 },
  { x: 50, y: 300, z: 35 },
  { x: 400, y: 250, z: 20 },
  { x: -100, y: 400, z: 30 }
];

const ANIMATION_DURATION = 10000;
const POSITION_SCALE = {
  MOBILE: 0.25,
  DESKTOP: 0.7
};

// Add default position
const DEFAULT_POSITION: CardPosition = { x: 0, y: 0, z: 0 };

// Helper Components
const MarketHeading = () => (
  <MotionDiv
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
    className="text-center lg:pl-32 lg:text-left"
  >
    <h2 className="relative z-10 bg-linear-to-r from-white to-white/60 bg-clip-text font-outfit text-[4em] font-bold leading-[1em] tracking-tight text-transparent sm:text-[5em] lg:text-[7em] lg:leading-[1em]">
      Trading
      <br />
      Simplified
    </h2>
  </MotionDiv>
);

// Updated SparklineChart implementation
const SparklineChart = ({
  data,
  change
}: {
  data: number[];
  change: number;
}) => {
  if (!data?.length) return null;

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue;

  const createPath = (points: number[]) => {
    return points
      .map(
        (p, i) =>
          `${(i / (points.length - 1)) * 200} ${
            60 - ((p - minValue) / range) * 60
          }`
      )
      .join(' L ');
  };

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 200 60"
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={`gradient-${change}`} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={change >= 0 ? '#4ade80' : '#f87171'}
            stopOpacity="0.8"
          />
          <stop
            offset="100%"
            stopColor={change >= 0 ? '#4ade80' : '#f87171'}
            stopOpacity="0.2"
          />
        </linearGradient>
      </defs>
      {/* Background path */}
      <path
        d={`M ${createPath(data)}`}
        fill="none"
        stroke={`url(#gradient-${change})`}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        opacity="0.1"
      />
      {/* Animated path */}
      <path
        d={`M ${createPath(data)}`}
        fill="none"
        stroke={`url(#gradient-${change})`}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      {/* Dot at the end */}
      {data.length > 0 && (
        <circle
          cx={((data.length - 1) / (data.length - 1)) * 200}
          cy={60 - ((data[data.length - 1] - minValue) / range) * 60}
          r="3"
          fill={change >= 0 ? '#4ade80' : '#f87171'}
          className="animate-pulse"
        />
      )}
    </svg>
  );
};

// Updated MarketCard with position error handling
const MarketCard = ({
  item,
  data,
  position = DEFAULT_POSITION,
  index
}: {
  item: MarketData;
  data: ProcessedMarketData;
  position?: CardPosition;
  index: number;
}) => {
  const safePosition = position || DEFAULT_POSITION;

  return (
    <MotionDiv
      key={item.pair}
      className="absolute left-1/2 top-1/2 h-[130px] w-[160px] -translate-x-1/2 -translate-y-1/2 cursor-pointer sm:h-[160px] sm:w-[180px]"
      initial={{
        x: safePosition.x * POSITION_SCALE.DESKTOP,
        y: safePosition.y * POSITION_SCALE.DESKTOP,
        z: safePosition.z,
        scale: 0.85,
        rotateX: (index % 3) * 5,
        rotateY: (index % 2) * -5
      }}
      animate={{
        y: safePosition.y * POSITION_SCALE.DESKTOP + Math.sin(index * 0.8) * 10,
        x: safePosition.x * POSITION_SCALE.DESKTOP + Math.cos(index * 0.5) * 5,
        transition: {
          y: {
            duration: 3 + (index % 2),
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: index * 0.3
          },
          x: {
            duration: 4 + (index % 2),
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: index * 0.2
          }
        }
      }}
      whileHover={{
        scale: 0.95,
        z: safePosition.z + 100,
        rotateX: 0,
        rotateY: 0,
        transition: { duration: 0.3 }
      }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="relative h-full w-full rounded-xl border border-white/10 bg-black/60 p-4 backdrop-blur-md">
        <div className="absolute inset-0 rounded-xl bg-linear-to-br from-white/10 via-transparent to-black/30" />
        <div
          className={`absolute inset-0 rounded-xl opacity-20 blur-xl ${
            data.change >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'
          }`}
        />
        <CardContent item={item} data={data} />
      </div>
    </MotionDiv>
  );
};

const CardContent = ({
  item,
  data
}: {
  item: MarketData;
  data: ProcessedMarketData;
}) => (
  <div className="relative z-10">
    <div className="mb-2 flex items-start justify-between">
      <h4 className="text-sm font-medium text-white/90">
        {item.pair.replace('_', '/')}
      </h4>
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-full px-2 py-0.5 text-xs ${
          data.change >= 0
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-red-500/20 text-red-400'
        }`}
      >
        {data.change.toFixed(2)}%
      </MotionDiv>
    </div>
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-3 text-xl font-bold text-white"
    >
      {data.price.toFixed(item.pair.includes('JPY') ? 3 : 5)}
    </MotionDiv>
    <div className="h-12 w-full">
      <SparklineChart data={data.points} change={data.change} />
    </div>
  </div>
);

// Main Component
export function SectionMarketDisplay({
  marketData
}: {
  marketData: MarketData[];
}) {
  const [isClient, setIsClient] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(elapsed / ANIMATION_DURATION, 1);
      setProgress(currentProgress);

      if (currentProgress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isClient]);

  const processMarketData = (
    candleData: string
  ): ProcessedMarketData | null => {
    try {
      const data = JSON.parse(candleData) as CandleData[];
      if (!data?.length) return null;

      const dataPoints = Math.floor(data.length * progress);
      const animatedData = data.slice(0, Math.max(2, dataPoints + 1));

      const latest = animatedData[animatedData.length - 1];
      const first = data[0];
      const change =
        ((parseFloat(latest.mid.c) - parseFloat(first.mid.o)) /
          parseFloat(first.mid.o)) *
        100;

      return {
        price: parseFloat(latest.mid.c),
        change,
        volume: latest.volume,
        points: animatedData.map((d) => parseFloat(d.mid.c))
      };
    } catch {
      return null;
    }
  };

  return (
    <section className="relative z-100 flex min-h-screen flex-col items-center justify-center overflow-hidden lg:flex-row">
      <div className="relative flex w-full items-center justify-center px-4 py-8 lg:w-1/2 lg:px-0 lg:pr-16">
        <MarketHeading />
      </div>

      <div className="relative h-[800px] w-full lg:h-screen lg:w-1/2">
        <div className="relative h-full [perspective:4000px]">
          {marketData.map((item, index) => {
            const data = processMarketData(item.candleData);
            if (!data) return null;

            return (
              <MarketCard
                key={item.pair}
                item={item}
                data={data}
                position={CARD_POSITIONS[index]}
                index={index}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
