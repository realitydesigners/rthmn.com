import { memo } from 'react';

export type Direction = 'long' | 'short';

interface TradeDirectionProps {
    direction: Direction;
    onDirectionChange: (direction: Direction) => void;
}

export const TradeDirection = memo(({ direction, onDirectionChange }: TradeDirectionProps) => (
    <div className='flex gap-2'>
        <button
            onClick={() => onDirectionChange('long')}
            className={`group relative flex items-center gap-2 rounded-full border px-4 py-2 transition-all duration-300 ${
                direction === 'long' ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-400' : 'border-white/10 bg-black/40 text-gray-400 hover:border-white/20'
            }`}>
            <span className='font-kodemono'>Long</span>
        </button>
        <button
            onClick={() => onDirectionChange('short')}
            className={`group relative flex items-center gap-2 rounded-full border px-4 py-2 transition-all duration-300 ${
                direction === 'short' ? 'border-red-400/50 bg-red-400/10 text-red-400' : 'border-white/10 bg-black/40 text-gray-400 hover:border-white/20'
            }`}>
            <span className='font-kodemono'>Short</span>
        </button>
    </div>
));
