import React, { useMemo } from 'react';
import { BoxSlice, Box } from '@/types';
import { COLORS } from '../Histogram/Colors';

interface EmotionGaugeProps {
  trendData: BoxSlice[];
}

export const TrendHealth: React.FC<EmotionGaugeProps> = ({ trendData }) => {
  const { positiveCount, negativeCount, totalCount, positivePercentage } = useMemo(() => {
    if (trendData.length === 0 || !trendData[0].boxes) {
      return { positiveCount: 0, negativeCount: 0, totalCount: 0, positivePercentage: 50 };
    }

    let positive = 0;
    let negative = 0;
    let total = 0;

    const boxes: Box[] = trendData[0].boxes;
    boxes.forEach(box => {
      if (box.value > 0) {
        positive++;
      } else if (box.value < 0) {
        negative++;
      }
      total++;
    });

    const positivePercentage = total > 0 ? (positive / total) * 100 : 50;

    return { 
      positiveCount: positive, 
      negativeCount: negative, 
      totalCount: total, 
      positivePercentage
    };
  }, [trendData]);

  const dominantColor = positivePercentage >= 50 ? COLORS.GREEN : COLORS.RED;

  return (
    <div className="p-4 rounded-lg shadow-lg bg-black" style={{ 

      boxShadow: `0 5px 15px -5px rgba(0, 0, 0, 0.3), 0 0 20px ${dominantColor.LIGHT}33 inset`
    }}>
 <div className="mb-2 text-xs font-semibold flex justify-between" style={{ color: COLORS.NEUTRAL.LIGHT }}>
        <span style={{ 
          color: COLORS.GREEN.LIGHT,
          textShadow: `0 0 3px ${COLORS.GREEN.LIGHT}66`
        }}>Bullish</span>
        <span style={{ 
          color: COLORS.RED.LIGHT,
          textShadow: `0 0 3px ${COLORS.RED.LIGHT}66`
        }}>Bearish</span>
      </div>
      <div className="relative h-6 rounded-full overflow-hidden" style={{ 
        background: `linear-gradient(90deg, ${COLORS.NEUTRAL.DARK}, ${COLORS.NEUTRAL.MEDIUM})`,
      
      }}>
        <div 
          className="absolute top-0 left-0 h-full transition-all duration-500 ease-in-out"
          style={{ 
            width: `${positivePercentage}%`,
            background: `linear-gradient(90deg, ${COLORS.GREEN.DARK}, ${COLORS.GREEN.LIGHT})`,
            boxShadow: `0 0 20px ${COLORS.GREEN.LIGHT}, 0 0 20px ${COLORS.GREEN.LIGHT} inset`,
          }}
        ></div>
        <div 
          className="absolute top-0 right-0 h-full transition-all duration-500 ease-in-out"
          style={{ 
            width: `${100 - positivePercentage}%`,
            background: `linear-gradient(90deg, ${COLORS.RED.DARK}, ${COLORS.RED.LIGHT})`,
            boxShadow: `0 0 20px ${COLORS.RED.LIGHT}, 0 0 20px ${COLORS.RED.LIGHT} inset`,
          }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-xs font-medium" style={{ color: COLORS.NEUTRAL.LIGHT }}>
        <span>{positiveCount}/{totalCount} positive</span>
        <span>{negativeCount}/{totalCount} negative</span>
      </div>
      <div className="text-center mt-2 text-sm font-bold" style={{ 
        color: dominantColor.LIGHT,
        textShadow: `0 0 5px ${dominantColor.LIGHT}66`
      }}>
        Positive: {positivePercentage.toFixed(2)}%
      </div>
    </div>
  );
};

