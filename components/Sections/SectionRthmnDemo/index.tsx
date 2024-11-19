'use client';
import { useState, useRef, useEffect } from 'react';
import { LineChart } from './LineChart';
import { MarketDisplay } from './MarketDisplay';
import { MotionDiv } from '@/components/MotionDiv';
import { CandleData } from '@/types/types';
import { FaChartArea, FaTable, FaCube, FaUserCircle } from 'react-icons/fa';
import { PatternDisplay } from './PatternDisplay';
import { LogoIcon, BellIcon } from '@/components/Accessibility/Icons/icons';
import { PairSlider } from './PairSlider';
import { MarketNavigator } from './MarketNavigator';

interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
}

type TabType = 'chart' | 'grid' | 'boxes' | 'navigation';

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

const DemoNavbar = ({
  activeTab,
  setActiveTab
}: {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}) => {
  return (
    <div className="mb-4 flex h-16 w-full items-center justify-between rounded-lg border border-white/5 bg-black/40 px-4 backdrop-blur-sm">
      {/* Left section */}
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center">
          <LogoIcon />
        </div>
      </div>

      {/* Center section - Navigation Tabs */}
      <div className="absolute left-1/2 flex -translate-x-1/2 transform items-center gap-3">
        {[
          { id: 'boxes', label: 'Boxes', icon: FaCube },
          { id: 'chart', label: 'Chart', icon: FaChartArea },
          { id: 'grid', label: 'Grid', icon: FaTable }
          // { id: 'navigation', label: 'Navigation', icon: FaList }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className="flex h-auto items-center rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] text-white transition-all duration-200 hover:from-[#444444] hover:to-[#282828]"
          >
            <span
              className={`flex w-full items-center gap-2 rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818] px-4 py-2 font-outfit text-xs font-semibold ${
                activeTab === tab.id
                  ? 'text-emerald-400'
                  : 'text-white hover:text-white'
              }`}
            >
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] text-white transition-all duration-200 hover:from-[#444444] hover:to-[#282828]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818]">
            <BellIcon />
          </div>
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] text-white transition-all duration-200 hover:from-[#444444] hover:to-[#282828]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818]">
            <FaUserCircle className="h-6 w-6 text-gray-300" />
          </div>
        </button>
      </div>
    </div>
  );
};

export function SectionRthmnDemo({ marketData }: { marketData: MarketData[] }) {
  const [selectedPair, setSelectedPair] = useState<string>(
    marketData[0]?.pair || ''
  );
  const [activeTab, setActiveTab] = useState<TabType>('boxes');
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

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'chart':
        return (
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
        );

      case 'grid':
        return (
          <div className="overflow-y-auto">
            <MarketDisplay marketData={marketData} />
          </div>
        );

      case 'boxes':
        return (
          <div className="overflow-x-auto overflow-y-auto">
            <PatternDisplay marketData={marketData} />
          </div>
        );

      case 'navigation':
        return (
          <div className="flex h-full gap-4">
            <div className="w-[300px]">
              <MarketNavigator
                marketData={marketData}
                selectedPair={selectedPair}
                onPairSelect={setSelectedPair}
              />
            </div>
            <div className="flex-1">
              <PairSlider
                marketData={marketData}
                selectedPair={selectedPair}
                onPairSelect={setSelectedPair}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="relative z-[100] flex h-full items-center justify-center py-12">
      <div className="relative h-[75vh] w-full overflow-hidden border-white/10 bg-black bg-black/90 p-2 backdrop-blur-md md:w-[90vw] md:rounded-xl md:border 2xl:w-[75vw]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_30%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
        <DemoNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <MotionDiv
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 h-full [transform:translateZ(20px)]"
        >
          {renderActiveTab()}
        </MotionDiv>
      </div>
    </section>
  );
}
