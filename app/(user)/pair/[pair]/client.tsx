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

                    // Transform the data to match LineChart's expected format
                    const formattedCandles =
                        data?.map((candle) => ({
                            close: Number(candle.close),
                            high: Number(candle.high),
                            low: Number(candle.low),
                            open: Number(candle.open),
                            time: new Date(candle.timestamp).getTime(), // Convert timestamp to milliseconds
                            symbol: candle.symbol,
                        })) || [];

                    setCandleData(formattedCandles);
                } catch (error) {
                    console.error('Error fetching candles:', error);
                }
            };

            fetchCandles();
        }
    }, [session, pair]);

    const [viewType, setViewType] = useState<ViewType>('oscillator');
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

    return (
        <div className='flex h-screen w-full flex-col overflow-hidden bg-black'>
            <div className='min-h-[400px] grow overflow-hidden'>
                {candleData && candleData.length > 0 ? (
                    <LineChart pair={pair} candles={candleData} />
                ) : (
                    <div className='flex h-full items-center justify-center text-gray-400'>Loading candle data...</div>
                )}
            </div>

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
            </div>
        </div>
    );
};

export default React.memo(Client);
