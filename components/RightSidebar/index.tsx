'use client';
import { useState, useEffect } from 'react';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

interface RightSidebarProps {
    selectedPair: string | null;
    candles: any[] | null;
    isLoading: boolean;
    error: string;
    limit: number;
    setLimit: (limit: number) => void;
    isChronological: boolean;
    setIsChronological: (value: boolean) => void;
    handleFetchCandles: (limit: number) => void;
    pairBoxSlices: any | null;
    handleFetchBoxSlices: () => void;
}

const BoxValuesTable = ({ pair }: { pair: string }) => {
    const { pairData } = useDashboard();
    const [boxHistory, setBoxHistory] = useState<any[]>([]);

    useEffect(() => {
        const boxes = pairData[pair]?.boxes?.[0]?.boxes;
        if (boxes) {
            setBoxHistory((prev) => {
                const newEntry = {
                    boxes,
                    timestamp: new Date().toISOString(),
                };
                return [newEntry, ...prev].slice(0, 50);
            });
        }
    }, [pair, pairData]);

    if (!boxHistory.length) {
        return <div className='text-gray-400'>No box data available...</div>;
    }

    const latestBoxes = boxHistory[0].boxes;

    return (
        <div className='overflow-auto'>
            <table className='w-full text-left text-[11px]'>
                <thead>
                    <tr className='text-gray-500'>
                        <th className='p-1'>BOX #</th>
                        <th className='p-1'>HIGH</th>
                        <th className='p-1'>LOW</th>
                        <th className='p-1'>VALUE</th>
                    </tr>
                </thead>
                <tbody>
                    {latestBoxes.map((box, index) => (
                        <tr key={index} className='hover:bg-black/20'>
                            <td className='p-1 text-gray-500'>{index + 1}</td>
                            <td className='p-1 font-mono text-green-400'>{box.high.toFixed(5)}</td>
                            <td className='p-1 font-mono text-red-400'>{box.low.toFixed(5)}</td>
                            <td className={`p-1 font-mono ${box.value > 0 ? 'text-green-400' : 'text-red-400'}`}>{box.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const fetchCandles = async (pair: string, limit: number, token: string) => {
    const response = await fetch(`/api/getCandles?pair=${pair}&limit=${limit}&token=${token}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const { data } = await response.json();
    return data;
};

const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    } catch (e) {
        return '';
    }
};

const CollapsibleSection = ({ title, children, defaultOpen = false, count = null }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className='rounded border border-[#181818] bg-[#0a0a0a]'>
            <button onClick={() => setIsOpen(!isOpen)} className='flex w-full items-center justify-between p-2 hover:bg-[#111111]'>
                <h4 className='text-[11px] font-medium text-gray-300'>
                    {title} {count !== null && `(${count})`}
                </h4>
                {isOpen ? <IoChevronUp size={14} /> : <IoChevronDown size={14} />}
            </button>
            {isOpen && (
                <div className='border-t border-[#181818] p-2'>
                    <div className='h-[300px] overflow-auto'>{children}</div>
                </div>
            )}
        </div>
    );
};

export function RightSidebar({
    selectedPair,
    candles,
    isLoading,
    error,
    limit,
    setLimit,
    isChronological,
    setIsChronological,
    handleFetchCandles,
    pairBoxSlices,
    handleFetchBoxSlices,
}: RightSidebarProps) {
    const [showJson, setShowJson] = useState(false);
    const handleFetchClick = () => {
        handleFetchCandles(limit);
    };

    return (
        <div className='fixed top-0 right-0 hidden h-screen w-[400px] overflow-y-auto border-l border-[#181818] bg-black p-4 lg:block'>
            <div className='flex flex-col gap-4 pb-4'>
                <CollapsibleSection title='Box Values'>
                    <BoxValuesTable pair={selectedPair} />
                </CollapsibleSection>

                <CollapsibleSection title='Historical Candles'>
                    <div className='space-y-2'>
                        <div className='flex items-center justify-between gap-2'>
                            <div className='flex items-center gap-2'>
                                <div className='flex items-center gap-2 text-[11px]'>
                                    <span className='text-gray-400'>Limit:</span>
                                    <input
                                        type='number'
                                        value={limit}
                                        onChange={(e) => setLimit(Number(e.target.value))}
                                        className='w-16 rounded border border-[#181818] bg-black px-1 py-0.5 text-gray-300'
                                    />
                                </div>
                                <button onClick={handleFetchClick} className='border border-[#181818] bg-black px-2 py-1 text-[11px] text-gray-300 hover:bg-[#111111]'>
                                    Fetch
                                </button>
                            </div>
                            <div className='flex items-center gap-2'>
                                <button
                                    onClick={() => setShowJson(!showJson)}
                                    className={`border border-[#181818] px-2 py-1 text-[11px] text-gray-300 transition-colors ${
                                        showJson ? 'bg-[#181818]' : 'bg-black hover:bg-[#111111]'
                                    }`}>
                                    JSON
                                </button>
                                <label className='flex items-center gap-1 text-[11px] text-gray-400'>
                                    <input type='checkbox' checked={isChronological} onChange={(e) => setIsChronological(e.target.checked)} className='rounded border-gray-700' />
                                    Show oldest first
                                </label>
                            </div>
                        </div>
                        <div className='space-y-0.5'>
                            {isLoading ? (
                                <div className='text-[11px] text-gray-400'>Loading...</div>
                            ) : candles?.length > 0 ? (
                                showJson ? (
                                    <pre className='overflow-auto rounded bg-black/40 p-1.5 text-[11px] text-green-400'>{JSON.stringify(candles, null, 2)}</pre>
                                ) : (
                                    candles.map((candle, index) => (
                                        <div key={index} className='flex justify-between font-mono text-[11px]'>
                                            <span className='text-gray-500'>{formatTime(candle.timestamp)}</span>
                                            <div className='flex gap-2'>
                                                <span className='text-gray-500'>O:</span>
                                                <span className={candle.close >= candle.open ? 'text-green-400' : 'text-red-400'}>{candle.open.toFixed(5)}</span>
                                                <span className='text-gray-500'>H:</span>
                                                <span className='text-green-400'>{candle.high.toFixed(5)}</span>
                                                <span className='text-gray-500'>L:</span>
                                                <span className='text-red-400'>{candle.low.toFixed(5)}</span>
                                                <span className='text-gray-500'>C:</span>
                                                <span className={candle.close >= candle.open ? 'text-green-400' : 'text-red-400'}>{candle.close.toFixed(5)}</span>
                                            </div>
                                        </div>
                                    ))
                                )
                            ) : (
                                <div className='text-[11px] text-gray-500'>No data available</div>
                            )}
                        </div>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title='Box Slices' count={pairBoxSlices?.length}>
                    <div>
                        <button
                            onClick={handleFetchBoxSlices}
                            className='mb-2 w-full border border-[#181818] bg-black px-2 py-2 text-[11px] text-gray-300 transition-colors hover:bg-[#181818]'>
                            Refresh Box Slices
                        </button>
                        <div className='overflow-auto'>
                            {isLoading ? (
                                <div className='text-[11px] text-gray-400'>Loading...</div>
                            ) : pairBoxSlices ? (
                                <pre className='rounded bg-black/40 p-1.5 text-[11px] text-green-400'>{JSON.stringify(pairBoxSlices, null, 2)}</pre>
                            ) : (
                                <div className='text-[11px] text-gray-500'>No box slices available</div>
                            )}
                        </div>
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
}
