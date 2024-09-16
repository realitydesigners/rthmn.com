'use client';
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo
} from 'react';
import type { BoxSlice } from '@/types';

interface HistogramProps {
  data: BoxSlice[];
}

const BAR_WIDTH = 5;
const CHART_HEIGHT = 300;
const CHART_BACKGROUND = '#000';

const LineChart: React.FC<HistogramProps> = ({ data }) => {
  const [visibleFrames, setVisibleFrames] = useState<number>(0);
  const [hoveredFrame, setHoveredFrame] = useState<BoxSlice | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [isModalLocked, setIsModalLocked] = useState(false);
  const [lockedPosition, setLockedPosition] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const maxSize = useMemo(() => {
    const sizes = data.flatMap((slice) =>
      slice.boxes.map((box) => Math.abs(box.high - box.low))
    );
    return sizes.reduce((max, size) => Math.max(max, size), 0);
  }, [data]);

  const calculateMiddlePoint = useCallback((slice: BoxSlice) => {
    let upTotal = 0;
    let downTotal = 0;
    for (const box of slice.boxes) {
      const size = Math.abs(box.high - box.low);
      if (box.value > 0) upTotal += size;
      else downTotal += size;
    }
    const total = upTotal + downTotal;
    return total === 0 ? 0.5 : upTotal / total;
  }, []);
  const getLargestMovement = useCallback((slice: BoxSlice | undefined) => {
    if (!slice || !slice.boxes || !Array.isArray(slice.boxes)) {
      return 'N';
    }
    let largestU = 0;
    let largestD = 0;
    for (const box of slice.boxes) {
      if (box && typeof box.high === 'number' && typeof box.low === 'number') {
        const size = Math.abs(box.high - box.low);
        if (box.value > 0) largestU = Math.max(largestU, size);
        else largestD = Math.max(largestD, size);
      }
    }
    return largestU > largestD ? 'U' : 'D';
  }, []);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (isModalLocked) return;

      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const x = event.clientX - rect.left;
      setHoverPosition(x);

      const frameIndex = Math.floor(x / BAR_WIDTH);
      if (frameIndex >= 0 && frameIndex < visibleFrames) {
        setHoveredFrame(data[frameIndex]);
      } else {
        setHoveredFrame(null);
      }
    },
    [data, visibleFrames, isModalLocked]
  );

  const handleMouseLeave = useCallback(() => {
    if (!isModalLocked) {
      setHoveredFrame(null);
      setHoverPosition(null);
    }
  }, [isModalLocked]);

  const handleModalMouseEnter = useCallback(() => {
    setIsModalLocked(true);
    setLockedPosition(hoverPosition);
  }, [hoverPosition]);

  const handleModalMouseLeave = useCallback(() => {
    setIsModalLocked(false);
    setLockedPosition(null);
  }, []);

  type Segment = {
    points: string[];
    color: string;
  };

  const renderAreaAndLine = useCallback(() => {
    if (!svgRef.current || data.length === 0) return null;

    let lastColor = 'green';
    const points = data.slice(0, visibleFrames).map((slice, index) => {
      const middlePoint = calculateMiddlePoint(slice);
      const y = CHART_HEIGHT - middlePoint * CHART_HEIGHT;
      const allSameDirection = slice.boxes.every(
        (box) => Math.sign(box.value) === Math.sign(slice.boxes[0].value)
      );

      if (allSameDirection) {
        lastColor = slice.boxes[0].value > 0 ? 'green' : 'red';
      }

      return { x: index * BAR_WIDTH, y, color: lastColor };
    });

    const segments: Segment[] = [];
    let currentSegment: Segment = { points: [], color: points[0].color };

    for (let i = 0; i < points.length; i++) {
      currentSegment.points.push(`${points[i].x},${points[i].y}`);
      if (i === points.length - 1 || points[i].color !== points[i + 1].color) {
        currentSegment.points.push(
          `${points[i].x},${CHART_HEIGHT}`,
          `${currentSegment.points[0].split(',')[0]},${CHART_HEIGHT}`
        );
        segments.push(currentSegment);
        if (i !== points.length - 1) {
          currentSegment = {
            points: [`${points[i + 1].x},${CHART_HEIGHT}`],
            color: points[i + 1].color
          };
        }
      }
    }

    const hoveredPoint =
      hoverPosition !== null
        ? points[Math.floor(hoverPosition / BAR_WIDTH)]
        : null;

    return (
      <>
        <defs>
          {segments.map((segment, index) => (
            <linearGradient
              key={index}
              id={`areaGradient${index}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={segment.color === 'green' ? '#0F766E' : '#B91C1C'}
                stopOpacity="0.4"
              />
              <stop
                offset="100%"
                stopColor={segment.color === 'green' ? '#0F766E' : '#B91C1C'}
                stopOpacity="0.1"
              />
            </linearGradient>
          ))}
        </defs>
        {segments.map((segment, index) => (
          <path
            key={index}
            d={`M${segment.points.join(' L')} Z`}
            fill={`url(#areaGradient${index})`}
            stroke="none"
          />
        ))}
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth="2"
        />
        {hoverPosition !== null && (
          <>
            <line
              x1={hoverPosition}
              y1="0"
              x2={hoverPosition}
              y2={CHART_HEIGHT}
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="1"
            />
            {hoveredPoint && (
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="5"
                fill="#F3F4F6"
              />
            )}
          </>
        )}
      </>
    );
  }, [data, visibleFrames, calculateMiddlePoint, hoverPosition]);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleFrames((prev) => Math.min(prev + 100, data.length));
    }, 100);

    return () => clearInterval(timer);
  }, [data.length]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: containerRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
  }, [visibleFrames]);

  return (
    <div className="relative overflow-hidden rounded-lg border border-[#121212] bg-gray-700 shadow-xl">
      <div
        ref={containerRef}
        className="w-full overflow-x-auto"
        style={{ backgroundColor: CHART_BACKGROUND }}
        role="region"
        aria-label="Area Chart"
      >
        <svg
          ref={svgRef}
          width={data.length * BAR_WIDTH}
          height={CHART_HEIGHT}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="transition-all duration-300 ease-in-out"
        >
          <title>Line Chart</title>
          {renderAreaAndLine()}
          {hoveredFrame &&
            (hoverPosition !== null || lockedPosition !== null) && (
              <>
                <MemoizedHoveredFrameDetails
                  hoveredFrame={hoveredFrame}
                  position={isModalLocked ? lockedPosition : hoverPosition}
                  chartHeight={CHART_HEIGHT}
                  onMouseEnter={handleModalMouseEnter}
                  onMouseLeave={handleModalMouseLeave}
                />
                <PriceDisplay
                  price={
                    hoveredFrame.price ?? calculateAveragePrice(hoveredFrame)
                  }
                  position={isModalLocked ? lockedPosition : hoverPosition}
                  chartHeight={CHART_HEIGHT}
                />
              </>
            )}
        </svg>
      </div>
    </div>
  );
};

