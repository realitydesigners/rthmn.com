import React, { useEffect } from 'react';
import { BoxSlice } from '@/types/types';
import { BoxColors } from '@/stores/colorStore';

interface LinePoint {
    x: number;
    y: number;
    isPositive: boolean;
    isLargestPositive: boolean;
}

interface HistogramLineProps {
    ctx: CanvasRenderingContext2D;
    uniqueFrames: BoxSlice[];
    boxOffset: number;
    VISIBLE_BOXES_COUNT: number;
    BOX_WIDTH: number;
    containerHeight: number;
    boxColors: BoxColors;
}

export const drawHistogramLine = ({ ctx, uniqueFrames, boxOffset, VISIBLE_BOXES_COUNT, BOX_WIDTH, containerHeight, boxColors }: HistogramLineProps) => {
    // Calculate points for the line based on smallest absolute values
    const linePoints: LinePoint[] = [];

    uniqueFrames.forEach((frame, frameIndex) => {
        const x = frameIndex * BOX_WIDTH;

        // Find smallest absolute value box for line position
        const sortedBoxes = [...frame.boxes].sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
        const visibleBoxes = sortedBoxes.slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT);
        const smallestBox = visibleBoxes[0]; // First one is smallest absolute value
        const isPositive = smallestBox.value > 0;

        // Find largest box to determine coloring for this frame
        const largestBox = visibleBoxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max));
        const isLargestPositive = largestBox.value > 0;

        // Find vertical position of this box
        const negativeBoxes = visibleBoxes.filter((box) => box.value < 0).sort((a, b) => a.value - b.value);
        const positiveBoxes = visibleBoxes.filter((box) => box.value > 0).sort((a, b) => a.value - b.value);
        const orderedBoxes = [...negativeBoxes, ...positiveBoxes];
        const boxIndex = orderedBoxes.findIndex((box) => box.value === smallestBox.value);

        // Calculate line Y position
        const lineY = isPositive
            ? boxIndex * (containerHeight / VISIBLE_BOXES_COUNT) // Top of box for positive
            : (boxIndex + 1) * (containerHeight / VISIBLE_BOXES_COUNT); // Bottom of box for negative

        // Store points for later use
        linePoints.push({ x, y: lineY, isPositive, isLargestPositive });
    });

    // Create fill areas for each segment with its own color
    for (let i = 0; i < linePoints.length - 1; i++) {
        const currentPoint = linePoints[i];
        const nextPoint = linePoints[i + 1];

        ctx.beginPath();
        if (currentPoint.isLargestPositive) {
            // If largest is positive, draw from top down to line
            ctx.moveTo(currentPoint.x, 0); // Start from top
            ctx.lineTo(nextPoint.x, 0); // Go across the top
            ctx.lineTo(nextPoint.x, nextPoint.y); // Down to the line
            ctx.lineTo(currentPoint.x, currentPoint.y); // Back to start point on line
        } else {
            // If largest is negative, draw from bottom up to line
            ctx.moveTo(currentPoint.x, currentPoint.y); // Start from line
            ctx.lineTo(nextPoint.x, nextPoint.y); // Along the line
            ctx.lineTo(nextPoint.x, containerHeight); // Down to bottom
            ctx.lineTo(currentPoint.x, containerHeight); // Across bottom
        }
        ctx.closePath();

        // Use color based on current frame's largest box
        if (currentPoint.isLargestPositive) {
            ctx.fillStyle = `rgba(${parseInt(boxColors.positive.slice(1, 3), 16)}, ${parseInt(boxColors.positive.slice(3, 5), 16)}, ${parseInt(boxColors.positive.slice(5, 7), 16)}, 1)`;
        } else {
            ctx.fillStyle = `rgba(${parseInt(boxColors.negative.slice(1, 3), 16)}, ${parseInt(boxColors.negative.slice(3, 5), 16)}, ${parseInt(boxColors.negative.slice(5, 7), 16)}, 1)`;
        }
        ctx.fill();
    }

    // Handle the last segment
    if (linePoints.length > 0) {
        const lastPoint = linePoints[linePoints.length - 1];
        ctx.beginPath();
        if (lastPoint.isLargestPositive) {
            ctx.moveTo(lastPoint.x, 0);
            ctx.lineTo(lastPoint.x + BOX_WIDTH, 0);
            ctx.lineTo(lastPoint.x + BOX_WIDTH, lastPoint.y);
            ctx.lineTo(lastPoint.x, lastPoint.y);
        } else {
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(lastPoint.x + BOX_WIDTH, lastPoint.y);
            ctx.lineTo(lastPoint.x + BOX_WIDTH, containerHeight);
            ctx.lineTo(lastPoint.x, containerHeight);
        }
        ctx.closePath();

        if (lastPoint.isLargestPositive) {
            ctx.fillStyle = `rgba(${parseInt(boxColors.positive.slice(1, 3), 16)}, ${parseInt(boxColors.positive.slice(3, 5), 16)}, ${parseInt(boxColors.positive.slice(5, 7), 16)}, 1)`;
        } else {
            ctx.fillStyle = `rgba(${parseInt(boxColors.negative.slice(1, 3), 16)}, ${parseInt(boxColors.negative.slice(3, 5), 16)}, ${parseInt(boxColors.negative.slice(5, 7), 16)}, 1)`;
        }
        ctx.fill();
    }

    // Draw the white line on top
    ctx.beginPath();
    linePoints.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });

    // Add the final segment to complete the line
    if (linePoints.length > 0) {
        ctx.lineTo(linePoints[linePoints.length - 1].x + BOX_WIDTH, linePoints[linePoints.length - 1].y);
    }

    // Draw the white line
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
};
