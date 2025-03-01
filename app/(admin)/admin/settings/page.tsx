'use client';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className='group relative flex w-full flex-col' />;
    }

    return (
        <div className='flex flex-col p-4 pt-20'>
            <div className='mx-auto w-full max-w-3xl'>
                <div className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-4'>
                    <h2 className='mb-4 text-lg font-medium text-zinc-200'>Settings</h2>
                    <div className='space-y-4'>
                        {/* Add settings sections here */}
                        <p className='text-sm text-zinc-400'>Settings coming soon...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
