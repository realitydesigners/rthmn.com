import React, { useMemo } from 'react';
import { BoxSlice } from '@/types';

interface LineChartProps {
  data: BoxSlice[];
  height: number;
  width: number;
}

const LineChart: React.FC<LineChartProps> = ({ data, height, width }) => {
  const chartData = useMemo(() => {
    return data.map((slice) => ({
      timestamp: slice.timestamp,
      close: slice.boxes[0]?.high || 0, // Use the first box's high value as close
    }));
  }, [data]);

  const minPrice = Math.min(...chartData.map((d) => d.close));
  const maxPrice = Math.max(...chartData.map((d) => d.close));
  const minTimestamp = Math.min(...chartData.map((d) => d.timestamp as number));
  const maxTimestamp = Math.max(...chartData.map((d) => d.timestamp as number));

  const xScale = (timestamp: number) =>
    ((timestamp - minTimestamp) / (maxTimestamp - minTimestamp)) * width;
  const yScale = (price: number) =>
    height - ((price - minPrice) / (maxPrice - minPrice)) * height;

  const pathData = chartData
    .map(
      (d, i) =>
        `${i === 0 ? 'M' : 'L'} ${xScale(d.timestamp as number)} ${yScale(d.close)}`
    )
    .join(' ');

  return (
    <svg width={width} height={height}>
      <path
        d={pathData}
        fill="none"
        stroke="#2962FF"
        strokeWidth="2"
      />
    </svg>
  );
};

export default LineChart;
