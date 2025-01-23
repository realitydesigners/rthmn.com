import { LuZap, LuLayoutGrid, LuLineChart } from 'react-icons/lu';

interface InstrumentsContentProps {
    onComplete?: () => void;
}

export function InstrumentsContent({ onComplete }: InstrumentsContentProps) {
    return (
        <div className='w-[400px] overflow-hidden rounded-2xl border border-[#222] bg-gradient-to-b from-[#141414] via-[#111] to-[#0A0A0A] p-6 shadow-2xl before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.05),rgba(255,255,255,0))]'>
            <div className='relative space-y-6'>
                {/* Title with gradient */}
                <div className='space-y-2.5'>
                    <h3 className='bg-gradient-to-r from-white to-white/60 bg-clip-text text-2xl font-bold text-transparent'>Welcome to Instruments</h3>
                    <p className='text-[13px] leading-relaxed text-gray-400'>Manage your trading instruments and track real-time market data.</p>
                </div>

                {/* Features list with enhanced styling */}
                <div className='space-y-3'>
                    {/* Feature items with icons and gradients */}
                    <div className='group relative overflow-hidden rounded-xl border border-[#333] bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] p-0.5 transition-all duration-300 hover:border-blue-500/30'>
                        <div className='absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                        <div className='relative flex items-start gap-3 rounded-xl p-4'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-blue-500/20 via-blue-500/10 to-blue-500/5 transition-colors duration-300 group-hover:from-blue-500/30'>
                                <LuZap className='h-4 w-4 text-blue-400 transition-colors duration-300 group-hover:text-blue-300' />
                            </div>
                            <div className='flex-1'>
                                <div className='text-sm font-medium text-gray-200 transition-colors duration-300 group-hover:text-white'>Live Price Updates</div>
                                <div className='text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-400'>
                                    Track real-time prices for FX, Crypto, Stocks & ETFs
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='group relative overflow-hidden rounded-xl border border-[#333] bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] p-0.5 transition-all duration-300 hover:border-blue-500/30'>
                        <div className='absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                        <div className='relative flex items-start gap-3 rounded-xl p-4'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-blue-500/20 via-blue-500/10 to-blue-500/5 transition-colors duration-300 group-hover:from-blue-500/30'>
                                <LuLayoutGrid className='h-4 w-4 text-blue-400 transition-colors duration-300 group-hover:text-blue-300' />
                            </div>
                            <div className='flex-1'>
                                <div className='text-sm font-medium text-gray-200 transition-colors duration-300 group-hover:text-white'>Instrument Selection</div>
                                <div className='text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-400'>
                                    Easily add or remove trading pairs from your watchlist
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='group relative overflow-hidden rounded-xl border border-[#333] bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] p-0.5 transition-all duration-300 hover:border-blue-500/30'>
                        <div className='absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                        <div className='relative flex items-start gap-3 rounded-xl p-4'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-blue-500/20 via-blue-500/10 to-blue-500/5 transition-colors duration-300 group-hover:from-blue-500/30'>
                                <LuLineChart className='h-4 w-4 text-blue-400 transition-colors duration-300 group-hover:text-blue-300' />
                            </div>
                            <div className='flex-1'>
                                <div className='text-sm font-medium text-gray-200 transition-colors duration-300 group-hover:text-white'>Market Categories</div>
                                <div className='text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-400'>
                                    Browse instruments across multiple market categories
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom pattern */}
                <div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#333] to-transparent opacity-50' />

                {/* Enhanced button with gradient and effects */}
                <button
                    onClick={onComplete}
                    className='group relative w-full rounded-lg bg-gradient-to-b from-blue-500 to-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/20'>
                    <div className='absolute inset-0 rounded-lg bg-gradient-to-b from-white/[0.07] to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
                    <span className='relative'>Got it</span>
                </button>
            </div>
        </div>
    );
}
