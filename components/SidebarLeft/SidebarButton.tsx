'use client';
import { IconType } from 'react-icons';
import { cn } from '@/utils/cn';
import { FeatureTour } from '@/components/FeatureTour';
import { useTourStore } from '@/utils/tourStore';
import { usePathname } from 'next/navigation';

export function SidebarButton({
    icon: Icon,
    onClick,
    isActive,
    tourId,
    tourContent,
}: {
    icon: IconType;
    onClick: () => void;
    isActive: boolean;
    tourId: string;
    tourContent: { title: string; description: string; items?: string[] };
}) {
    const { currentTourId, completedTours, completeTour, getNextTour } = useTourStore();
    const isCurrentTour = currentTourId === tourId;
    const isCompleted = completedTours.includes(tourId);
    const pathname = usePathname();
    const isOnboarding = pathname?.includes('/onboarding');

    const handleComplete = () => {
        completeTour(tourId);
    };

    return (
        <FeatureTour
            featureId={tourId}
            tooltipContent={
                <div>
                    <h3 className='mb-2 font-bold text-white'>{tourContent.title}</h3>
                    <p>{tourContent.description}</p>
                    {tourContent.items && (
                        <ul className='mt-2 list-inside list-disc space-y-1 text-gray-400'>
                            {tourContent.items.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    )}
                </div>
            }
            isActive={isCurrentTour && !isOnboarding}
            onComplete={handleComplete}
            tooltipClassName='fixed left-20 top-18'>
            {({ isActive: tourActive, hasCompleted }) => (
                <button
                    onClick={onClick}
                    disabled={isOnboarding || (currentTourId && !isCurrentTour && !isCompleted)}
                    className={cn(
                        'group relative z-[120] flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200',
                        'border border-transparent bg-transparent',
                        'hover:border-[#333] hover:bg-gradient-to-b hover:from-[#181818] hover:to-[#0F0F0F] hover:shadow-lg hover:shadow-black/20',
                        isActive && 'text-white hover:border-[#444] hover:from-[#1c1c1c] hover:to-[#141414]',
                        tourActive && !hasCompleted && 'shadow-[inset_0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[inset_0_0_50px_rgba(96,165,250,0.5)]',
                        (isOnboarding || (currentTourId && !isCurrentTour && !isCompleted)) && 'opacity-50'
                    )}>
                    <Icon
                        size={20}
                        className={cn(
                            'transition-colors',
                            tourActive && !hasCompleted ? 'text-blue-500/70 group-hover:text-blue-400/90' : 'text-[#818181] group-hover:text-white',
                            (isOnboarding || (currentTourId && !isCurrentTour && !isCompleted)) && 'text-white'
                        )}
                    />
                </button>
            )}
        </FeatureTour>
    );
}
