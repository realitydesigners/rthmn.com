"use client";

import React, {
  useEffect,
  useCallback,
  useState,
  useRef,
  useMemo,
} from "react";
import { useWebSocket } from "@/providers/WebsocketProvider";
import CandleChart, { ChartDataPoint } from "@/components/Charts/CandleChart";
import { useUser } from "@/providers/UserProvider";
import { formatPrice } from "@/utils/instruments";
import { useDashboard } from "@/providers/DashboardProvider/client";
import { ResoBox } from "@/components/Charts/ResoBox";
import { useTimeframeStore } from "@/stores/timeframeStore";
import Histogram from "@/components/Charts/Histogram";
import { processLiveCandleUpdate } from "@/utils/chartDataProcessor";
import { ZenModeControls } from "@/components/Dashboard/ZenModeControls";
import ChartControls from "@/components/Charts/CandleChart/ChartControls";

export interface ExtendedBoxSlice {
  timestamp: string;
  progressiveValues: {
    high: number;
    low: number;
    value: number;
  }[];
  currentOHLC: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
}

interface ChartData {
  processedCandles: ChartDataPoint[];
  initialVisibleData: ChartDataPoint[];
  histogramBoxes: ExtendedBoxSlice[];
}

const PairClient = ({
  pair,
  chartData,
}: {
  pair: string;
  chartData: ChartData;
}) => {
  const { pairData } = useDashboard();
  const { priceData } = useWebSocket();
  const { boxColors } = useUser();
  const [candleData, setCandleData] = useState<ChartDataPoint[]>([]);
  const [histogramData, setHistogramData] = useState<ExtendedBoxSlice[]>([]);
  const currentCandleRef = useRef<ChartDataPoint | null>(null);

  // Add state for ZenModeControls
  const [viewMode, setViewMode] = useState<"scene" | "focus">("scene");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [boxVisibilityFilter, setBoxVisibilityFilter] = useState<
    "all" | "positive" | "negative"
  >("all");
  const [showBoxLevels, setShowBoxLevels] = useState(true); // Set to true by default
  const [hoveredTimestamp, setHoveredTimestamp] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  const handleHoverChange = useCallback((timestamp: number | null) => {
    setHoveredTimestamp(timestamp);
  }, []);

  const settings = useTimeframeStore(
    useCallback(
      (state) =>
        pair ? state.getSettingsForPair(pair) : state.global.settings,
      [pair]
    )
  );
  const updatePairSettings = useTimeframeStore(
    (state) => state.updatePairSettings
  );
  const initializePair = useTimeframeStore((state) => state.initializePair);

  // Initialize timeframe settings
  useEffect(() => {
    if (pair) {
      initializePair(pair);
    }
  }, [pair, initializePair]);

  // Set initial data after client-side render
  useEffect(() => {
    setIsClient(true);
    setCandleData(chartData.processedCandles);
    setHistogramData(chartData.histogramBoxes);
  }, [chartData]);

  const uppercasePair = pair.toUpperCase();
  const currentPrice = priceData[uppercasePair]?.price;
  const boxSlice = pairData[uppercasePair]?.boxes?.[0];

  // Initialize box data
  useEffect(() => {
    if (chartData.histogramBoxes.length > 0) {
      setHistogramData(chartData.histogramBoxes);
    }
  }, [chartData]);

  // Update candle data when price updates
  useEffect(() => {
    if (!currentPrice || !boxSlice?.currentOHLC) return;

    // Update both candle and histogram data together to ensure synchronization
    const timestamp = new Date().getTime();

    setCandleData((prev) => {
      return processLiveCandleUpdate(
        prev,
        {
          timestamp,
          price: currentPrice,
          ohlc: boxSlice.currentOHLC,
        },
        currentCandleRef
      );
    });

    // Update histogram data with current box values
    setHistogramData((prev) => {
      const newSlice: ExtendedBoxSlice = {
        timestamp: new Date(timestamp).toISOString(),
        progressiveValues: boxSlice.boxes.map((box) => ({
          high: box.high,
          low: box.low,
          value: box.value,
        })),
        currentOHLC: boxSlice.currentOHLC,
      };

      // Keep only the last N frames to prevent memory buildup
      const MAX_FRAMES = 2000;
      const updatedFrames = [...prev, newSlice];
      return updatedFrames.slice(-MAX_FRAMES);
    });
  }, [currentPrice, boxSlice?.currentOHLC, boxSlice?.boxes]);

  useEffect(() => {
    if (chartData.processedCandles.length > 0) {
      setCandleData(chartData.processedCandles);
      setHistogramData(chartData.histogramBoxes);
    }
  }, [chartData]);

  // Memoize the filtered boxes based on timeframe settings
  const filteredBoxSlice = useMemo(() => {
    if (!boxSlice?.boxes) return undefined;

    return {
      ...boxSlice,
      boxes:
        boxSlice.boxes.slice(
          settings.startIndex,
          settings.startIndex + settings.maxBoxCount
        ) || [],
    };
  }, [boxSlice, settings.startIndex, settings.maxBoxCount]);

  // Only render content after client-side hydration
  if (!isClient) {
    return <div className="h-screen w-screen bg-black" />;
  }

  return (
    <div className="flex h-screen w-screen px-2">
      <div className="flex w-[70%]  flex-col">
        <div className="relative flex h-[70vh] w-full flex-col">
          <div className="flex h-full w-full flex-1">
            <div className="h-full w-full">
              <div className="relative flex h-full flex-col overflow-hidden bg-black">
                <div className="h-full  w-full">
                  {candleData && candleData.length > 0 ? (
                    <CandleChart
                      candles={candleData}
                      initialVisibleData={candleData}
                      pair={pair}
                      histogramBoxes={histogramData.map((frame, index) => ({
                        timestamp: frame.timestamp,
                        boxes: frame.progressiveValues,
                        key: `${frame.timestamp}-${index}`,
                      }))}
                      boxOffset={settings.startIndex}
                      visibleBoxesCount={settings.maxBoxCount}
                      boxVisibilityFilter={boxVisibilityFilter}
                      hoveredTimestamp={hoveredTimestamp}
                      onHoverChange={handleHoverChange}
                      showBoxLevels={showBoxLevels}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white">
                      <div className="text-center">
                        <div className="text-sm text-gray-400">
                          Loading {pair}...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Histogram Section */}
        <div className="relative flex h-[15vh] w-full bg-black">
          <div className="h-full w-full">
            {histogramData && histogramData.length > 0 ? (
              <Histogram
                data={histogramData}
                boxOffset={settings.startIndex}
                visibleBoxesCount={settings.maxBoxCount}
                boxVisibilityFilter={boxVisibilityFilter}
                boxColors={boxColors}
                hoveredTimestamp={hoveredTimestamp}
                className="h-full"
              />
            ) : (
              <div className="flex h-full items-center justify-center primary-text">
                Loading Histogram...
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex w-[23%]  h-screen bg-black">
        <div className="flex flex-col gap- h-full w-full">
          {filteredBoxSlice && (
            <div className="h-auto w-auto pl-8 pr-16 py-8">
              <ResoBox
                slice={filteredBoxSlice}
                className="h-full w-full"
                boxColors={boxColors}
                pair={pair}
                showPriceLines={settings.showPriceLines}
              />
            </div>
          )}
        </div>
      </div>

      {/* Chart Controls - Now positioned on left side */}
      <div className="fixed left-16 top-1/3 transform -translate-y-1/2 z-30 pointer-events-auto z-[10]">
        <ChartControls
          showBoxLevels={showBoxLevels}
          setShowBoxLevels={setShowBoxLevels}
          boxVisibilityFilter={boxVisibilityFilter}
          setBoxVisibilityFilter={setBoxVisibilityFilter}
          currentPrice={formatPrice(currentPrice, pair)}
          pair={pair}
        />
      </div>

      {/* Add ZenModeControls */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
        <ZenModeControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          focusedIndex={focusedIndex}
          pairs={[pair]} // We only have one pair in this view
          onFocusChange={setFocusedIndex}
          isZenMode={false} // This ensures we show the chart style and layout controls
        />
      </div>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default React.memo(PairClient);
