import { memo } from 'react';
import { MotionDiv } from '@/components/MotionDiv';

interface PriceChartProps {
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  direction: 'long' | 'short';
}

export const PriceChart = memo(
  ({ entryPrice, stopLoss, takeProfit, direction }: PriceChartProps) => {
    const isLong = direction === 'long';
    const profitDistance = Math.abs(takeProfit - entryPrice);
    const riskDistance = Math.abs(stopLoss - entryPrice);
    const ratio = profitDistance / riskDistance;

    return (
      <div className="relative h-[300px] w-full rounded-xl border border-white/10 bg-black/40 p-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_50%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        <div className="relative h-full">
          {/* Take Profit Line */}
          <MotionDiv
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5 }}
            className="absolute left-0 h-px bg-emerald-400"
            style={{ top: isLong ? '20%' : '80%' }}
          >
            <div className="absolute -top-3 right-0 flex items-center gap-2">
              <div className="rounded bg-emerald-400/10 px-2 py-1">
                <span className="font-kodemono text-xs text-emerald-400">
                  Take Profit: ${takeProfit.toFixed(2)}
                </span>
              </div>
            </div>
          </MotionDiv>

          {/* Entry Price Line */}
          <MotionDiv
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute left-0 h-px bg-white/40"
            style={{ top: '50%' }}
          >
            <div className="absolute -top-3 right-0 flex items-center gap-2">
              <div className="rounded bg-white/10 px-2 py-1">
                <span className="font-kodemono text-xs text-white">
                  Entry: ${entryPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </MotionDiv>

          {/* Stop Loss Line */}
          <MotionDiv
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="absolute left-0 h-px bg-red-400"
            style={{ top: isLong ? '80%' : '20%' }}
          >
            <div className="absolute -top-3 right-0 flex items-center gap-2">
              <div className="rounded bg-red-400/10 px-2 py-1">
                <span className="font-kodemono text-xs text-red-400">
                  Stop Loss: ${stopLoss.toFixed(2)}
                </span>
              </div>
            </div>
          </MotionDiv>

          {/* Direction Arrow */}
          <MotionDiv
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="absolute left-4"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          >
            <div
              className={`flex h-20 items-center justify-center ${
                isLong ? 'flex-col' : 'flex-col-reverse'
              }`}
            >
              <div
                className={`h-16 w-1 ${
                  isLong ? 'bg-emerald-400/20' : 'bg-red-400/20'
                }`}
              />
              <div
                className={`h-4 w-4 rotate-45 transform ${
                  isLong ? 'bg-emerald-400/20' : 'bg-red-400/20'
                }`}
              />
            </div>
          </MotionDiv>

          {/* Risk/Reward Label */}
          <div className="absolute bottom-4 left-4">
            <div className="rounded-full bg-white/5 px-3 py-1">
              <span className="font-kodemono text-sm text-white/60">
                Risk/Reward: 1:{ratio.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PriceChart.displayName = 'PriceChart';
