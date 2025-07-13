"use client";

import type { BoxColors } from "@/stores/colorStore";
import type { BoxSlice } from "@/types/types";
import { memo, useCallback, useMemo } from "react";
import Histogram from "@/components/Charts/Histogram";
import { useTimeframeStore } from "@/stores/timeframeStore";
import { useWebSocket } from "@/providers/WebsocketProvider";
import { formatPrice } from "@/utils/instruments";

interface PairMiniHistogramProps {
  pair: string;
  boxSlice?: BoxSlice;
  boxColors: BoxColors;
  isLoading: boolean;
  histogramData: any[];
  className?: string;
}

const PairMiniHistogram: React.FC<PairMiniHistogramProps> = ({
  pair,
  boxSlice,
  boxColors,
  isLoading,
  histogramData,
  className = "",
}) => {
  const { priceData } = useWebSocket();
  const currentPrice = pair ? priceData[pair]?.price : null;

  // Get timeframe settings for this pair (same as PairResoBox)
  const settings = useTimeframeStore(
    useCallback(
      (state) =>
        pair ? state.getSettingsForPair(pair) : state.global.settings,
      [pair]
    )
  );

  // Filter histogram data based on timeframe settings
  const filteredHistogramData = useMemo(() => {
    if (!histogramData || histogramData.length === 0) return [];

    // Start with historical data
    let processedData = [...histogramData];

    // FIXED: Add current live data as the most recent frame when available
    if (boxSlice && boxSlice.boxes && boxSlice.boxes.length > 0) {
      // Create a live frame that matches the histogram data structure
      const liveFrame = {
        timestamp: boxSlice.timestamp,
        progressiveValues: boxSlice.boxes.map((box) => ({
          high: box.high,
          low: box.low,
          value: box.value,
        })),
        currentOHLC: boxSlice.currentOHLC || {
          open: 0,
          high: 0,
          low: 0,
          close: 0,
        },
      };

      // Check if we need to replace the last frame or add a new one
      const lastHistoricalFrame = processedData[processedData.length - 1];
      const liveTimestamp = new Date(boxSlice.timestamp).getTime();
      const lastHistoricalTimestamp = lastHistoricalFrame
        ? new Date(lastHistoricalFrame.timestamp).getTime()
        : 0;

      // If live data is newer than the last historical frame, add it
      // If it's the same time, replace the last frame
      if (liveTimestamp > lastHistoricalTimestamp) {
        processedData.push(liveFrame);
      } else if (liveTimestamp === lastHistoricalTimestamp) {
        processedData[processedData.length - 1] = liveFrame;
      }
    }

    // Apply timeframe filtering to each frame's progressiveValues
    const filtered = processedData.map((frame) => ({
      ...frame,
      progressiveValues:
        frame.progressiveValues?.slice(
          settings.startIndex,
          settings.startIndex + settings.maxBoxCount
        ) || [],
    }));

    return filtered;
  }, [
    histogramData,
    boxSlice,
    settings.startIndex,
    settings.maxBoxCount,
    pair,
  ]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-2">
          <div className="font-russo text-lg text-white/90">
            {pair?.toUpperCase()}
          </div>
          <div className="font-mono text-sm text-white/70">Loading...</div>
        </div>
        <div
          className={`flex items-center justify-center h-[200px] bg-[#0A0B0D] border border-[#1C1E23] rounded-lg ${className}`}
        >
          <div className="text-xs text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!filteredHistogramData || filteredHistogramData.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-2">
          <div className="font-russo text-lg text-white/90">
            {pair?.toUpperCase()}
          </div>
          <div className="font-mono text-sm text-white/70">No Data</div>
        </div>
        <div
          className={`flex items-center justify-center h-[200px] bg-[#0A0B0D] border border-[#1C1E23] rounded-lg ${className}`}
        >
          <div className="text-xs text-gray-400">No Data</div>
        </div>
      </div>
    );
  }

  // Use the filtered historical data
  const frameCount = filteredHistogramData.length;
  const latestFrame = filteredHistogramData[filteredHistogramData.length - 1];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 px-2">
        <div className="font-russo text-lg text-white/90">
          {pair?.toUpperCase()}
        </div>
        <div className="font-outfit font-bold text-sm text-white/70">
          {currentPrice ? formatPrice(currentPrice, pair) : "---"}
        </div>
      </div>
      <div
        className={`relative h-[200px] bg-[#0A0B0D] border border-[#1C1E23] rounded-lg ${className}`}
      >
        <div className="absolute bottom-1 right-1 z-10">
          <span className="text-xs font-mono text-white/70 bg-black/50 px-1 rounded">
            {latestFrame?.progressiveValues?.length || 0}
          </span>
        </div>
        <Histogram
          data={filteredHistogramData}
          boxOffset={0}
          visibleBoxesCount={Math.min(
            settings.maxBoxCount,
            latestFrame?.progressiveValues?.length || settings.maxBoxCount
          )}
          boxVisibilityFilter="all"
          boxColors={boxColors}
          className="h-full"
          showLine={true}
        />
      </div>
    </div>
  );
};

export default memo(PairMiniHistogram);
