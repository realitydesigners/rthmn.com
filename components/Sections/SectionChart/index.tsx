'use client';
import { useState, useRef, useEffect } from 'react';
import { LineChart } from './LineChart';
import { MarketDisplay } from './MarketDisplay';
import { MotionDiv } from '@/components/MotionDiv';
import { CandleData } from '@/types/types';
import { FaChartArea, FaTable } from 'react-icons/fa';

interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
}

const MarketCard = ({
  item,
  isSelected,
  onClick
}: {
  item: MarketData;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const getLatestPrice = (candleData: string) => {
    try {
      const data = JSON.parse(candleData) as CandleData[];
      return parseFloat(data[data.length - 1].mid.c);
    } catch (e) {
      return null;
    }
  };

  const getPriceChange = (candleData: string) => {
    try {
      const data = JSON.parse(candleData) as CandleData[];
      const firstPrice = parseFloat(data[0].mid.o);
      const lastPrice = parseFloat(data[data.length - 1].mid.c);
      const change = ((lastPrice - firstPrice) / firstPrice) * 100;
      return change;
    } catch (e) {
      return null;
    }
  };

  const latestPrice = getLatestPrice(item.candleData);
  const priceChange = getPriceChange(item.candleData);

  return (
    <MotionDiv
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`group relative flex h-[40px] cursor-pointer items-center justify-between rounded-md border px-3 backdrop-blur-sm transition-all duration-200 ${
        isSelected
          ? 'border-[#22c55e]/50 bg-[#22c55e]/10'
          : 'border-white/5 bg-black/40 hover:border-white/10 hover:bg-black/60'
      }`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 h-full w-[3px] rounded-l-md bg-[#22c55e]" />
      )}

      <div className="flex w-full items-center justify-between">
        <span className="text-xs font-medium text-white/90">
          {item.pair.replace('_', '/')}
        </span>
        <span className="text-xs font-medium text-white/90">
          {latestPrice
            ? latestPrice.toFixed(item.pair.includes('JPY') ? 3 : 5)
            : 'N/A'}
        </span>
        <span
          className={`rounded-sm px-1.5 py-0.5 text-[9px] font-semibold ${
            priceChange >= 0
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {priceChange ? `${priceChange.toFixed(1)}%` : 'N/A'}
        </span>
      </div>
    </MotionDiv>
  );
};

const Navigation = ({
  activeTab,
  setActiveTab
}: {
  activeTab: 'chart' | 'grid';
  setActiveTab: (tab: 'chart' | 'grid') => void;
}) => (
  <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-2">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {['chart', 'grid'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'chart' | 'grid')}
            className={`flex items-center gap-1.5 rounded-md bg-gradient-to-b p-[1px] transition-all duration-200 ${
              activeTab === tab
                ? 'from-green-500/50 to-green-500/20 hover:from-green-500/60 hover:to-green-500/30'
                : 'from-[#333333] to-[#181818] hover:from-[#444444] hover:to-[#282828]'
            } `}
          >
            <span
              className={`flex w-full items-center gap-1.5 rounded-md bg-gradient-to-b from-black to-black/80 px-3 py-1.5 text-sm font-medium ${activeTab === tab ? 'text-emerald-400' : 'text-white/70'} `}
            >
              {tab === 'chart' ? (
                <FaChartArea className="h-3.5 w-3.5" />
              ) : (
                <FaTable className="h-3.5 w-3.5" />
              )}
              {tab === 'chart' ? 'Chart View' : 'Market Grid'}
            </span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export function SectionChart({ marketData }: { marketData: MarketData[] }) {
  const [selectedPair, setSelectedPair] = useState<string>(
    marketData[0]?.pair || ''
  );
  const [activeTab, setActiveTab] = useState<'chart' | 'grid'>('chart');
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Process candles for LineChart
  const processCandles = (candleDataString: string) => {
    try {
      const data = JSON.parse(candleDataString) as CandleData[];
      return data.map((candle) => ({
        time: candle.time,
        open: parseFloat(candle.mid.o),
        high: parseFloat(candle.mid.h),
        low: parseFloat(candle.mid.l),
        close: parseFloat(candle.mid.c),
        volume: candle.volume
      }));
    } catch (e) {
      return [];
    }
  };

  // 3D mouse effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePosition({ x, y });
    };

    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);
    return () => container?.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const selectedMarketData = marketData.find(
    (item) => item.pair === selectedPair
  );
  const candles = selectedMarketData
    ? processCandles(selectedMarketData.candleData)
    : [];

  return (
    <section className="relative z-[100] px-8 px-[5vw] py-12 xl:px-[15vw] 2xl:px-[15vw]">
      <div
        ref={containerRef}
        className="relative transition-transform duration-300 ease-out [transform-style:preserve-3d]"
        style={{
          transform: `perspective(1000px) rotateX(${mousePosition.y * 2}deg) rotateY(${mousePosition.x * 2}deg)`
        }}
      >
        <div className="relative rounded-xl border border-white/10 bg-black/90 p-6 backdrop-blur-md [transform-style:preserve-3d] [transform:translateZ(50px)]">
          {/* Simplified, elegant effects */}
          <div className="pointer-events-none absolute inset-0">
            {/* Main gradient overlay */}
            <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_30%)]" />

            {/* Subtle top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          </div>

          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
          <MotionDiv
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 h-full [transform:translateZ(20px)]"
          >
            {activeTab === 'chart' ? (
              <div className="flex flex-col gap-4 lg:flex-row">
                {/* Main Chart Area */}
                <div className="relative z-[100] flex-1 space-y-3">
                  <div className="relative h-[400px] overflow-hidden rounded-lg border border-white/5 bg-black/20 backdrop-blur-sm lg:h-[500px]">
                    <LineChart pair={selectedPair} candles={candles} />
                  </div>
                </div>

                {/* Market Cards - Side on desktop, bottom on mobile */}
                <div className="w-full flex-shrink-0 space-y-3 lg:w-[220px]">
                  <div className="rounded-lg border border-white/5 bg-black/20 p-2 backdrop-blur-sm">
                    <div className="scrollbar-thin scrollbar-track-white/5 grid max-h-[200px] grid-cols-2 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-3 lg:max-h-[500px] lg:grid-cols-1">
                      {marketData.map((marketItem) => (
                        <MarketCard
                          key={marketItem.pair}
                          item={marketItem}
                          isSelected={selectedPair === marketItem.pair}
                          onClick={() => setSelectedPair(marketItem.pair)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-y-auto">
                <MarketDisplay marketData={marketData} />
              </div>
            )}
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}
