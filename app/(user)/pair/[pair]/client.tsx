'use client';
import React, { useState, useEffect, useRef } from 'react';
import { BoxSlice, PairData, ViewType } from '@/types/types';
import HistogramManager from '@/components/Histogram/HistogramManager';
import { LineChart } from '../../../../components/LineChart';
import { useAuth } from '@/providers/SupabaseProvider';
import { useDraggableHeight } from '@/hooks/useDraggableHeight';
import { useBoxSliceData } from '@/hooks/useBoxSliceData';
import { useUrlParams } from '@/hooks/useUrlParams';
import { useSelectedFrame } from '@/hooks/useSelectedFrame';
import { createBoxCalculator } from '../boxCalculator';

interface DashboardClientProps {
    pair: string;
}

const Client: React.FC<DashboardClientProps> = ({ pair }) => {
    const { session } = useAuth();
    const [initialData, setInitialData] = useState<BoxSlice[]>([]);
    const [candleData, setCandleData] = useState<any[]>([]);
    const { boxOffset, handleOffsetChange } = useUrlParams(pair);
    const { selectedFrame, selectedFrameIndex, handleFrameSelect } = useSelectedFrame();
    const [visibleBoxesCount, setVisibleBoxesCount] = useState(16);
    const { data, filteredData, error, isLoading } = useBoxSliceData(pair.toUpperCase(), session, initialData, boxOffset, visibleBoxesCount);

    useEffect(() => {
        if (session && session.access_token) {
            const token = session.access_token;
            const CANDLE_LIMIT = 1000;

            const fetchCandles = async () => {
                try {
                    const response = await fetch(`/api/getCandles?pair=${pair.toUpperCase()}&limit=${CANDLE_LIMIT}&token=${token}`);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const { data } = await response.json();
                    console.log('Fetched candle data:', data);

                    // Create a reversed copy of the data
                    const reversedData = [...data].reverse();

                    // Transform the data to match LineChart's expected format
                    const formattedCandles =
                        reversedData.map((candle) => ({
                            close: Number(candle.close),
                            high: Number(candle.high),
                            low: Number(candle.low),
                            open: Number(candle.open),
                            time: new Date(candle.timestamp).getTime(),
                            symbol: candle.symbol,
                        })) || [];

                    // Calculate boxes using BoxCalculator
                    const boxCalculator = createBoxCalculator(pair.toUpperCase());
                    const boxResults = boxCalculator.calculateBoxArrays(reversedData);
                    console.log('Box calculations:', boxResults);

                    setCandleData(formattedCandles);
                    setBoxData(boxResults);
                } catch (error) {
                    console.error('Error fetching candles:', error);
                }
            };

            fetchCandles();
        }
    }, [session, pair]);

    const [viewType, setViewType] = useState<ViewType>('oscillator');
    const [boxData, setBoxData] = useState<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [rthmnVisionDimensions, setRthmnVisionDimensions] = useState({
        width: 0,
        height: 0,
    });

    const {
        height: histogramHeight,
        isDragging,
        handleDragStart,
    } = useDraggableHeight({
        initialHeight: 200,
        minHeight: 100,
        maxHeight: 350,
    });

    const handleViewChange = (newViewType: ViewType) => {
        setViewType(newViewType);
    };

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const containerHeight = containerRef.current.clientHeight;
                const containerWidth = containerRef.current.clientWidth;
                const newRthmnVisionHeight = containerHeight - histogramHeight - 80;
                setRthmnVisionDimensions({
                    width: containerWidth,
                    height: Math.max(newRthmnVisionHeight, 200),
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, [histogramHeight]);

    const BoxTable = () => {
        if (!boxData) return null;

        return (
            <div className='overflow-x-auto'>
                <table className='w-full text-left text-sm text-gray-300'>
                    <thead className='bg-gray-900 text-xs uppercase'>
                        <tr>
                            <th className='px-6 py-3'>Box Size</th>
                            <th className='px-6 py-3'>High</th>
                            <th className='px-6 py-3'>Low</th>
                            <th className='px-6 py-3'>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(boxData).map(([size, data]: [string, any]) => (
                            <tr key={size} className='border-b border-gray-800 bg-black'>
                                <td className='px-6 py-4'>{size}</td>
                                <td className='px-6 py-4'>{data.high.toFixed(5)}</td>
                                <td className='px-6 py-4'>{data.low.toFixed(5)}</td>
                                <td className='px-6 py-4'>{data.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className='flex h-screen w-full flex-col bg-black'>
            <div className='min-h-[400px]'>
                {candleData && candleData.length > 0 ? (
                    <LineChart pair={pair} candles={candleData} />
                ) : (
                    <div className='flex h-full items-center justify-center text-gray-400'>Loading candle data...</div>
                )}
            </div>

            <div className='h-full px-4 py-2'>
                <BoxTable />
            </div>
            {/* 
            <div
                className='shrink-0'
                style={{
                    height: `${histogramHeight + 40}px`,
                }}>
                <HistogramManager
                    data={filteredData}
                    height={histogramHeight}
                    boxOffset={boxOffset}
                    onOffsetChange={handleOffsetChange}
                    visibleBoxesCount={visibleBoxesCount}
                    viewType={viewType}
                    onViewChange={handleViewChange}
                    selectedFrame={selectedFrame}
                    selectedFrameIndex={selectedFrameIndex}
                    onFrameSelect={handleFrameSelect}
                    isDragging={isDragging}
                    onDragStart={handleDragStart}
                    containerWidth={rthmnVisionDimensions.width}
                />
            </div> */}
        </div>
    );
};

export default React.memo(Client);