interface HoveredFrameDetailsProps {
  hoveredFrame: BoxSlice;
  position: number | null;
  chartHeight: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const MemoizedHoveredFrameDetails: React.FC<HoveredFrameDetailsProps> =
  React.memo(
    ({ hoveredFrame, position, chartHeight, onMouseEnter, onMouseLeave }) => {
      const [showDetails, setShowDetails] = useState(false);

      if (!hoveredFrame) return null;

      return (
        <foreignObject
          x={position ? position + 5 : 0}
          y={10}
          width="200"
          height={chartHeight - 50}
        >
          <div
            className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-xs text-gray-200 shadow-xl"
            style={{
              maxHeight: '100%',
              overflow: 'hidden'
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <p className="mb-2 text-sm font-semibold">Frame Data</p>
            <p className="mb-1 text-gray-400">Time: {hoveredFrame.timestamp}</p>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mb-2 rounded bg-gray-700 px-2 py-1 text-xs font-bold text-white hover:bg-gray-600"
              type="button"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            {showDetails && (
              <ul className="space-y-2">
                {hoveredFrame.boxes.map((box, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between rounded-md bg-gray-700 p-2"
                  >
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${
                        box.value > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="ml-2 text-gray-300">
                      {box.value.toFixed(2)} · {box.high.toFixed(5)} ·{' '}
                      {box.low.toFixed(5)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </foreignObject>
      );
    }
  );

MemoizedHoveredFrameDetails.displayName = 'MemoizedHoveredFrameDetails';

interface PriceDisplayProps {
  price: number;
  position: number | null;
  chartHeight: number;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  position,
  chartHeight
}) => {
  return (
    <foreignObject
      x={position ? position - 50 : 0}
      y={chartHeight - 30}
      width="100"
      height="25"
    >
      <div className="flex items-center justify-center rounded-full border border-[#121212] bg-black/50 py-1 text-xs text-white">
        {price.toFixed(5)}
      </div>
    </foreignObject>
  );
};

const calculateAveragePrice = (frame: BoxSlice) => {
  return (
    frame.boxes.reduce((sum, box) => sum + (box.high + box.low) / 2, 0) /
    frame.boxes.length
  );
};

export default LineChart;
