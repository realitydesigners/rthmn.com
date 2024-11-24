'use client';
import { useState, useEffect, useMemo, memo, useCallback, useRef } from 'react';
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

// Memoize the MarketHeading component
const MarketHeading = memo(() => (
  <MotionDiv
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
    className="text-center lg:pl-32 lg:text-left"
  >
    <h2 className="font-outfit relative z-10 bg-linear-to-r from-white to-white/60 bg-clip-text text-[4em] leading-[1em] font-bold tracking-tight text-transparent sm:text-[5em] lg:text-[7em] lg:leading-[1em]">
      Trading
      <br />
      Simplified
    </h2>
  </MotionDiv>
));

MarketHeading.displayName = 'MarketHeading';

// Memoize SparklineChart
const SparklineChart = memo(
  ({ data, change }: { data: number[]; change: number }) => {
    const pathData = useMemo(() => {
      if (!data?.length) return null;

      const minValue = Math.min(...data);
      const maxValue = Math.max(...data);
      const range = maxValue - minValue;

      return data
        .map(
          (p, i) =>
            `${(i / (data.length - 1)) * 200} ${
              60 - ((p - minValue) / range) * 60
            }`
        )
        .join(' L ');
    }, [data]);

    if (!pathData) return null;

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
        <path
          d={`M ${pathData}`}
          fill="none"
          stroke={`url(#gradient-${change})`}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          opacity="0.1"
        />
        <path
          d={`M ${pathData}`}
          fill="none"
          stroke={`url(#gradient-${change})`}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {data.length > 0 && (
          <circle
            cx={200}
            cy={
              60 -
              ((data[data.length - 1] - Math.min(...data)) /
                (Math.max(...data) - Math.min(...data))) *
                60
            }
            r="3"
            fill={change >= 0 ? '#4ade80' : '#f87171'}
            className="animate-pulse"
          />
        )}
      </svg>
    );
  }
);

SparklineChart.displayName = 'SparklineChart';

// Memoize CardContent
const CardContent = memo(
  ({ item, data }: { item: MarketData; data: ProcessedMarketData }) => (
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
  )
);

CardContent.displayName = 'CardContent';

// 1. First, let's create a custom hook to handle the animation frame
const useAnimationProgress = (duration: number) => {
  const [progress, setProgress] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    setIsClient(true);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(elapsed / duration, 1);
      setProgress(currentProgress);

      if (currentProgress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isClient, duration]);

  return progress;
};

// 2. Create a memoized transform component to handle card positioning
const CardTransform = memo(
  ({
    children,
    position,
    index
  }: {
    children: React.ReactNode;
    position: CardPosition;
    index: number;
  }) => {
    const animationConfig = useMemo(
      () => ({
        y: {
          duration: 3 + (index % 2),
          delay: index * 0.3
        },
        x: {
          duration: 4 + (index % 2),
          delay: index * 0.2
        }
      }),
      [index]
    );

    return (
      <MotionDiv
        className="absolute top-1/2 left-1/2 h-[130px] w-[160px] -translate-x-1/2 -translate-y-1/2 cursor-pointer sm:h-[160px] sm:w-[180px]"
        initial={{
          x: position.x * POSITION_SCALE.DESKTOP,
          y: position.y * POSITION_SCALE.DESKTOP,
          z: position.z,
          scale: 0.85,
          rotateX: (index % 3) * 5,
          rotateY: (index % 2) * -5
        }}
        animate={{
          y: position.y * POSITION_SCALE.DESKTOP + Math.sin(index * 0.8) * 10,
          x: position.x * POSITION_SCALE.DESKTOP + Math.cos(index * 0.5) * 5,
          transition: {
            y: {
              duration: animationConfig.y.duration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: animationConfig.y.delay
            },
            x: {
              duration: animationConfig.x.duration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: animationConfig.x.delay
            }
          }
        }}
        whileHover={{
          scale: 0.95,
          z: position.z + 100,
          rotateX: 0,
          rotateY: 0,
          transition: { duration: 0.3 }
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </MotionDiv>
    );
  }
);

CardTransform.displayName = 'CardTransform';

// 3. Optimize the market card data processing
const useProcessedMarketData = (marketData: MarketData[], progress: number) => {
  return useMemo(() => {
    const cache = new Map<string, ProcessedMarketData>();

    return marketData
      .map((item) => {
        const cacheKey = `${item.pair}-${progress}`;
        if (!cache.has(cacheKey)) {
          try {
            const data = JSON.parse(item.candleData) as CandleData[];
            if (!data?.length) return null;

            const dataPoints = Math.floor(data.length * progress);
            const animatedData = data.slice(0, Math.max(2, dataPoints + 1));

            const latest = animatedData[animatedData.length - 1];
            const first = data[0];
            const change =
              ((parseFloat(latest.mid.c) - parseFloat(first.mid.o)) /
                parseFloat(first.mid.o)) *
              100;

            const processed = {
              price: parseFloat(latest.mid.c),
              change,
              volume: latest.volume,
              points: animatedData.map((d) => parseFloat(d.mid.c))
            };

            cache.set(cacheKey, processed);
          } catch {
            return null;
          }
        }

        return {
          item,
          data: cache.get(cacheKey)!
        };
      })
      .filter(
        (item): item is { item: MarketData; data: ProcessedMarketData } =>
          item !== null
      );
  }, [marketData, progress]);
};

// 4. Update the main component to use these optimizations
export const SectionMarketDisplay = memo(
  ({ marketData }: { marketData: MarketData[] }) => {
    const progress = useAnimationProgress(ANIMATION_DURATION);
    const processedData = useProcessedMarketData(marketData, progress);

    return (
      <section className="relative z-100 flex min-h-screen flex-col items-center justify-center overflow-hidden lg:flex-row">
        <div className="relative flex w-full items-center justify-center px-4 py-8 lg:w-1/2 lg:px-0 lg:pr-16">
          <MarketHeading />
        </div>

        <div className="relative h-[800px] w-full lg:h-screen lg:w-1/2">
          <div className="relative h-full [perspective:4000px]">
            {processedData.map(({ item, data }, index) => (
              <CardTransform
                key={item.pair}
                position={CARD_POSITIONS[index] || DEFAULT_POSITION}
                index={index}
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
              </CardTransform>
            ))}
          </div>
        </div>
      </section>
    );
  }
);

SectionMarketDisplay.displayName = 'SectionMarketDisplay';
