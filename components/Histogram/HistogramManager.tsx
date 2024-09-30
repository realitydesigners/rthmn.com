'use client';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle
} from 'react';
import HistogramControls from './HistogramControls';
import SelectedFrameDetails from './SelectedFrameDetails';
import { ScaledBoxes } from './charts/ScaledBoxes';
import { SquareBoxes } from './charts/SquareBoxes';
import type { BoxSlice, ViewType, Box } from '@/types';

const ZOOMED_BAR_WIDTH = 0;
const INITIAL_BAR_WIDTH = 70;

interface HistogramManagerProps {
  data: BoxSlice[];
  height: number;
  onResize: (newHeight: number) => void;
  boxOffset: number;
  onOffsetChange: (newOffset: number) => void;
  visibleBoxesCount: number;
  viewType: ViewType;
  onViewChange: (newViewType: ViewType) => void;
  selectedFrame: BoxSlice | null;
  selectedFrameIndex: number | null;
  onFrameSelect: (frame: BoxSlice | null, index: number | null) => void;
  isDragging: boolean;
  onDragStart: (e: React.MouseEvent) => void;
}

const useHistogramData = (
  data: BoxSlice[],
  selectedFrame: BoxSlice | null,
  selectedFrameIndex: number | null,
  boxOffset: number,
  visibleBoxesCount: number,
  height: number
) => {
  const currentFrame = useMemo(() => {
    return selectedFrame || (data.length > 0 ? data[0] : null);
  }, [selectedFrame, data]);

  const visibleBoxes = useMemo(() => {
    if (!currentFrame) return [];
    const totalBoxes = currentFrame.boxes.length;
    const start = Math.max(0, boxOffset);
    const end = Math.min(totalBoxes, boxOffset + visibleBoxesCount);
    return currentFrame.boxes.slice(start, end);
  }, [currentFrame, boxOffset, visibleBoxesCount]);

  const maxSize = useMemo(() => {
    const sizes = data.flatMap((slice) =>
      slice.boxes.map((box) => Math.abs(box.value))
    );
    return sizes.reduce((max, size) => Math.max(max, size), 0);
  }, [data]);

  const framesWithPoints = useMemo(() => {
    const boxHeight = height / visibleBoxesCount;
    return data.map((slice, index) => {
      const isSelected = index === selectedFrameIndex;
      const totalBoxes = slice.boxes.length;
      const start = Math.max(0, boxOffset);
      const end = Math.min(totalBoxes, boxOffset + visibleBoxesCount);
      const visibleBoxes = slice.boxes.slice(start, end);
      const positiveBoxesCount = visibleBoxes.filter(
        (box) => box.value > 0
      ).length;
      const negativeBoxesCount = visibleBoxesCount - positiveBoxesCount;

      const totalNegativeHeight = negativeBoxesCount * boxHeight;
      const meetingPointY =
        totalNegativeHeight +
        (height - totalNegativeHeight - positiveBoxesCount * boxHeight) / 2;

      // Find the smallest box based on absolute value
      const smallestBox = visibleBoxes.reduce((smallest, current) =>
        Math.abs(current.value) < Math.abs(smallest.value) ? current : smallest
      );

      // Calculate price based on the smallest box
      const price = smallestBox.value >= 0 ? smallestBox.high : smallestBox.low;

      // Calculate high and low from visible boxes
      const high = Math.max(...visibleBoxes.map((box) => box.high));
      const low = Math.min(...visibleBoxes.map((box) => box.low));

      return {
        frameData: {
          boxArray: slice.boxes,
          isSelected,
          meetingPointY,
          sliceWidth: isSelected ? ZOOMED_BAR_WIDTH : INITIAL_BAR_WIDTH,
          price,
          high,
          low
        },
        meetingPointY,
        sliceWidth: isSelected ? ZOOMED_BAR_WIDTH : INITIAL_BAR_WIDTH
      };
    });
  }, [data, selectedFrameIndex, height, boxOffset, visibleBoxesCount]);

  return { currentFrame, visibleBoxes, maxSize, framesWithPoints };
};

const DraggableBorder: React.FC<{
  isDragging: boolean;
  onDragStart: (e: React.MouseEvent) => void;
}> = React.memo(({ isDragging, onDragStart }) => (
  <div
    className={`absolute left-0 right-0 top-0 z-10 h-[1px] cursor-ns-resize rounded-full bg-[#181818] transition-all duration-200 hover:bg-blue-400 ${
      isDragging
        ? 'shadow-2xl shadow-blue-500'
        : 'hover:h-[3px] hover:shadow-2xl hover:shadow-blue-500'
    }`}
    onMouseDown={onDragStart}
  />
));

// Update the HoverInfo type
type HoverInfo = {
  x: number;
  y: number;
  color: string;
  high: number;
  low: number;
  price: number;
} | null;

