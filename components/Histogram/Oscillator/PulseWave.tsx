import { COLORS } from '../Colors';

export const PulseWave: React.FC<{
    meetingPoints: { x: number; y: number }[];
    colors: typeof COLORS.GREEN | typeof COLORS.RED | typeof COLORS.NEUTRAL;
    height: number;
    sliceWidth: number;
    isGreen: boolean;
}> = ({ meetingPoints, colors, height, sliceWidth, isGreen }) => {
    const pathData = meetingPoints.reduce((acc, point, index, array) => {
        if (index === 0) {
            return `M ${point.x} ${isGreen ? 0 : height} L ${point.x} ${point.y}`;
        }
        const prevPoint = array[index - 1];
        const midX = (prevPoint.x + point.x) / 2;
        return `${acc} 
      L ${midX} ${prevPoint.y} 
      L ${midX} ${point.y} 
      L ${point.x} ${point.y}`;
    }, '');

    const gradientId = isGreen ? 'pulseGradientGreen' : 'pulseGradientRed';

    return (
        <g>
            <defs>
                <linearGradient id={gradientId} x1='0%' y1={isGreen ? '100%' : '0%'} x2='0%' y2={isGreen ? '0%' : '100%'}>
                    <stop offset='0%' stopColor={colors.LIGHT} stopOpacity='0.7' />
                    <stop offset='100%' stopColor={colors.LIGHT} stopOpacity='0' />
                </linearGradient>
            </defs>
            <path d={`${pathData} L ${sliceWidth} ${isGreen ? 0 : height} Z`} fill={`url(#${gradientId})`} stroke='none'>
                <animate attributeName='opacity' values='0.7;0.3;0.7' dur='8s' repeatCount='indefinite' />
            </path>
        </g>
    );
};
