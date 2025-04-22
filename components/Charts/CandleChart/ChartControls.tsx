import React from 'react';
import { RiBarChartBoxLine } from 'react-icons/ri';
import { BsBoxes, BsBoxArrowInDown, BsBoxArrowInUp } from 'react-icons/bs';

interface ChartControlsProps {
    showBoxLevels: boolean;
    setShowBoxLevels: (show: boolean) => void;
    boxVisibilityFilter: 'all' | 'positive' | 'negative';
    setBoxVisibilityFilter: (filter: 'all' | 'positive' | 'negative') => void;
    currentPrice?: string | number;
    pair: string;
}

const ChartControls: React.FC<ChartControlsProps> = ({ showBoxLevels, setShowBoxLevels, boxVisibilityFilter, setBoxVisibilityFilter, currentPrice, pair }) => {
    return (
        <div className='absolute top-4 right-16 left-0 z-10 flex items-center justify-between px-4'>
            <div className='flex items-baseline gap-2'>
                <h1 className='font-outfit text-xl font-bold tracking-wider text-white'>{pair}</h1>
                <div className='font-kodemono text-sm font-medium text-neutral-200'>{currentPrice || '-'}</div>
            </div>
            <div className='flex gap-2'>
                <button
                    onClick={() => setShowBoxLevels(!showBoxLevels)}
                    className='group relative flex items-center gap-2 overflow-hidden rounded-xl border border-[#3FFFA2]/20 bg-gradient-to-b from-[#3FFFA2]/10 via-[#3FFFA2]/5 to-transparent px-3 py-1.5 text-xs font-medium text-[#3FFFA2] shadow-[0_0_15px_rgba(63,255,162,0.15)] transition-all duration-300 hover:border-[#3FFFA2]/30 hover:text-[#3FFFA2] hover:shadow-[0_0_25px_rgba(63,255,162,0.25)] active:scale-[0.98]'>
                    <div className='absolute inset-0 rounded-xl bg-[#3FFFA2]/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                    <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3FFFA2]/20 to-transparent' />
                    <div className='absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#3FFFA2]/10 to-transparent' />
                    <RiBarChartBoxLine className='relative h-4 w-4' />
                    <span className='font-outfit relative'>Box Levels</span>
                </button>
                {showBoxLevels && (
                    <>
                        <button
                            onClick={() => setBoxVisibilityFilter('all')}
                            className={`group relative flex items-center gap-2 overflow-hidden rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-300 active:scale-[0.98] ${
                                boxVisibilityFilter === 'all'
                                    ? 'border border-blue-500/20 bg-gradient-to-b from-blue-500/10 via-blue-500/5 to-transparent text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:border-blue-500/30 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]'
                                    : 'border border-neutral-500/20 bg-gradient-to-b from-neutral-500/10 via-neutral-500/5 to-transparent text-neutral-400 hover:border-neutral-500/30'
                            }`}>
                            <div className='absolute inset-0 rounded-xl bg-blue-500/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                            <BsBoxes className='relative h-4 w-4' />
                            <span className='font-outfit relative'>All</span>
                        </button>
                        <button
                            onClick={() => setBoxVisibilityFilter('positive')}
                            className={`group relative flex items-center gap-2 overflow-hidden rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-300 active:scale-[0.98] ${
                                boxVisibilityFilter === 'positive'
                                    ? 'border border-green-500/20 bg-gradient-to-b from-green-500/10 via-green-500/5 to-transparent text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)] hover:border-green-500/30 hover:shadow-[0_0_25px_rgba(34,197,94,0.25)]'
                                    : 'border border-neutral-500/20 bg-gradient-to-b from-neutral-500/10 via-neutral-500/5 to-transparent text-neutral-400 hover:border-neutral-500/30'
                            }`}>
                            <div className='absolute inset-0 rounded-xl bg-green-500/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                            <BsBoxArrowInUp className='relative h-4 w-4' />
                            <span className='font-outfit relative'>Positive</span>
                        </button>
                        <button
                            onClick={() => setBoxVisibilityFilter('negative')}
                            className={`group relative flex items-center gap-2 overflow-hidden rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-300 active:scale-[0.98] ${
                                boxVisibilityFilter === 'negative'
                                    ? 'border border-red-500/20 bg-gradient-to-b from-red-500/10 via-red-500/5 to-transparent text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:border-red-500/30 hover:shadow-[0_0_25px_rgba(239,68,68,0.25)]'
                                    : 'border border-neutral-500/20 bg-gradient-to-b from-neutral-500/10 via-neutral-500/5 to-transparent text-neutral-400 hover:border-neutral-500/30'
                            }`}>
                            <div className='absolute inset-0 rounded-xl bg-red-500/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                            <BsBoxArrowInDown className='relative h-4 w-4' />
                            <span className='font-outfit relative'>Negative</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChartControls;