const HistogramChart: React.FC<{
  data: BoxSlice[];
  framesWithPoints: ReturnType<typeof useHistogramData>['framesWithPoints'];
  height: number;
  onFrameSelect: HistogramManagerProps['onFrameSelect'];
  renderNestedBoxes: (
    boxArray: BoxSlice['boxes'],
    isSelected: boolean,
    meetingPointY: number,
    prevMeetingPointY: number | null,
    nextMeetingPointY: number | null,
    sliceWidth: number,
    index: number,
    price: number,
    high: number,
    low: number
  ) => JSX.Element | null;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
  hoverInfo: HoverInfo | null;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onScroll: () => void;
}> = React.memo(
  ({
    data,
    framesWithPoints,
    height,
    onFrameSelect,
    renderNestedBoxes,
    onMouseMove,
    onMouseLeave,
    hoverInfo,
    scrollContainerRef,
    onScroll
  }) => (
    <div
      className="relative h-full w-full pr-16"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div
        ref={scrollContainerRef}
        className="hide-scrollbar flex h-full w-full items-end overflow-x-auto"
        role="region"
        aria-label="Histogram Chart"
        onScroll={onScroll}
      >
        <div
          style={{
            display: 'inline-flex',
            width: `${data.length * INITIAL_BAR_WIDTH}px`,
            height: '100%',
            flexDirection: 'row'
          }}
        >
          {framesWithPoints.map((frameWithPoint, index) => {
            const { frameData, meetingPointY, sliceWidth } = frameWithPoint;
            const prevMeetingPointY =
              index > 0 ? framesWithPoints[index - 1].meetingPointY : null;
            const nextMeetingPointY =
              index < framesWithPoints.length - 1
                ? framesWithPoints[index + 1].meetingPointY
                : null;

            return (
              <div
                key={`${index}`}
                className="relative flex-shrink-0 cursor-pointer"
                style={{
                  width: sliceWidth,
                  height: `${height}px`,
                  position: 'relative'
                }}
                onClick={() => onFrameSelect(data[index], index)}
              >
                {renderNestedBoxes(
                  frameData.boxArray,
                  frameData.isSelected,
                  meetingPointY,
                  prevMeetingPointY,
                  nextMeetingPointY,
                  sliceWidth,
                  index,
                  frameData.price,
                  frameData.high,
                  frameData.low
                )}
              </div>
            );
          })}
        </div>
      </div>
      {hoverInfo && (
        <>
          <div
            className="pointer-events-none absolute -bottom-2 top-0"
            style={{
              left: `${hoverInfo.x}px`,
              width: '1px',
              background: hoverInfo.color,
              boxShadow: `0 0 5px ${hoverInfo.color}`,
              zIndex: 1000
            }}
          />
          <div
            className="pointer-events-none absolute h-3 w-3 rounded-full"
            style={{
              left: `${hoverInfo.x}px`,
              top: `${hoverInfo.y}px`,
              transform: 'translate(-50%, -50%)',
              background: hoverInfo.color,
              boxShadow: `0 0 5px ${hoverInfo.color}`,
              zIndex: 1001
            }}
          />
          <HoverInfo {...hoverInfo} />
        </>
      )}
    </div>
  )
);

