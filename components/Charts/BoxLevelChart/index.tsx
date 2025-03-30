'use client';

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';

type Point = { timestamp: number; open: number; high: number; low: number; close: number; volume?: number };
type Box = { x?: number; high: number; low: number; value: any; timestamp?: number; boxIndex: number };

const CONFIG = {
    PAD: { T: 20, R: 70, B: 40, L: 0 },
    COLOR: { P: '#3FFFA2', N: '#FF3F3F' },
    BOX: { T: 0.01 },
    HOUR: 7200000,
    SCALE: 0.95,
} as const;

const useChart = (data: Point[], w = 0, h = 0) =>
    useMemo(() => {
        if (!data.length || !w || !h) return { data: [], min: 0, max: 0 };

        const [min, max] = data.reduce(([a, b], p) => [Math.min(a, p.low), Math.max(b, p.high)], [Infinity, -Infinity]);

        const pad = (max - min) * 0.05;
        const yMin = min - pad,
            yMax = max + pad;
        const scaleY = (p: number) => h * (1 - (p - yMin) / (yMax - yMin));

        return {
            data: data.map((p) => ({
                ...p,
                y: scaleY(p.close),
                yHigh: scaleY(p.high),
                yLow: scaleY(p.low),
            })),
            min: yMin,
            max: yMax,
        };
    }, [data, w, h]);

const BoxLevels = memo(
    ({
        data,
        histogramBoxes,
        width: w,
        height: h,
        boxOffset,
        visibleBoxesCount,
    }: {
        data: Point[];
        histogramBoxes: any[];
        width: number;
        height: number;
        boxOffset: number;
        visibleBoxesCount: number;
    }) => {
        if (!histogramBoxes?.length || !data.length) return null;

        const now = data[data.length - 1].timestamp;
        const boxes = histogramBoxes
            .filter((b) => new Date(b.timestamp).getTime() >= now - CONFIG.HOUR)
            .map((b) => {
                const slice = b.boxes.slice(boxOffset, boxOffset + visibleBoxesCount);
                return slice.length
                    ? {
                          time: new Date(b.timestamp).getTime(),
                          boxes: slice,
                          idx: b.boxes.findIndex((x) => x === slice[0]),
                      }
                    : null;
            })
            .filter(Boolean);

        if (boxes.length < 2) return null;

        const [min, max] = data.reduce(([a, b], p) => [Math.min(a, p.low), Math.max(b, p.high)], [Infinity, -Infinity]);
        const scaleY = (y: number) => h * (1 - (y - min) / (max - min));

        const sorted = [...boxes[0].boxes].sort((a, b) => Math.abs(a.high - a.low) - Math.abs(b.high - b.low));
        const idxMap = new Map(boxes[0].boxes.map((_, i) => [i, i + boxes[0].idx]));

        const level = {
            points: [
                {
                    x: 0,
                    high: sorted[0].high,
                    low: sorted[0].low,
                    value: sorted[0].value,
                    boxIndex: idxMap.get(0) || 0,
                },
            ] as Box[],
        };

        for (let i = 1; i < boxes.length; i++) {
            const box = [...boxes[i].boxes].sort((a, b) => Math.abs(a.high - a.low) - Math.abs(b.high - b.low))[0];
            const last = level.points[level.points.length - 1];
            const size = Math.abs(box.high - box.low);

            if (Math.abs(box.high - last.high) >= size * CONFIG.BOX.T || Math.abs(box.low - last.low) >= size * CONFIG.BOX.T) {
                level.points.push({
                    x: (last.x || 0) + Math.max(Math.abs(box.high - last.high), Math.abs(box.low - last.low)),
                    high: box.high,
                    low: box.low,
                    value: box.value,
                    boxIndex: last.boxIndex,
                    timestamp: i,
                });
            }
        }

        const xScale = (w * CONFIG.SCALE) / Math.max(...level.points.map((p) => p.x || 0));

        return (
            <g className='box-levels'>
                {level.points.slice(1).map((end, j) => {
                    const start = level.points[j];
                    return ['high', 'low'].map((t) => (
                        <line
                            key={`${t}-${j}`}
                            x1={(start.x || 0) * xScale}
                            y1={scaleY(start[t])}
                            x2={(end.x || 0) * xScale}
                            y2={scaleY(end[t])}
                            stroke={end[t] <= start[t] ? CONFIG.COLOR.N : CONFIG.COLOR.P}
                            strokeWidth={1}
                            strokeOpacity={0.8}
                        />
                    ));
                })}
            </g>
        );
    }
);

interface ChartProps {
    candles?: Point[];
    initialVisibleData: Point[];
    pair: string;
    histogramBoxes?: {
        timestamp: string;
        boxes: { high: number; low: number; value: number }[];
    }[];
    boxOffset?: number;
    visibleBoxesCount?: number;
    boxVisibilityFilter?: 'all' | 'positive' | 'negative';
    hoveredTimestamp?: number | null;
    onHoverChange?: (timestamp: number | null) => void;
}

const BoxLevelChart = ({ candles = [], histogramBoxes = [], boxOffset = 0, visibleBoxesCount = 7 }: ChartProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ w: 0, h: 0 });

    const w = size.w - CONFIG.PAD.L - CONFIG.PAD.R;
    const h = size.h - CONFIG.PAD.T - CONFIG.PAD.B;
    const { data } = useChart(candles, w, h);

    useEffect(() => {
        const update = () => {
            const p = ref.current?.parentElement;
            p && setSize({ w: p.clientWidth, h: p.clientHeight });
        };
        update();
        const obs = new ResizeObserver(update);
        ref.current?.parentElement && obs.observe(ref.current.parentElement);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={ref} className='absolute inset-0 h-full overflow-hidden'>
            <svg width='100%' height='100%'>
                <g transform={`translate(${CONFIG.PAD.L},${CONFIG.PAD.T})`}>
                    <BoxLevels data={data} histogramBoxes={histogramBoxes} width={w} height={h} boxOffset={boxOffset} visibleBoxesCount={visibleBoxesCount} />
                </g>
            </svg>
        </div>
    );
};

export default BoxLevelChart;
