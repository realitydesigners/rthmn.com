'use client';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import HistogramControls from './HistogramControls';
import SelectedFrameDetails from './SelectedFrameDetails';
import { ScaledBoxes } from './charts/ScaledBoxes';
import { SquareBoxes } from './charts/SquareBoxes';
import { Oscillator, OscillatorRef } from './charts/Oscillator';
import type { BoxSlice, ViewType } from '@/types';

const ZOOMED_BAR_WIDTH = 0;
const INITIAL_BAR_WIDTH = 50;

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
    return currentFrame
      ? currentFrame.boxes.slice(boxOffset, boxOffset + visibleBoxesCount)
      : [];
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
      const visibleBoxes = slice.boxes.slice(
        boxOffset,
        boxOffset + visibleBoxesCount
      );
      const positiveBoxesCount = visibleBoxes.filter(
        (box) => box.value > 0
      ).length;
      const negativeBoxesCount = visibleBoxesCount - positiveBoxesCount;

      const totalNegativeHeight = negativeBoxesCount * boxHeight;
      const meetingPointY =
        totalNegativeHeight +
        (height - totalNegativeHeight - positiveBoxesCount * boxHeight) / 2;

      return {
        frameData: {
          boxArray: slice.boxes,
          isSelected,
          meetingPointY,
          sliceWidth: isSelected ? ZOOMED_BAR_WIDTH : INITIAL_BAR_WIDTH
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
    index: number
  ) => JSX.Element | null;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
  hoverInfo: { x: number; y: number; color: string } | null;
}> = React.memo(
  ({
    data,
    framesWithPoints,
    height,
    onFrameSelect,
    renderNestedBoxes,
    onMouseMove,
    onMouseLeave,
    hoverInfo
  }) => (
    <div
      className="relative h-full w-full pr-16"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="hide-scrollbar flex h-full w-full items-end overflow-x-auto"
        role="region"
        aria-label="Histogram Chart"
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
                  index
                )}
              </div>
            );
          })}
        </div>
      </div>
      {hoverInfo && (
        <div
          className="pointer-events-none absolute bottom-0 top-0"
          style={{
            left: `${hoverInfo.x}px`,
            width: '1px',
            background: hoverInfo.color,
            boxShadow: `0 0 5px ${hoverInfo.color}`,
            zIndex: 1000
          }}
        >
          <div
            className="absolute h-3 w-3 rounded-full"
            style={{
              background: hoverInfo.color,
              boxShadow: `0 0 5px ${hoverInfo.color}`,
              top: `${hoverInfo.y - 6}px`, // Adjusted to move the dot up
              left: '-6px'
            }}
          />
        </div>
      )}
    </div>
  )
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
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    color: string;
  } | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const frameIndex = Math.floor(x / INITIAL_BAR_WIDTH);
      const frameX = x % INITIAL_BAR_WIDTH;

      if (frameIndex >= 0 && frameIndex < framesWithPoints.length) {
        const frame = framesWithPoints[frameIndex];
        const oscillator = oscillatorRefs.current[frameIndex];

        if (oscillator) {
          const { y, color } = oscillator.getColorAndY(frameX);
          setHoverInfo({
            x: frameIndex * INITIAL_BAR_WIDTH + frameX,
            y,
            color
          });
        }
      }
    },
    [framesWithPoints]
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
      index: number
    ): JSX.Element | null => {
      const visibleBoxArray = boxArray.slice(
        boxOffset,
        boxOffset + visibleBoxesCount
      );
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
            />
          );
        default:
          return null;
      }
    },
    [viewType, maxSize, height, onFrameSelect, boxOffset, visibleBoxesCount]
  );

  // Auto-scroll to the right when new data is received
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft =
        scrollContainerRef.current.scrollWidth;
    }
  }, [data]);

  return (
    <div className="h-full w-full">
      <div
        className="relative flex w-full border-t border-[#181818] bg-black pr-16"
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
              onFrameSelect={onFrameSelect}
              renderNestedBoxes={renderNestedBoxes}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              hoverInfo={hoverInfo}
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
          visibleBoxes={visibleBoxes}
          onClose={() => onFrameSelect(null, null)}
        />
      )}
    </div>
  );
};

export default React.memo(HistogramManager);
