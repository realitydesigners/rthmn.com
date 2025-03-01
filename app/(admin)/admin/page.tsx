'use client';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { useUser } from '@/providers/UserProvider';
import { PairResoBox } from './PairResoBox';
import { useState, useEffect } from 'react';

export default function AdminPage() {
    const { pairData } = useDashboard();
    const [mounted, setMounted] = useState(false);
    const { selectedPairs, boxColors } = useUser();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className='group relative flex w-full flex-col' />;
    }

    return (
        <div className='flex flex-col p-4 pt-20'>
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
