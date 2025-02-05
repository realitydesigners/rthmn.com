'use client';

import React, { useMemo } from 'react';
import { useDashboard } from '@/providers/DashboardProvider/client';
import type { Box } from '@/types/types';

interface BoxDetailsRowProps {
    boxes: Box[];
    maxBoxCount: number;
    pairName: string;
    showSizes?: boolean;
}

export const BoxDetailsRow: React.FC<BoxDetailsRowProps> = ({ boxes, maxBoxCount, pairName, showSizes = false }) => {
    if (!boxes?.length) return null;
    const { boxColors } = useDashboard();

    // Memoize sorted boxes to prevent recreation on every render
    const sortedBoxes = useMemo(() => boxes.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, maxBoxCount), [boxes, maxBoxCount]);

    const BOX_HEIGHT = 40; // Base height for boxes
    const BOX_GAP = 0; // Gap between boxes
    const LABEL_HEIGHT = 20; // Height for size labels

    const formatNumber = (value: number): string => {
        const absValue = Math.abs(value);

        if (absValue >= 1000000) {
            return `${(value / 1000000).toFixed(2)}M`;
        }
        if (absValue >= 1000) {
            return `${(value / 1000).toFixed(2)}K`;
        }
        return value.toFixed(2);
    };

    return (
        <div className='flex w-full flex-col'>
            {/* Size Labels Section - Only shown for first row */}
            {showSizes && (
                <div
                    className='mb-2 flex w-full pl-[60px]' // Align with boxes below
                    style={{ height: LABEL_HEIGHT }}>
                    {sortedBoxes.map((box, index) => (
                        <div key={`size-${index}`} className='flex-1 text-center' style={{ minWidth: 30 }}>
                            <span className='font-mono text-[9px] text-gray-400'>{formatNumber(box.value)}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Main Row Container */}
            <div className='flex w-full items-center' style={{ maxHeight: BOX_HEIGHT - 6 }}>
                {/* Pair Name */}
                <div className='flex min-w-[60px] items-center'>
                    <div className='font-kodemono text-xs font-medium text-white/70'>{pairName.toUpperCase()}</div>
                </div>

                {/* Boxes Container */}
                <div className='flex flex-1 gap-[2px]'>
                    {sortedBoxes.map((box, index) => {
                        const baseColor = box.value > 0 ? boxColors.positive : boxColors.negative;

                        return (
                            <div
                                key={`box-${index}`}
                                className='flex flex-1'
                                style={{
                                    height: BOX_HEIGHT,
                                    backgroundColor: 'transparent',
                                    border: `1px solid ${baseColor}`,
                                    background: baseColor.replace('1)', '0.15)'),
                                    marginRight: index < sortedBoxes.length - 1 ? BOX_GAP : 0,
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
