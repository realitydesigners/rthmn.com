'use client';
import { useState, useRef, useEffect } from 'react';
import { LineChart } from './LineChart';
import { MarketDisplay } from './MarketDisplay';
import { MotionDiv } from '@/components/MotionDiv';
import {
  FaChartArea,
  FaTable,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaChartBar
} from 'react-icons/fa';

interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
}

interface CandleData {
  time: string;
  volume: number;
  mid: {
    o: string;
    h: string;
    l: string;
    c: string;
  };
}

const MarketStats = ({ candles }: { candles: any[] }) => {
  const getStats = () => {
    if (candles.length === 0) return { high: 0, low: 0, range: 0 };
    const high = Math.max(...candles.map((c) => c.high));
    const low = Math.min(...candles.map((c) => c.low));
    return {
      high: high.toFixed(5),
      low: low.toFixed(5),
      range: (((high - low) / low) * 100).toFixed(2)
    };
  };

  const stats = getStats();

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <FaArrowUp className="h-4 w-4 text-green-500" />
        <div className="flex flex-col">
          <span className="text-[10px] text-white/50">High</span>
          <span className="font-mono text-xs text-white">{stats.high}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <FaArrowDown className="h-4 w-4 text-red-500" />
        <div className="flex flex-col">
          <span className="text-[10px] text-white/50">Low</span>
          <span className="font-mono text-xs text-white">{stats.low}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <FaClock className="h-4 w-4 text-blue-500" />
        <div className="flex flex-col">
          <span className="text-[10px] text-white/50">Range</span>
          <span className="font-mono text-xs text-white">{stats.range}%</span>
        </div>
      </div>
    </div>
  );
};

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
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {priceChange ? `${priceChange.toFixed(1)}%` : 'N/A'}
        </span>
      </div>
    </MotionDiv>
  );
};

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
    <section className="relative z-[100] px-8 px-[5vw] py-12 xl:px-[10vw] 2xl:px-[15vw]">
      <div
        ref={containerRef}
        className="relative transition-transform duration-300 ease-out [transform-style:preserve-3d]"
        style={{
          transform: `perspective(1000px) rotateX(${mousePosition.y * 2}deg) rotateY(${mousePosition.x * 2}deg)`
        }}
      >
        <div className="relative rounded-md border border-white/10 bg-black p-6 backdrop-blur-md [transform-style:preserve-3d] [transform:translateZ(50px)]">
          {/* Glow Effect */}
          <div className="pointer-events-none absolute inset-0 rounded-md bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent_50%)]" />

          {/* Tab Navigation */}
          <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('chart')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all ${
                    activeTab === 'chart'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  <FaChartArea className="h-3.5 w-3.5" />
                  Chart View
                </button>
                <button
                  onClick={() => setActiveTab('grid')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all ${
                    activeTab === 'grid'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  <FaTable className="h-3.5 w-3.5" />
                  Market Grid
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <MotionDiv
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 h-full [transform:translateZ(20px)]"
          >
            {activeTab === 'chart' ? (
              <div className="flex gap-4">
                {/* Main Chart Area */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">
                      {selectedPair.replace('_', '/')}
                    </h2>
                    <MarketStats candles={candles} />
                  </div>
                  <div className="relative h-[500px] overflow-hidden">
                    <LineChart pair={selectedPair} candles={candles} />
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-[220px] flex-shrink-0 space-y-3">
                  {/* Market Overview */}
                  <div className="rounded-lg border border-white/5 bg-black/40 p-2">
                    <div className="scrollbar-thin scrollbar-track-white/5 max-h-[500px] space-y-1.5 overflow-y-auto pr-1">
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
              <div className="scrollbar-thin scrollbar-track-white/5 h-[calc(100vh-220px)] overflow-y-auto">
                <MarketDisplay marketData={marketData} />
              </div>
            )}
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}
