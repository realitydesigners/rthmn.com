import { motion } from 'framer-motion';
import { memo } from 'react';

interface RiskRewardGridProps {
    riskAmount: number;
    potentialProfit: number;
    ratio: number;
}

export const RiskRewardGrid = memo(({ riskAmount, potentialProfit, ratio }: RiskRewardGridProps) => {
    const gridSize = 5; // 5x5 grid
    const totalSquares = gridSize * gridSize;
    const riskSquares = Math.round(totalSquares / (ratio + 1));
    const rewardSquares = totalSquares - riskSquares;

    return (
        <div className='relative mt-4 flex flex-col items-center'>
            {/* Grid Container */}
            <div className={`grid grid-cols-${gridSize} gap-1`}>
                {/* Reward Squares (Green) */}
                {Array.from({ length: rewardSquares }).map((_, i) => (
                    <motion.div
                        key={`reward-${i}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.02 }}
                        className='h-4 w-4 rounded-sm border border-emerald-400/40 bg-emerald-400/20'
                    />
                ))}
                {/* Risk Squares (Red) */}
                {Array.from({ length: riskSquares }).map((_, i) => (
                    <motion.div
                        key={`risk-${i}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: (rewardSquares + i) * 0.02 }}
                        className='h-4 w-4 rounded-sm border border-red-400/40 bg-red-400/20'
                    />
                ))}
            </div>

            {/* Labels */}
            <div className='mt-4 flex w-full justify-between text-xs'>
                <div className='flex flex-col items-center'>
                    <span className='text-red-400'>Risk</span>
                    <span className='font-bold text-red-400'>{riskSquares} units</span>
                </div>
                <div className='flex flex-col items-center'>
                    <span className='text-emerald-400'>Reward</span>
                    <span className='font-bold text-emerald-400'>{rewardSquares} units</span>
                </div>
            </div>

            {/* Ratio Display */}
            <div className='mt-2 text-center'>
                <span className='font-kodemono text-sm text-neutral-400'>{ratio.toFixed(2)}:1 Ratio</span>
            </div>
        </div>
    );
});

RiskRewardGrid.displayName = 'RiskRewardGrid';
