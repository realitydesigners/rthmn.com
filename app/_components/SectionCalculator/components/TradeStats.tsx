import { memo } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaDollarSign, FaExchangeAlt, FaPercentage } from 'react-icons/fa';

interface TradeStatsProps {
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    positionSize: number;
    riskAmount: number;
    potentialProfit: number;
}

export const TradeStats = memo(({ entryPrice, stopLoss, takeProfit, positionSize, riskAmount, potentialProfit }: TradeStatsProps) => {
    const pips = Math.abs(entryPrice - stopLoss);
    const profitPips = Math.abs(takeProfit - entryPrice);
    const winRate = (potentialProfit / riskAmount) * 50; // Estimated win rate

    return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {[
                {
                    label: 'Stop Distance',
                    value: `${pips.toFixed(1)} pips`,
                    icon: <FaChartLine />,
                    color: 'text-red-400',
                    bgColor: 'bg-red-400/10',
                },
                {
                    label: 'Target Distance',
                    value: `${profitPips.toFixed(1)} pips`,
                    icon: <FaChartLine />,
                    color: 'text-emerald-400',
                    bgColor: 'bg-emerald-400/10',
                },
                {
                    label: 'Win Rate Needed',
                    value: `${winRate.toFixed(1)}%`,
                    icon: <FaPercentage />,
                    color: 'text-blue-400',
                    bgColor: 'bg-blue-400/10',
                },
                {
                    label: 'Break Even Rate',
                    value: `${(100 - winRate).toFixed(1)}%`,
                    icon: <FaExchangeAlt />,
                    color: 'text-amber-400',
                    bgColor: 'bg-amber-400/10',
                },
            ].map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className='relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-4'>
                    <div className='pointer-events-none absolute inset-0'>
                        <div className='absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_50%)]' />
                        <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent' />
                    </div>
                    <div className='relative'>
                        <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${stat.bgColor}`}>
                            <div className={`h-4 w-4 ${stat.color}`}>{stat.icon}</div>
                        </div>
                        <div className='font-kodemono text-sm text-gray-400'>{stat.label}</div>
                        <div className={`font-outfit mt-1 text-xl font-bold ${stat.color}`}>{stat.value}</div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
});

TradeStats.displayName = 'TradeStats';
