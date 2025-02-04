'use client';

import { useDashboard } from '@/providers/DashboardProvider/client';
import { PairResoBox } from './PairResoBox';

const boxColors = {
    positive: '#00ff00',
    negative: '#ff0000',
    styles: {
        startIndex: 0,
        maxBoxCount: 38,
        showLineChart: false,
        globalTimeframeControl: false,
        borderRadius: 0,
        shadowIntensity: 0.5,
        opacity: 0.5,
        showBorder: true,
    },
} as const;

export default function AdminPage() {
    const { selectedPairs, pairData, boxColors, isLoading, fetchBoxSlice } = useDashboard();

    return (
        <div className='flex flex-col gap-4 p-4 pt-20'>
            {selectedPairs.map((pair) => (
                <PairResoBox
                    key={pair}
                    pair={pair}
                    boxSlice={pairData?.[pair]?.boxes?.[0]}
                    currentOHLC={pairData?.[pair]?.currentOHLC}
                    boxColors={boxColors}
                    isLoading={isLoading}
                    pairData={pairData}
                    fetchBoxSlice={fetchBoxSlice}
                />
            ))}
        </div>
    );
}
