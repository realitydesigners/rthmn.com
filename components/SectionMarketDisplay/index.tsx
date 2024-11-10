'use client';
import { useState, useEffect } from 'react';
import { MotionDiv } from '@/components/MotionDiv';
import { FaWaveSquare, FaCube, FaFingerprint } from 'react-icons/fa';
import TypeAnimation from 'react-type-animation';

interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
}

interface CandleData {
  mid: { c: string; o: string };
  volume: number;
}

export function SectionMarketDisplay({
  marketData
}: {
  marketData: MarketData[];
}) {
  // Refined card positions for better visual balance
  const getCardPosition = (index: number) => {
    const positions = [
      { x: -250, y: -180, z: 20 }, // Top row - wider spread
      { x: 0, y: -220, z: 30 }, // Higher center top
      { x: 250, y: -180, z: 20 },
      { x: -300, y: 10, z: 25 }, // Middle row - wider
      { x: 100, y: -50, z: 35 }, // Center card
      { x: 300, y: 0, z: 25 },
      { x: -250, y: 180, z: 15 }, // Bottom row
      { x: 0, y: 220, z: 25 },
      { x: 250, y: 180, z: 15 },
      { x: 20, y: 300, z: 45 } // Last card lower
    ];

    return positions[index] || { x: 0, y: 0, z: 0 };
  };

  // Add state for animation progress
  const [progress, setProgress] = useState(0);

  // Animation effect
  useEffect(() => {
    const duration = 10000; // 60 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(elapsed / duration, 1);
      setProgress(currentProgress);

      if (currentProgress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  // Modified data processing to include animation
  const processMarketData = (candleData: string, animationProgress: number) => {
    try {
      const data = JSON.parse(candleData) as CandleData[];
      const dataPoints = Math.floor(data.length * animationProgress);
      const animatedData = data.slice(0, dataPoints + 1);

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
    <section className="relative z-[100] flex min-h-screen">
      {/* 3D Cards Container */}
      <div className="relative w-1/2">
        <div className="relative h-[800px] [perspective:2500px]">
          {marketData.map((item, index) => {
            const data = processMarketData(item.candleData, progress);
            if (!data) return null;

            const position = getCardPosition(index);

            return (
              <MotionDiv
                key={item.pair}
                className="absolute left-1/2 top-1/2 h-[175px] w-[200px] -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                initial={{
                  x: position.x,
                  y: position.y,
                  z: position.z,
                  scale: 0.8,
                  rotateX: 15,
                  rotateY: -15
                }}
                animate={{
                  y: position.y + Math.sin(index * 0.5) * 12,
                  transition: {
                    y: {
                      duration: 3.5,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                      delay: index * 0.2
                    }
                  }
                }}
                whileHover={{
                  scale: 0.9,
                  z: position.z + 50,
                  rotateX: 0,
                  rotateY: 0,
                  transition: { duration: 0.3 }
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))'
                }}
              >
                {/* Enhanced Glass Card Effect */}
                <div className="relative h-full w-full rounded-xl border border-white/10 bg-black/60 p-5 backdrop-blur-md">
                  {/* Improved Gradient Overlay */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-black/30" />

                  {/* Subtle glow effect based on price change */}
                  <div
                    className={`absolute inset-0 rounded-xl opacity-20 blur-xl ${
                      data.change >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}
                  />

                  {/* Content */}
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
                            ? 'bg-green-500/20 text-green-400'
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

                    {/* Enhanced Sparkline with Animation */}
                    <div className="h-12 w-full">
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 200 60"
                        preserveAspectRatio="none"
                        className="overflow-visible"
                      >
                        <defs>
                          <linearGradient
                            id={`gradient-${index}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={
                                data.change >= 0 ? '#4ade80' : '#f87171'
                              }
                              stopOpacity="0.8"
                            />
                            <stop
                              offset="100%"
                              stopColor={
                                data.change >= 0 ? '#4ade80' : '#f87171'
                              }
                              stopOpacity="0.2"
                            />
                          </linearGradient>
                        </defs>
                        {/* Draw the full path with low opacity as background */}
                        <path
                          d={`M ${data.points
                            .map(
                              (p, i) =>
                                `${(i / (data.points.length - 1)) * 200} ${
                                  60 -
                                  ((p - Math.min(...data.points)) /
                                    (Math.max(...data.points) -
                                      Math.min(...data.points))) *
                                    60
                                }`
                            )
                            .join(' L ')}`}
                          fill="none"
                          stroke={`url(#gradient-${index})`}
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                          opacity="0.1"
                        />
                        {/* Draw the animated path on top */}
                        <path
                          d={`M ${data.points
                            .slice(
                              0,
                              Math.max(
                                2,
                                Math.floor(data.points.length * progress)
                              )
                            )
                            .map(
                              (p, i, arr) =>
                                `${(i / (data.points.length - 1)) * 200} ${
                                  60 -
                                  ((p - Math.min(...data.points)) /
                                    (Math.max(...data.points) -
                                      Math.min(...data.points))) *
                                    60
                                }`
                            )
                            .join(' L ')}`}
                          fill="none"
                          stroke={`url(#gradient-${index})`}
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                        />
                        {/* Animated dot following the line */}
                        {progress > 0 && data.points.length > 0 && (
                          <>
                            {(() => {
                              const currentIndex = Math.min(
                                Math.floor(data.points.length * progress),
                                data.points.length - 1
                              );
                              const minValue = Math.min(...data.points);
                              const maxValue = Math.max(...data.points);
                              const range = maxValue - minValue;

                              // Only render if we have valid values
                              if (range === 0 || !data.points[currentIndex])
                                return null;

                              const cx =
                                (currentIndex / (data.points.length - 1)) * 200;
                              const cy =
                                60 -
                                ((data.points[currentIndex] - minValue) /
                                  range) *
                                  60;

                              // Check for valid numbers before rendering
                              if (isNaN(cx) || isNaN(cy)) return null;

                              return (
                                <circle
                                  cx={cx.toString()}
                                  cy={cy.toString()}
                                  r="3"
                                  fill={
                                    data.change >= 0 ? '#4ade80' : '#f87171'
                                  }
                                  className="animate-pulse"
                                />
                              );
                            })()}
                          </>
                        )}
                      </svg>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <MotionDiv
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[11px] font-medium text-white/60"
                      >
                        Vol: {data.volume.toLocaleString()}
                      </MotionDiv>
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></div>
                    </div>
                  </div>
                </div>
              </MotionDiv>
            );
          })}
        </div>
      </div>

      {/* Content Section */}
      <div className="relative flex h-screen w-1/2 items-center justify-center pr-16">
        <MotionDiv
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-outfit relative z-10 bg-gradient-to-r from-white to-white/60 bg-clip-text text-[3em] font-bold leading-[1em] tracking-tight text-transparent lg:text-[7em] lg:leading-[1em]">
            Trading
            <br />
            Simplified
          </h2>
        </MotionDiv>
      </div>
    </section>
  );
}
