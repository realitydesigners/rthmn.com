'use client';
import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export const BackgroundPerspectiveGrid = React.memo(() => {
    const pathname = usePathname();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dimensionsRef = useRef({ width: 0, height: 0 });

    // Memoize constants to avoid recalculation
    const constants = useMemo(
        () => ({
            gridSize: 150,
            maxScale: 2,
            horizonRatio: 0.6,
            vanishingScale: 0.2,
            numHorizontalLines: 15,
        }),
        []
    );

    // Separate drawing function for better performance
    const drawGrid = useCallback(
        (ctx: CanvasRenderingContext2D, width: number, height: number) => {
            // Skip if dimensions haven't changed
            if (width === dimensionsRef.current.width && height === dimensionsRef.current.height) {
                return;
            }
            dimensionsRef.current = { width, height };

            const { gridSize, maxScale, horizonRatio, vanishingScale, numHorizontalLines } = constants;
            const horizon = height * horizonRatio;
            const vanishingPointX = width / 2;

            ctx.clearRect(0, 0, width, height);

            // Create and set gradient once
            const gradient = ctx.createLinearGradient(0, height, 0, horizon);
            gradient.addColorStop(0, '#333');
            gradient.addColorStop(0.9, '#111');
            gradient.addColorStop(1, 'transparent');
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.5;

            // Pre-calculate common values
            const visibleWidth = width * maxScale;
            const numLines = Math.min(Math.ceil(visibleWidth / gridSize), 30);
            const startX = -numLines * gridSize + width / 2;
            const endX = numLines * gridSize + width / 2;
            const totalDistance = height - horizon;

            // Batch vertical lines
            ctx.beginPath();
            for (let i = -numLines; i <= numLines; i++) {
                const x = i * gridSize + width / 2;
                ctx.moveTo(x, height);
                ctx.lineTo(vanishingPointX + (x - vanishingPointX) * vanishingScale, horizon);
            }
            ctx.stroke();

            // Batch horizontal lines
            ctx.beginPath();
            for (let i = numHorizontalLines - 1; i >= 0; i--) {
                const t = i / (numHorizontalLines - 1);
                const progress = t * t; // Math.pow is slower than direct multiplication
                const y = horizon + totalDistance * progress;
                ctx.moveTo(startX, y);
                ctx.lineTo(endX, y);
            }
            ctx.stroke();
        },
        [constants]
    );

    useEffect(() => {
        if (pathname === '/test') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', {
            alpha: false,
            antialias: false, // Disable antialiasing for better performance
        });
        if (!ctx) return;

        let rafId: number;
        let resizeTimeout: NodeJS.Timeout;

        const updateSize = () => {
            const dpr = window.devicePixelRatio || 1;
            const displayWidth = window.innerWidth;
            const displayHeight = window.innerHeight;

            canvas.width = displayWidth * dpr;
            canvas.height = displayHeight * dpr;
            canvas.style.width = `${displayWidth}px`;
            canvas.style.height = `${displayHeight}px`;

            // Type assertion since we know it's a 2D context
            const context = ctx as CanvasRenderingContext2D;
            context.scale(dpr, dpr);
            drawGrid(context, displayWidth, displayHeight);
        };

        const debouncedResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateSize, 100);
        };

        updateSize();
        window.addEventListener('resize', debouncedResize, { passive: true });

        return () => {
            window.removeEventListener('resize', debouncedResize);
            clearTimeout(resizeTimeout);
            cancelAnimationFrame(rafId);
        };
    }, [drawGrid, pathname]);

    if (pathname === '/test') return null;

    return <canvas ref={canvasRef} className='fixed inset-0 h-screen w-screen bg-black' />;
});

BackgroundPerspectiveGrid.displayName = 'BackgroundPerspectiveGrid';
