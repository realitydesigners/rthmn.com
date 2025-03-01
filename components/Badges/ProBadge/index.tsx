import React from 'react';
import { useColorStore } from '@/stores/colorStore';

interface ProBadgeProps {
    className?: string;
}

export const ProBadge: React.FC<ProBadgeProps> = ({ className = '' }) => {
    const { boxColors } = useColorStore();
    const positiveColor = boxColors.positive;
    const negativeColor = boxColors.negative;

    return (
        <div className={`inline-flex ${className}`}>
            <div className='ml-2.5 flex items-center'>
                <div
                    className='rounded-md p-[1px] shadow-sm'
                    style={{
                        background: `linear-gradient(135deg, ${positiveColor}, ${negativeColor})`,
                    }}>
                    <div className='flex items-center justify-center rounded-sm bg-black px-[4px] py-[1px]'>
                        <span className='text-[8px] font-bold tracking-wide uppercase' style={{ color: positiveColor }}>
                            PRO
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
