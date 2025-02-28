'use client';

import { TeamCard } from '@/app/(public)/_components/blocks/TeamCard';

export interface TeamGridBlockProps {
    _type: 'teamGrid';
    _key: string;
    layout?: 'contained' | 'wide' | 'fullWidth';
}

export function TeamGridBlock({ layout = 'fullWidth' }: TeamGridBlockProps) {
    console.log('TeamGrid block with layout:', layout);

    return (
        <div className={`team-grid py-16 ${layout === 'contained' ? 'container mx-auto px-4' : layout === 'wide' ? 'container-wide mx-auto px-4' : 'w-full xl:px-32'}`}>
            <div className='flex w-full flex-col'>
                <h2 className='font-outfit mb-12 text-center text-5xl font-bold'>Our Team</h2>
                <TeamCard />
            </div>
        </div>
    );
}
