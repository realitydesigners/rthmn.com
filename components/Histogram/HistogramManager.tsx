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
import type { BoxSlice, ViewType, Box } from '@/types';
import { COLORS } from './Colors';
import { DraggableBorder } from '../DraggableBorder';
import { formatTime } from '@/utils/dateUtils';
import { MeetingPoint } from './Oscillator/MeetingPoint';
import { PulseWave } from './Oscillator/PulseWave';

const ZOOMED_BAR_WIDTH = 0;
const INITIAL_BAR_WIDTH = 20;

type OscillatorRef = {
  getColorAndY: any;
  meetingPoints: { x: number; y: number }[];
  sliceWidth: number;
  visibleBoxesCount: number;
};

type HoverInfo = {
  x: number;
  y: number;
  color: string;
  high: number;
  low: number;
  linePrice: number;
} | null;

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
      // Calculate price based on the smallest box
      // Calculate high and low from visible boxes
      const smallestBox = visibleBoxes.reduce((smallest, current) =>
        Math.abs(current.value) < Math.abs(smallest.value) ? current : smallest
      );
      const price = smallestBox.value >= 0 ? smallestBox.high : smallestBox.low;
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

const HistogramChart: React.FC<{
  data: BoxSlice[];
  framesWithPoints: ReturnType<typeof useHistogramData>['framesWithPoints'];
  height: number;
  onFrameSelect: (frame: BoxSlice | null, index: number | null) => void;
  renderNestedBoxes: any;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
  hoverInfo: HoverInfo;
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
  }) => {
    const HoverInfo: React.FC<{
      x: number;
      y: number;
      color: string;
      linePrice: number;
      high: number;
      low: number;
    }> = ({ x, y, color, linePrice, high, low }) => (
      <div
        className="pointer-events-none absolute z-[1000]"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          transform: 'translate(-50%, -100%)'
        }}
      >
        <div
          className="shadow-x mb-4 rounded px-2 py-1 text-xs font-bold text-black"
          style={{ backgroundColor: color }}
        >
          <div>{linePrice.toFixed(3)}</div>
        </div>
      </div>
    );

    return (
      <div
        className="relative h-full w-full pr-16"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <div
          ref={scrollContainerRef}
          className="hide-scrollbar flex h-full w-full items-end overflow-x-auto"
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
              className="pointer-events-none absolute bottom-0 top-0 w-[1px]"
              style={{
                left: `${hoverInfo.x}px`,
                background: hoverInfo.color,
                boxShadow: `0 0 5px ${hoverInfo.color}`
              }}
            />
            <div
              className="pointer-events-none absolute h-3 w-3 rounded-full"
              style={{
                left: `${hoverInfo.x}px`,
                top: `${hoverInfo.y}px`,
                transform: 'translate(-50%, -50%)',
                background: hoverInfo.color,
                boxShadow: `0 0 5px ${hoverInfo.color}`
              }}
            />
            <HoverInfo {...hoverInfo} />
          </>
        )}
      </div>
    );
  }
);

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
              className="absolute flex-shrink-0 whitespace-nowrap text-center text-[11px] font-bold"
              style={{
                left: `${index * INITIAL_BAR_WIDTH}px`,
                width: `${INITIAL_BAR_WIDTH}px`,
                transform: 'translateX(-60%)',
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

const Oscillator = forwardRef<
  OscillatorRef,
  {
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
>(
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

    const getColorAndY = useCallback(
      (x: number) => {
        const y = interpolateY(x);

        // Find the smallest box based on absolute value
        const smallestBox = boxArray.reduce((smallest, current) =>
          Math.abs(current.value) < Math.abs(smallest.value)
            ? current
            : smallest
        );

        // Determine the LinePrice, high, and low based on the smallest box
        const linePrice =
          smallestBox.value >= 0 ? smallestBox.high : smallestBox.low;
        const boxHigh = smallestBox.high;
        const boxLow = smallestBox.low;

        return {
          y: Math.round(y),
          color: colors.LIGHT,
          high: boxHigh,
          low: boxLow,
          linePrice
        };
      },
      [boxArray, colors.LIGHT, interpolateY]
    );

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
          <MeetingPoint
            prevMeetingPointY={prevMeetingPointY}
            nextMeetingPointY={nextMeetingPointY}
            meetingPointY={meetingPointY}
            sliceWidth={sliceWidth}
            colors={colors}
          />
        </svg>
      </div>
    );
  }
);

const HistogramManager: React.FC<{
  data: BoxSlice[];
  height: number;
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
  containerWidth: number; // Add this prop
}> = ({
  data,
  height,
  boxOffset,
  onOffsetChange,
  visibleBoxesCount,
  viewType,
  onViewChange,
  selectedFrame,
  selectedFrameIndex,
  onFrameSelect,
  isDragging,
  onDragStart,
  containerWidth // Add this prop
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  const { framesWithPoints } = useHistogramData(
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
          const { y, color, high, low, linePrice } =
            oscillator.getColorAndY(frameX);
          setHoverInfo({
            x: frameIndex * INITIAL_BAR_WIDTH + frameX - scrollLeft,
            y,
            color,
            high,
            low,
            linePrice
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
    [viewType, height, boxOffset, visibleBoxesCount]
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
        const { y, color, high, low, linePrice } =
          oscillator.getColorAndY(frameX);
        setHoverInfo((prevInfo: HoverInfo) => ({
          ...prevInfo!,
          y,
          color,
          high,
          low,
          linePrice
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
      const visibleBoxes = frame.boxes.slice(start, end).map((box) => ({
        ...box,
        high: box.high,
        low: box.low,
        value: box.value
      }));

      // Find the smallest box by absolute value
      const smallestBox = visibleBoxes.reduce((smallest, current) =>
        Math.abs(current.value) < Math.abs(smallest.value) ? current : smallest
      );

      // Calculate the LinePrice
      const linePrice =
        smallestBox.value >= 0 ? smallestBox.high : smallestBox.low;

      return { visibleBoxes, linePrice };
    },
    [boxOffset, visibleBoxesCount]
  );

  return (
    <>
      <div
        className="relative flex h-full w-full bg-black pr-16"
        style={{ height: `${height}px`, transition: 'height 0.1s ease-out' }}
        ref={containerRef}
      >
        <DraggableBorder
          isDragging={isDragging}
          onDragStart={onDragStart}
          direction="top"
        />
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
        )}
      </div>
      <TimeBar
        data={data}
        scrollLeft={scrollLeft}
        width={containerWidth}
        visibleBoxesCount={visibleBoxesCount}
        boxOffset={boxOffset}
      />
      {selectedFrame && (
        <SelectedFrameDetails
          selectedFrame={selectedFrame}
          visibleBoxes={getVisibleBoxesForFrame(selectedFrame).visibleBoxes}
          onClose={() => onFrameSelect(null, null)}
          linePrice={getVisibleBoxesForFrame(selectedFrame).linePrice}
        />
      )}
    </>
  );
};

export default React.memo(HistogramManager);
