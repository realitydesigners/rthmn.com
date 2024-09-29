import React, {
  useMemo,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle
} from 'react';
import type { Box } from '@/types';

const COLORS = {
  GREEN: {
    DARK: '#001a1a',
    MEDIUM: '#000',
    LIGHT: '#22FFE7',
    DOT: '#032C2C',
    GRID: '#147571'
  },
  RED: {
    DARK: '#1a0000',
    MEDIUM: '#000',
    LIGHT: '#FF6E86',
    DOT: '#330303',
    GRID: '#8B1935'
  },
  NEUTRAL: {
    DARK: '#1a1a1a',
    MEDIUM: '#333333',
    LIGHT: '#888888',
    DOT: '#888888',
    GRID: '#444444'
  }
};

interface OscillatorProps {
  boxArray: Box[];
  height: number;
  visibleBoxesCount: number;
  meetingPointY: number;
  prevMeetingPointY: number | null;
  nextMeetingPointY: number | null;
  sliceWidth: number;
}

export interface OscillatorRef {
  getColorAndY: (x: number) => { y: number; color: string };
  meetingPoints: { x: number; y: number }[];
  sliceWidth: number;
  visibleBoxesCount: number;
}

const PulseWave: React.FC<{
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
        <linearGradient
          id={gradientId}
          x1="0%"
          y1={isGreen ? '100%' : '0%'}
          x2="0%"
          y2={isGreen ? '0%' : '100%'}
        >
          <stop offset="0%" stopColor={colors.LIGHT} stopOpacity="0.7" />
          <stop offset="100%" stopColor={colors.LIGHT} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${pathData} L ${sliceWidth} ${isGreen ? 0 : height} Z`}
        fill={`url(#${gradientId})`}
        stroke="none"
      >
        <animate
          attributeName="opacity"
          values="0.7;0.3;0.7"
          dur="8s"
          repeatCount="indefinite"
        />
      </path>
    </g>
  );
};

export const Oscillator = forwardRef<OscillatorRef, OscillatorProps>(
  (
    {
      boxArray,
      height,
      visibleBoxesCount,
      meetingPointY,
      prevMeetingPointY,
      nextMeetingPointY,
      sliceWidth
    },
    ref
  ) => {
    const boxHeight = height / visibleBoxesCount;
    const sortedBoxes = boxArray.slice(0, visibleBoxesCount);

    const sectionColor = useMemo(() => {
      if (sortedBoxes.length === 0) return 'NEUTRAL';
      const largestBox = sortedBoxes.reduce((max, box) =>
        Math.abs(box.value) > Math.abs(max.value) ? box : max
      );
      return largestBox.value > 0 ? 'GREEN' : 'RED';
    }, [sortedBoxes]);

    const colors = COLORS[sectionColor as keyof typeof COLORS];
    const isGreen = sectionColor === 'GREEN';

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const meetingPoints = useMemo(() => {
      return [
        { x: -sliceWidth / 2, y: prevMeetingPointY ?? meetingPointY },
        { x: 0, y: prevMeetingPointY ?? meetingPointY },
        { x: 0, y: meetingPointY },
        { x: sliceWidth / 2, y: meetingPointY },
        { x: sliceWidth, y: meetingPointY },
        { x: sliceWidth, y: nextMeetingPointY ?? meetingPointY },
        { x: sliceWidth * 1.5, y: nextMeetingPointY ?? meetingPointY }
      ];
    }, [prevMeetingPointY, meetingPointY, nextMeetingPointY, sliceWidth]);

    const interpolateY = (x: number) => {
      for (let i = 0; i < meetingPoints.length - 1; i++) {
        const start = meetingPoints[i];
        const end = meetingPoints[i + 1];
        if (x >= start.x && x <= end.x) {
          const t = (x - start.x) / (end.x - start.x);
          return start.y + t * (end.y - start.y);
        }
      }
      return meetingPointY;
    };

    const getColorAndY = (x: number) => {
      const y = interpolateY(x);
      return { y: Math.round(y), color: colors.LIGHT };
    };

    useImperativeHandle(ref, () => ({
      getColorAndY,
      meetingPoints,
      sliceWidth,
      visibleBoxesCount
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const drawCanvas = () => {
        ctx.clearRect(0, 0, sliceWidth, height);

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, colors.DARK);
        gradient.addColorStop(1, colors.MEDIUM);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, sliceWidth, height);

        ctx.beginPath();
        for (let i = 0; i <= visibleBoxesCount; i++) {
          const y = Math.round(i * boxHeight);
          ctx.moveTo(0, y);
          ctx.lineTo(sliceWidth, y);
        }
        ctx.strokeStyle = colors.GRID;

        ctx.stroke();

        sortedBoxes.forEach((box, index) => {
          const y = Math.round(index * boxHeight);

          ctx.beginPath();
          ctx.rect(0, y, sliceWidth, boxHeight);
          ctx.strokeStyle = colors.GRID;
          ctx.lineWidth = 0.3;
          ctx.stroke();

          const rangeHeight =
            ((box.high - box.low) / (box.high + Math.abs(box.low))) * boxHeight;
          const rangeY = Math.round(
            box.value > 0 ? y + boxHeight - rangeHeight : y
          );
          ctx.fillStyle = colors.MEDIUM;
          ctx.fillRect(
            sliceWidth * 0.25,
            rangeY,
            sliceWidth * 0.5,
            rangeHeight
          );

          const centerX = sliceWidth / 2;
          const centerY = Math.round(y + boxHeight / 2);
          ctx.beginPath();
          ctx.arc(centerX, centerY, 1, 0, 2 * Math.PI);
          ctx.fillStyle = colors.DOT;
          ctx.fill();
        });
      };

      drawCanvas();
    }, [
      boxArray,
      height,
      sliceWidth,
      boxHeight,
      colors,
      visibleBoxesCount,
      sortedBoxes,
      meetingPoints
    ]);

    return (
      <div
        className="relative overflow-hidden"
        style={{
          width: sliceWidth,
          height: `${height}px`
        }}
      >
        <canvas
          ref={canvasRef}
          width={sliceWidth}
          height={height}
          className="absolute inset-0"
        />

        <svg
          className="pointer-events-none absolute left-0 top-0 h-full w-full"
          style={{ zIndex: 200, overflow: 'visible' }}
        >
          <PulseWave
            meetingPoints={meetingPoints}
            colors={colors}
            height={height}
            sliceWidth={sliceWidth}
            isGreen={isGreen}
          />
          {prevMeetingPointY !== null && (
            <path
              d={`M ${-sliceWidth / 2} ${prevMeetingPointY} 
                H 0 
                V ${meetingPointY} 
                H ${sliceWidth / 2}`}
              fill="none"
              stroke={colors.LIGHT}
              strokeWidth="3"
              className="transition-all duration-100 ease-in-out"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="20"
                dur="20s"
                repeatCount="indefinite"
              />
            </path>
          )}
          {nextMeetingPointY !== null && (
            <path
              d={`M ${sliceWidth / 2} ${meetingPointY} 
                H ${sliceWidth} 
                V ${nextMeetingPointY} 
                H ${sliceWidth * 1.5}`}
              fill="none"
              stroke={colors.LIGHT}
              strokeWidth="3"
              className="transition-all duration-100 ease-in-out"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="20"
                dur="20s"
                repeatCount="indefinite"
              />
            </path>
          )}
        </svg>
      </div>
    );
  }
);
