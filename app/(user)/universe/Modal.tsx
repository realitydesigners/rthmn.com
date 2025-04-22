interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    pairName: string | null;
}

export const Modal = ({ isOpen, onClose, pairName }: ModalProps) => {
    if (!isOpen) return null;

    const baseModalClass = 'relative h-full w-full rounded-lg';

    let modalContent = null;

    switch (pairName) {
        case 'USDJPY':
            modalContent = (
                <div className={baseModalClass}>
                    <div className='relative h-full'>
                        <h2 className='mb-4 font-mono text-2xl font-bold text-white/90'>USD/JPY Trading Pair</h2>
                        <p className='mb-4 font-mono text-white/80'>Current Trading Pair: {pairName}</p>
                        <p className='font-mono text-sm leading-relaxed text-neutral-400'>
                            The USD/JPY (US Dollar/Japanese Yen) is one of the most traded currency pairs in the world. It represents the relationship between the world's leading
                            reserve currency and the currency of Japan, the world's third largest economy.
                        </p>
                        <div className='mt-8 grid grid-cols-2 gap-4'>
                            <div className='rounded-md border border-neutral-600/50 bg-black/50 p-4'>
                                <p className='font-mono text-sm text-neutral-400'>Daily Volume</p>
                                <p className='font-mono text-xl text-white'>$1.2T USD</p>
                            </div>
                            <div className='rounded-md border border-neutral-600/50 bg-black/50 p-4'>
                                <p className='font-mono text-sm text-neutral-400'>Volatility</p>
                                <p className='font-mono text-xl text-white'>17.3%</p>
                            </div>
                        </div>
                        <button
                            type='button'
                            className='absolute bottom-0 right-0 rounded border border-neutral-600/50 bg-black/50 px-6 py-2 font-mono text-sm text-white transition-all duration-300 hover:border-neutral-400 hover:bg-neutral-800'
                            onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            );
            break;

        case 'GBPUSD':
            modalContent = (
                <div className={baseModalClass}>
                    <div className='relative h-full'>
                        <h2 className='mb-4 font-mono text-2xl font-bold text-white/90'>GBP/USD Trading Pair</h2>
                        <p className='mb-4 font-mono text-white/80'>Current Trading Pair: {pairName}</p>
                        <p className='font-mono text-sm leading-relaxed text-neutral-400'>
                            Known as "Cable", the GBP/USD represents the relationship between the British Pound and US Dollar. This pair is one of the oldest and most traded
                            currency pairs in the forex market.
                        </p>
                        <div className='mt-8 grid grid-cols-2 gap-4'>
                            <div className='rounded-md border border-neutral-600/50 bg-black/50 p-4'>
                                <p className='font-mono text-sm text-neutral-400'>Daily Volume</p>
                                <p className='font-mono text-xl text-white'>$0.8T USD</p>
                            </div>
                            <div className='rounded-md border border-neutral-600/50 bg-black/50 p-4'>
                                <p className='font-mono text-sm text-neutral-400'>Volatility</p>
                                <p className='font-mono text-xl text-white'>15.8%</p>
                            </div>
                        </div>
                        <button
                            type='button'
                            className='absolute bottom-0 right-0 rounded border border-neutral-600/50 bg-black/50 px-6 py-2 font-mono text-sm text-white transition-all duration-300 hover:border-neutral-400 hover:bg-neutral-800'
                            onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            );
            break;

        // Add similar structures for other pairs...

        default:
            modalContent = (
                <div className={baseModalClass}>
                    <div className='relative h-full'>
                        <h2 className='mb-4 font-mono text-2xl font-bold text-white/90'>Trading Pair Details</h2>
                        <p className='mb-4 font-mono text-white/80'>Selected Pair: {pairName}</p>
                        <p className='font-mono text-sm leading-relaxed text-neutral-400'>
                            Detailed information for this trading pair will be available soon. Stay tuned for comprehensive market analysis and trading insights.
                        </p>
                        <div className='mt-8 grid grid-cols-2 gap-4'>
                            <div className='rounded-md border border-neutral-600/50 bg-black/50 p-4'>
                                <p className='font-mono text-sm text-neutral-400'>Status</p>
                                <p className='font-mono text-xl text-white'>Loading...</p>
                            </div>
                        </div>
                        <button
                            type='button'
                            className='absolute bottom-0 right-0 rounded border border-neutral-600/50 bg-black/50 px-6 py-2 font-mono text-sm text-white transition-all duration-300 hover:border-neutral-400 hover:bg-neutral-800'
                            onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            );
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
            <div className='fixed left-1/2 top-1/2 h-[50vh] w-[50vw] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-neutral-600/50 bg-black/90 p-8 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-neutral-500'>
                {modalContent}
            </div>
        </div>
    );
};
