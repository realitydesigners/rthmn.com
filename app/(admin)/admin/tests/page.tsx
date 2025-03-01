'use client';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { useUser } from '@/providers/UserProvider';
import { BoxValidationSummary } from '../BoxValidationSummary';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { useState, useEffect } from 'react';

export default function TestsPage() {
    const { pairData } = useDashboard();
    const [mounted, setMounted] = useState(false);
    const { selectedPairs } = useUser();
    const { isConnected } = useWebSocket();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className='group relative flex w-full flex-col' />;
    }

    return (
        <div className='flex flex-col p-4 pt-20'>
            <div className='mx-auto max-w-3xl'>{isConnected && <BoxValidationSummary pairs={selectedPairs} pairData={pairData} />}</div>
        </div>
    );
}
