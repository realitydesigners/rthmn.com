'use client';

import { useDashboard } from '@/providers/DashboardProvider/client';
import { PairResoBox } from './PairResoBox';

export default function AdminPage() {
    const { selectedPairs, pairData, boxColors } = useDashboard();

    return (
        <div className='flex flex-col gap-4 p-4 pt-20'>
            {selectedPairs.map((pair) => (
                <PairResoBox
                    key={pair}
                    pair={pair}
                    boxSlice={pairData?.[pair]?.boxes?.[0]}
                    currentOHLC={pairData?.[pair]?.currentOHLC}
                    boxColors={boxColors}
                    initialBoxData={pairData?.[pair]?.initialBoxData}
                />
            ))}
        </div>
    );
}
