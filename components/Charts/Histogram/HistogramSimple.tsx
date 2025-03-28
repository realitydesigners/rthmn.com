import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Box, BoxSlice } from '@/types/types';
import { useColorStore } from '@/stores/colorStore';
import { useUrlParams } from '@/hooks/useUrlParams';
import { useParams } from 'next/navigation';

const GRADIENT_COLORS = {
    GREEN: {
        DARK: '#212422',
        MEDIUM: '#2A2F2B',
        LIGHT: '#3FFFA2',
        GRID: '#2F3B33',
        DOT: '#3FFFA2',
    },
    RED: {
        DARK: '#222221',
        MEDIUM: '#2A2F2A',
        LIGHT: '#3FFFA2',
        GRID: '#2F3B32',
        DOT: '#3FFFA2',
    },
    NEUTRAL: {
        DARK: '#212422',
        MEDIUM: '#242624',
        LIGHT: '#3FFFA2',
        GRID: '#2A2D2A',
        DOT: '#3FFFA2',
    },
};

const HistogramControls: React.FC<{
    boxOffset: number;
    onOffsetChange: (newOffset: number) => void;
    totalBoxes: number;
    visibleBoxesCount: number;
}> = ({ boxOffset, onOffsetChange, totalBoxes, visibleBoxesCount }) => {
    return (
        <div className='absolute top-0 right-0 bottom-1 flex h-full w-16 flex-col items-center justify-center border-l border-[#181818] bg-black'>
            <button
                onClick={() => onOffsetChange(Math.max(0, boxOffset - 1))}
                disabled={boxOffset === 0}
                className='flex h-8 w-8 items-center justify-center rounded-sm border border-[#181818] bg-black text-white hover:bg-[#181818] disabled:opacity-50'>
                <div className='text-2xl'>+</div>
            </button>
            <div className='text-center text-white'>
                <div>{boxOffset}</div>
                <div>{totalBoxes - 1}</div>
            </div>
            <button
                onClick={() => onOffsetChange(Math.min(totalBoxes - visibleBoxesCount, boxOffset + 1))}
                disabled={boxOffset >= totalBoxes - visibleBoxesCount}
                className='flex h-8 w-8 items-center justify-center rounded-sm border border-[#181818] bg-black text-white hover:bg-[#181818] disabled:opacity-50'>
                <div className='text-2xl'>-</div>
            </button>
        </div>
    );
};

