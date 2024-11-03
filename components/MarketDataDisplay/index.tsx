'use client';
import { useEffect, useMemo } from 'react';

interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface MarketDataDisplayProps {
  pair: string;
  lastUpdated: string;
  candleData: Candle[];
}

export function MarketDataDisplay({
  pair,
  lastUpdated,
  candleData
}: MarketDataDisplayProps) {
  return (
    <div className="rounded-lg bg-black p-4">
      <div className="mb-4 text-white/60">
        <p>Last Updated: {new Date(lastUpdated).toLocaleString()}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-white/80">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-2 text-left">Time</th>
              <th className="px-4 py-2 text-right">Open</th>
              <th className="px-4 py-2 text-right">High</th>
              <th className="px-4 py-2 text-right">Low</th>
              <th className="px-4 py-2 text-right">Close</th>
            </tr>
          </thead>
          <tbody>
            {candleData.slice(0, 10).map((candle) => (
              <tr key={candle.timestamp} className="border-b border-white/5">
                <td className="px-4 py-2">
                  {new Date(candle.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right">
                  {candle.open.toFixed(5)}
                </td>
                <td className="px-4 py-2 text-right">
                  {candle.high.toFixed(5)}
                </td>
                <td className="px-4 py-2 text-right">
                  {candle.low.toFixed(5)}
                </td>
                <td className="px-4 py-2 text-right">
                  {candle.close.toFixed(5)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