const formatTime = (date: Date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${minutes}:${seconds}\u00A0${ampm}`;
};

const TimeBar: React.FC<{
  data: BoxSlice[];
  scrollLeft: number;
  width: number;
  visibleBoxesCount: number;
  boxOffset: number;
}> = React.memo(({ data, scrollLeft, width, visibleBoxesCount, boxOffset }) => {
  const significantTimeIndexes = useMemo(() => {
    const indexes: number[] = [];
    let previousColor: 'green' | 'red' | null = null;

    data.forEach((slice, index) => {
      const totalBoxes = slice.boxes.length;
      const start = Math.max(0, boxOffset);
      const end = Math.min(totalBoxes, boxOffset + visibleBoxesCount);
      const visibleBoxes = slice.boxes.slice(start, end);
      const largestBox = visibleBoxes.reduce((max, box) =>
        Math.abs(box.value) > Math.abs(max.value) ? box : max
      );
      const currentColor = largestBox.value > 0 ? 'green' : 'red';

      if (currentColor !== previousColor) {
        indexes.push(index);
        previousColor = currentColor;
      }
    });

    return indexes;
  }, [data, boxOffset, visibleBoxesCount]);

  return (
    <div
      className="relative h-10 w-full overflow-hidden bg-black"
      style={{ width: `${width}px` }}
    >
      <div
        className="absolute flex h-full w-full items-center"
        style={{
          width: `${data.length * INITIAL_BAR_WIDTH}px`,
          transform: `translateX(-${scrollLeft}px)`
        }}
      >
        {significantTimeIndexes.map((index) => {
          const slice = data[index];
          const localTime = new Date(slice.timestamp);
          const totalBoxes = slice.boxes.length;
          const start = Math.max(0, boxOffset);
          const end = Math.min(totalBoxes, boxOffset + visibleBoxesCount);
          const visibleBoxes = slice.boxes.slice(start, end);
          const largestBox = visibleBoxes.reduce((max, box) =>
            Math.abs(box.value) > Math.abs(max.value) ? box : max
          );
          const color = largestBox.value > 0 ? '#22FFE7' : '#FF6E86';
          return (
            <div
              key={index}
              className="absolute flex-shrink-0 whitespace-nowrap text-center text-[11px]"
              style={{
                left: `${index * INITIAL_BAR_WIDTH}px`,
                width: `${INITIAL_BAR_WIDTH}px`,
                color: color
              }}
            >
              {formatTime(localTime)}
            </div>
          );
        })}
      </div>
    </div>
  );
});

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
  price: number;
  high: number;
  low: number;
}

export interface OscillatorRef {
  getColorAndY: (x: number) => {
    y: number;
    color: string;
    high: number;
    low: number;
    price: number;
  };
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

const Oscillator = forwardRef<OscillatorRef, OscillatorProps>(
  (
    {
      boxArray,
      height,
      visibleBoxesCount,
      meetingPointY,
      prevMeetingPointY,
      nextMeetingPointY,
      sliceWidth,
      price,
      high,
      low
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

    const smallestBox = useMemo(() => {
      return sortedBoxes.reduce((smallest, current) =>
        Math.abs(current.value) < Math.abs(smallest.value) ? current : smallest
      );
    }, [sortedBoxes]);

    const getColorAndY = (x: number) => {
      const y = interpolateY(x);
      return {
        y: Math.round(y),
        color: colors.LIGHT,
        high,
        low,
        price
      };
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
              className="transition-all duration-200 ease-in-out"
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
              className="transition-all duration-200 ease-in-out"
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
          {nextMeetingPointY === null && (
            <circle
              cx={sliceWidth / 2}
              cy={meetingPointY}
              r="4"
              fill={colors.LIGHT}
            >
              <animate
                attributeName="r"
                values="3;5;3"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </svg>
      </div>
    );
  }
);

// Update the HoverInfo component
const HoverInfo: React.FC<NonNullable<HoverInfo>> = ({
  x,
  y,
  color,
  price,
  high,
  low
}) => (
  <div
    className="pointer-events-none absolute z-50"
    style={{
      left: `${x}px`,
      top: `${y}px`,
      transform: 'translate(-50%, -100%)'
    }}
  >
    <div
      className="rounded px-2 py-1 text-xs"
      style={{ backgroundColor: color, color: '#000' }}
    >
      <div>Price: {price.toFixed(3)}</div>
      <div>High: {high.toFixed(3)}</div>
      <div>Low: {low.toFixed(3)}</div>
    </div>
  </div>
);

const HistogramManager: React.FC<HistogramManagerProps> = ({
  data,
  height,
  onResize,
  boxOffset,
  onOffsetChange,
  visibleBoxesCount,
  viewType,
  onViewChange,
  selectedFrame,
  selectedFrameIndex,
  onFrameSelect,
  isDragging,
  onDragStart
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  const { currentFrame, visibleBoxes, maxSize, framesWithPoints } =
    useHistogramData(
      data,
      selectedFrame,
      selectedFrameIndex,
      boxOffset,
      visibleBoxesCount,
      height
    );

  const oscillatorRefs = useRef<(OscillatorRef | null)[]>([]);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>(null);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      setScrollLeft(scrollContainerRef.current.scrollLeft);
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollLeft;
      const frameIndex = Math.floor(x / INITIAL_BAR_WIDTH);
      const frameX = x % INITIAL_BAR_WIDTH;

      if (frameIndex >= 0 && frameIndex < framesWithPoints.length) {
        const oscillator = oscillatorRefs.current[frameIndex];
        if (oscillator) {
          const { y, color, high, low, price } =
            oscillator.getColorAndY(frameX);
          setHoverInfo({
            x: frameIndex * INITIAL_BAR_WIDTH + frameX - scrollLeft,
            y,
            color,
            high,
            low,
            price
          });
        }
      }
    },
    [framesWithPoints, scrollLeft]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverInfo(null);
  }, []);

  const renderNestedBoxes = useCallback(
    (
      boxArray: BoxSlice['boxes'],
      isSelected: boolean,
      meetingPointY: number,
      prevMeetingPointY: number | null,
      nextMeetingPointY: number | null,
      sliceWidth: number,
      index: number,
      price: number,
      high: number,
      low: number
    ): JSX.Element | null => {
      const totalBoxes = boxArray.length;
      const start = boxOffset;
      const end = Math.min(totalBoxes, boxOffset + visibleBoxesCount);
      const visibleBoxArray = boxArray.slice(start, end);
      switch (viewType) {
        case 'scaled':
          return (
            <ScaledBoxes
              boxArray={visibleBoxArray}
              idx={0}
              prevColor={null}
              isSelected={isSelected}
              maxSize={maxSize}
              height={height}
              zoomedBarWidth={ZOOMED_BAR_WIDTH}
              initialBarWidth={INITIAL_BAR_WIDTH}
              handleFrameClick={onFrameSelect}
            />
          );
        case 'even':
          return (
            <SquareBoxes
              boxArray={visibleBoxArray}
              isSelected={isSelected}
              height={height}
              visibleBoxesCount={visibleBoxesCount}
              zoomedBarWidth={ZOOMED_BAR_WIDTH}
              initialBarWidth={INITIAL_BAR_WIDTH}
            />
          );
        case 'oscillator':
          return (
            <Oscillator
              ref={(ref: OscillatorRef | null) => {
                oscillatorRefs.current[index] = ref;
              }}
              boxArray={visibleBoxArray}
              height={height}
              visibleBoxesCount={visibleBoxesCount}
              meetingPointY={meetingPointY}
              prevMeetingPointY={prevMeetingPointY}
              nextMeetingPointY={nextMeetingPointY}
              sliceWidth={sliceWidth}
              price={price}
              high={high}
              low={low}
            />
          );
        default:
          return null;
      }
    },
    [viewType, maxSize, height, onFrameSelect, boxOffset, visibleBoxesCount]
  );

  // Update hover info when offset changes
  useEffect(() => {
    if (hoverInfo) {
      const frameIndex = Math.floor(
        (hoverInfo.x + scrollLeft) / INITIAL_BAR_WIDTH
      );
      const frameX = (hoverInfo.x + scrollLeft) % INITIAL_BAR_WIDTH;
      const oscillator = oscillatorRefs.current[frameIndex];
      if (oscillator) {
        const { y, color, high, low, price } = oscillator.getColorAndY(frameX);
        setHoverInfo((prevInfo) => ({
          ...prevInfo!,
          y,
          color,
          high,
          low,
          price
        }));
      }
    }
  }, [boxOffset, scrollLeft]);

  // Auto-scroll to the right when new data is received
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft =
        scrollContainerRef.current.scrollWidth;
      handleScroll();
    }
  }, [data]);

  const handleFrameClick = useCallback(
    (frame: BoxSlice | null, index: number | null) => {
      if (frame !== null && index !== null) {
        const adjustedIndex = index + boxOffset;
        onFrameSelect(frame, adjustedIndex);
      } else {
        onFrameSelect(null, null);
      }
    },
    [onFrameSelect, boxOffset]
  );

  const getVisibleBoxesForFrame = useCallback(
    (frame: BoxSlice) => {
      const totalBoxes = frame.boxes.length;
      const start = Math.max(0, boxOffset);
      const end = Math.min(totalBoxes, boxOffset + visibleBoxesCount);
      return frame.boxes.slice(start, end);
    },
    [boxOffset, visibleBoxesCount]
  );

  return (
    <div className="relative h-full w-full">
      <div
        className="relative flex w-full bg-black pr-16"
        style={{ height: `${height}px`, transition: 'height 0.1s ease-out' }}
        ref={containerRef}
      >
        <DraggableBorder isDragging={isDragging} onDragStart={onDragStart} />
        {data && data.length > 0 && (
          <div className="flex h-full w-full">
            <HistogramChart
              data={data}
              framesWithPoints={framesWithPoints}
              height={height}
              onFrameSelect={handleFrameClick}
              renderNestedBoxes={renderNestedBoxes}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              hoverInfo={hoverInfo}
              scrollContainerRef={scrollContainerRef}
              onScroll={handleScroll}
            />
            <div className="absolute right-0 top-0 h-full w-16 border-l border-[#181818] bg-black">
              <HistogramControls
                boxOffset={boxOffset}
                onOffsetChange={onOffsetChange}
                totalBoxes={data[0]?.boxes.length || 0}
                visibleBoxesCount={visibleBoxesCount}
                viewType={viewType}
                onViewChange={onViewChange}
                selectedFrame={selectedFrame}
                height={height}
              />
            </div>
          </div>
        )}
      </div>
      {selectedFrame && (
        <SelectedFrameDetails
          selectedFrame={selectedFrame}
          visibleBoxes={getVisibleBoxesForFrame(selectedFrame)}
          onClose={() => onFrameSelect(null, null)}
        />
      )}
      <TimeBar
        data={data}
        scrollLeft={scrollLeft}
        width={containerRef.current?.clientWidth ?? 0}
        visibleBoxesCount={visibleBoxesCount}
        boxOffset={boxOffset}
      />
    </div>
  );
};

export default React.memo(HistogramManager);