const HistogramSimple: React.FC<{ data: BoxSlice[] }> = ({ data }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const gradientRef = useRef<{ [key: string]: CanvasGradient }>({});
    const BOX_WIDTH = 25;
    const MAX_FRAMES = 1000;
    const VISIBLE_BOXES_COUNT = 8;
    const { boxColors } = useColorStore();
    const params = useParams();
    const { boxOffset, handleOffsetChange } = useUrlParams(params.pair as string);
    const [containerHeight, setContainerHeight] = useState(500);

    // Improved frame deduplication logic
    const uniqueFrames = useMemo(() => {
        if (!data.length) return [];

        const getVisibleBoxesSignature = (frame: BoxSlice) => {
            // Sort boxes by absolute value
            const sortedBoxes = [...frame.boxes].sort((a, b) => Math.abs(a.value) - Math.abs(b.value));

            // Get visible boxes based on current offset
            const visibleBoxes = sortedBoxes.slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT);

            // Split into negative and positive boxes
            const negativeBoxes = visibleBoxes.filter((box) => box.value < 0).sort((a, b) => a.value - b.value);
            const positiveBoxes = visibleBoxes.filter((box) => box.value > 0).sort((a, b) => a.value - b.value);

            // Create ordered boxes array
            const orderedBoxes = [...negativeBoxes, ...positiveBoxes];

            // Create signature from ordered boxes
            return orderedBoxes.map((box) => `${box.value}`).join('|');
        };

        return data.reduce((acc: BoxSlice[], frame, index) => {
            // Always include the first frame
            if (index === 0) {
                return [frame];
            }

            const prevFrame = acc[acc.length - 1];
            const currentSignature = getVisibleBoxesSignature(frame);
            const prevSignature = getVisibleBoxesSignature(prevFrame);

            // Only add frame if the visible boxes are different
            if (currentSignature !== prevSignature) {
                return [...acc, frame];
            }

            return acc;
        }, []);
    }, [data, boxOffset, VISIBLE_BOXES_COUNT]);

    // Add effect to scroll to the right when offset changes
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, [boxOffset, uniqueFrames]);

    // Update container height and recalculate box heights when container size changes
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setContainerHeight(containerRef.current.clientHeight);
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Add section color calculation
    const getFrameSectionColor = (frame: BoxSlice) => {
        const sortedBoxes = [...frame.boxes].sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
        const visibleBoxes = sortedBoxes.slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT);

        if (visibleBoxes.length === 0) return 'NEUTRAL';

        const largestBox = visibleBoxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max));
        return largestBox.value > 0 ? 'GREEN' : 'RED';
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !uniqueFrames.length) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const visibleFrames = uniqueFrames.slice(Math.max(0, uniqueFrames.length - MAX_FRAMES));
        const totalWidth = visibleFrames.length * BOX_WIDTH;
        const boxHeight = containerHeight / VISIBLE_BOXES_COUNT;

        canvas.width = totalWidth;
        canvas.height = containerHeight;

        // Clear canvas
        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, totalWidth, containerHeight);

        visibleFrames.forEach((frame, frameIndex) => {
            const x = frameIndex * BOX_WIDTH;

            // Get section color for this frame
            const sectionColor = getFrameSectionColor(frame);
            const colors = GRADIENT_COLORS[sectionColor as keyof typeof GRADIENT_COLORS];

            // Create gradient if it doesn't exist
            if (!gradientRef.current[sectionColor]) {
                const gradient = ctx.createLinearGradient(0, 0, 0, containerHeight);
                gradient.addColorStop(0, colors.DARK);
                gradient.addColorStop(1, colors.MEDIUM);
                gradientRef.current[sectionColor] = gradient;
            }

            // Draw background gradient for this section
            ctx.fillStyle = gradientRef.current[sectionColor];
            ctx.fillRect(x, 0, BOX_WIDTH, containerHeight);

            // Draw grid lines
            ctx.beginPath();
            ctx.strokeStyle = colors.GRID;
            ctx.lineWidth = 0.3;
            for (let i = 0; i <= VISIBLE_BOXES_COUNT; i++) {
                const y = Math.round(i * boxHeight);
                ctx.moveTo(x, y);
                ctx.lineTo(x + BOX_WIDTH, y);
            }
            ctx.stroke();

            // Sort and draw boxes
            const sortedBoxes = [...frame.boxes].sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
            const visibleBoxes = sortedBoxes.slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT);
            const negativeBoxes = visibleBoxes.filter((box) => box.value < 0).sort((a, b) => a.value - b.value);
            const positiveBoxes = visibleBoxes.filter((box) => box.value > 0).sort((a, b) => a.value - b.value);
            const orderedBoxes = [...negativeBoxes, ...positiveBoxes];

            orderedBoxes.forEach((box, boxIndex) => {
                const currentY = boxIndex * boxHeight;
                // Use boxColors from the store for the actual boxes
                const color = box.value > 0 ? boxColors.positive : boxColors.negative;
                const opacity = boxColors.styles?.opacity || 0.2;

                // Draw box background with store colors
                ctx.fillStyle = `${color}${Math.round(opacity * 255)
                    .toString(16)
                    .padStart(2, '0')}`;
                ctx.fillRect(x, currentY, BOX_WIDTH, boxHeight);

                // Draw borders if enabled in store
                if (boxColors.styles?.showBorder) {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x, currentY);
                    ctx.lineTo(x + BOX_WIDTH, currentY);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x, currentY + boxHeight);
                    ctx.lineTo(x + BOX_WIDTH, currentY + boxHeight);
                    ctx.stroke();
                }

                // Draw value text with store colors
                ctx.fillStyle = color;
                const fontSize = Math.min(10, boxHeight / 3);
                ctx.font = `${fontSize}px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const displayValue = box.value.toString();
                ctx.fillText(box.value >= 0 ? displayValue : `-${displayValue}`, x + BOX_WIDTH / 2, currentY + boxHeight / 2);
            });
        });
    }, [uniqueFrames, boxColors, boxOffset, containerHeight]);

    if (!uniqueFrames.length) return null;

    return (
        <div className='relative flex w-full flex-col'>
            <div ref={containerRef} className='relative flex h-[200px] w-full bg-[#121212]'>
                <div ref={scrollContainerRef} className='flex h-full w-full overflow-auto'>
                    <canvas ref={canvasRef} className='block pr-20' />
                    <HistogramControls
                        boxOffset={boxOffset}
                        onOffsetChange={handleOffsetChange}
                        totalBoxes={Math.max(...uniqueFrames.map((frame) => frame.boxes.length))}
                        visibleBoxesCount={VISIBLE_BOXES_COUNT}
                    />
                </div>
            </div>
        </div>
    );
};

export default HistogramSimple;
