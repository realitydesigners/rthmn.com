interface InstrumentsContentProps {
    onComplete?: () => void;
}

export function InstrumentsContent({ onComplete }: InstrumentsContentProps) {
    return (
        <div className='w-[400px] rounded-lg border border-[#181818] bg-[#0a0a0a] p-6 shadow-xl'>
            <div className='space-y-4'>
                <h3 className='text-xl font-bold text-white'>Welcome to Instruments</h3>
                <p className='text-gray-300'>This is where you'll manage your trading pairs and monitor their performance.</p>
                <div className='rounded-lg bg-[#111] p-4'>
                    <ul className='list-inside list-disc space-y-2 text-gray-400'>
                        <li>View your selected pairs in real-time</li>
                        <li>Add or remove currency pairs</li>
                        <li>Track performance metrics</li>
                    </ul>
                </div>
                <button onClick={onComplete} className='w-full rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400'>
                    Got it
                </button>
            </div>
        </div>
    );
}
