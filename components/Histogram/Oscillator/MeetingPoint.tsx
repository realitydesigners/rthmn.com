import { COLORS } from '../Colors';

export const MeetingPoint: React.FC<{
    prevMeetingPointY: number | null;
    nextMeetingPointY: number | null;
    meetingPointY: number;
    sliceWidth: number;
    colors: typeof COLORS.GREEN | typeof COLORS.RED | typeof COLORS.NEUTRAL;
}> = ({ prevMeetingPointY, nextMeetingPointY, meetingPointY, sliceWidth, colors }) => {
    const cornerRadius = sliceWidth / 8; // Adjust this value to control the roundness of corners

    return (
        <>
            {prevMeetingPointY !== null && (
                <path
                    d={`M ${-sliceWidth / 2} ${prevMeetingPointY} 
                        H ${-cornerRadius}
                        Q 0 ${prevMeetingPointY}, 0 ${prevMeetingPointY + Math.sign(meetingPointY - prevMeetingPointY) * cornerRadius}
                        V ${meetingPointY - Math.sign(meetingPointY - prevMeetingPointY) * cornerRadius}
                        Q 0 ${meetingPointY}, ${cornerRadius} ${meetingPointY}
                        H ${sliceWidth / 2}`}
                    fill='none'
                    stroke={colors.LIGHT}
                    strokeWidth='3'
                    className='transition-all duration-200 ease-in-out'>
                    <animate attributeName='stroke-dashoffset' from='0' to='20' dur='20s' repeatCount='indefinite' />
                </path>
            )}
            {nextMeetingPointY !== null ? (
                <path
                    d={`M ${sliceWidth / 2} ${meetingPointY} 
                        H ${sliceWidth - cornerRadius}
                        Q ${sliceWidth} ${meetingPointY}, ${sliceWidth} ${meetingPointY + Math.sign(nextMeetingPointY - meetingPointY) * cornerRadius}
                        V ${nextMeetingPointY - Math.sign(nextMeetingPointY - meetingPointY) * cornerRadius}
                        Q ${sliceWidth} ${nextMeetingPointY}, ${sliceWidth + cornerRadius} ${nextMeetingPointY}
                        H ${sliceWidth * 1.5}`}
                    fill='none'
                    stroke={colors.LIGHT}
                    strokeWidth='3'
                    className='transition-all duration-200 ease-in-out'>
                    <animate attributeName='stroke-dashoffset' from='0' to='20' dur='20s' repeatCount='indefinite' />
                </path>
            ) : (
                <circle cx={sliceWidth / 2} cy={meetingPointY} r='4' fill={colors.LIGHT}>
                    <animate attributeName='r' values='3;5;3' dur='2s' repeatCount='indefinite' />
                </circle>
            )}
        </>
    );
};
