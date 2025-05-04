import { cn } from '@/utils/cn';
import type React from 'react';
import { LuBox, LuBoxes, LuLineChart, LuLock } from 'react-icons/lu';
import { useColorStore } from '@/stores/colorStore';

export const CHART_STYLES = {
    box: {
        id: 'box',
        title: 'Box',
        icon: LuBox,
        locked: false,
        isActive: true,
        description: 'Classic box visualization',
    },
    line: {
        id: 'line',
        title: 'Line',
        icon: LuLineChart,
        locked: true,
        isActive: false,
        description: 'Traditional line chart view',
        comingSoon: true,
    },
    threeD: {
        id: '3d',
        title: '3D',
        icon: LuBoxes,
        locked: false,
        isActive: false,
        description: '3D visualization of boxes',
    },
} as const;

interface IconProps {
    size: number;
    className?: string;
}

interface ChartStyleOptionProps {
    id: string;
    title: string;
    icon: React.ComponentType<IconProps>;
    locked: boolean;
    isActive: boolean;
    description: string;
    onClick?: () => void;
}

const ChartStyleOption: React.FC<ChartStyleOptionProps> = ({ title, icon: Icon, locked, isActive, onClick }) => {
    return (
        <button
            type='button'
            onClick={locked ? undefined : onClick}
            className={cn(
                'group relative flex h-[72px] flex-col items-center justify-center gap-2 rounded-lg border bg-gradient-to-b p-2 transition-all duration-200',
                isActive
                    ? 'border-[#333] from-[#181818]/80 to-[#0F0F0F]/90 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-[#444] hover:from-[#1c1c1c]/80 hover:to-[#141414]/90'
                    : 'border-[#222] from-[#141414]/30 to-[#0A0A0A]/40 hover:border-[#333] hover:from-[#181818]/40 hover:to-[#0F0F0F]/50',
                locked ? 'pointer-events-none opacity-90' : 'cursor-pointer'
            )}
        >
            {/* Background glow effect */}
            {isActive && !locked && (
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_50%)]' />
            )}

            {/* Diagonal stripes for locked state */}
            {locked && (
                <>
                    {/* Base dark stripes */}
                    <div
                        className='absolute inset-0 opacity-[0.06]'
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                                135deg,
                                #000,
                                #000 1px,
                                transparent 1.5px,
                                transparent 6px
                            )`,
                        }}
                    />
                    {/* Secondary dark stripes */}
                    <div
                        className='absolute inset-0 opacity-[0.04]'
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                                45deg,
                                #000,
                                #000 1px,
                                transparent 1.5px,
                                transparent 6px
                            )`,
                        }}
                    />
                    {/* Subtle light stripes */}
                    <div
                        className='absolute inset-0 opacity-[0.015]'
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                                135deg,
                                #fff,
                                #fff 1px,
                                transparent 1.5px,
                                transparent 6px
                            )`,
                        }}
                    />
                    {/* Overlay gradient for depth */}
                    <div className='absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/5' />
                </>
            )}

            {/* Lock icon */}
            {locked && (
                <div className='pointer-events-none absolute -top-1 -right-1 flex items-center'>
                    <div className='flex h-5 items-center gap-1'>
                        <div className='flex h-5 w-5 items-center justify-center rounded-full border border-[#333] bg-gradient-to-b from-black/90 to-black/95 shadow-[0_2px_4px_rgba(0,0,0,0.4)] backdrop-blur-[1px]'>
                            <LuLock className='h-2.5 w-2.5 text-white/80' />
                        </div>
                    </div>
                </div>
            )}

            {/* Icon container with glow effect */}
            <div
                className={cn(
                    'relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b transition-all duration-300',
                    locked
                        ? 'from-[#181818]/70 to-[#0F0F0F]/70 shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
                        : isActive
                          ? 'from-[#222] to-[#111] shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
                          : 'from-[#181818] to-[#0F0F0F] shadow-[0_4px_12px_rgba(0,0,0,0.3)] group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
                )}
            >
                {/* Icon inner glow */}
                {!locked && isActive && (
                    <div className='absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]' />
                )}
                <Icon
                    size={20}
                    className={cn(
                        'relative transition-all duration-300',
                        isActive ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]' : 'text-[#666]',
                        locked ? 'text-[#666] opacity-40' : 'group-hover:scale-110 group-hover:text-white'
                    )}
                />
            </div>

            {/* Title */}
            <span
                className={cn(
                    'font-kodemono text-[8px] font-medium tracking-widest uppercase transition-all duration-300',
                    locked ? 'text-[#666]/40' : isActive ? 'text-[#999]' : 'text-[#666] group-hover:text-[#818181]'
                )}
            >
                {title}
            </span>
        </button>
    );
};

interface ChartStyleOptionsContainerProps {
    className?: string;
    noContainer?: boolean;
}

export const ChartStyleOptions: React.FC<ChartStyleOptionsContainerProps> = ({
    className = '',
    noContainer = false,
}) => {
    const { boxColors, updateStyles } = useColorStore();
    const currentViewMode = boxColors.styles?.viewMode || 'default';

    const content = (
        <>
            <ChartStyleOption
                {...CHART_STYLES.box}
                isActive={currentViewMode === 'default'}
                onClick={() => updateStyles({ viewMode: 'default' })}
            />
            <ChartStyleOption
                {...CHART_STYLES.threeD}
                isActive={currentViewMode === '3d'}
                onClick={() => updateStyles({ viewMode: '3d' })}
            />
            <ChartStyleOption
                {...CHART_STYLES.line}
                isActive={currentViewMode === 'line'}
                onClick={() => updateStyles({ viewMode: 'line' })}
            />
        </>
    );

    if (noContainer) {
        return <div className={cn('grid grid-cols-3 gap-2', className)}>{content}</div>;
    }

    return (
        <div className={cn('flex gap-4 rounded-lg border border-neutral-700/50 bg-neutral-800/40 p-4', className)}>
            {content}
        </div>
    );
};
