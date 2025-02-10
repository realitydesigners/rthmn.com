'use client';

import { useDashboard } from '@/providers/DashboardProvider/client';
import { useUser } from '@/providers/UserProvider';
import { useGridStore } from '@/stores/gridStore';
import { NoInstruments } from './LoadingSkeleton';
import { PairResoBox } from './PairResoBox';
import { useEffect, useState, useCallback } from 'react';
import { motion, Reorder } from 'framer-motion';
import { cn } from '@/utils/cn';

export default function Dashboard() {
    const { pairData, isLoading } = useDashboard();
    const { selectedPairs, boxColors } = useUser();
    const getGridClass = useGridStore((state) => state.getGridClass);
    const breakpoints = useGridStore((state) => state.breakpoints);
    const orderedPairs = useGridStore((state) => state.orderedPairs);
    const reorderPairs = useGridStore((state) => state.reorderPairs);
    const setInitialPairs = useGridStore((state) => state.setInitialPairs);
    const [gridClass, setGridClass] = useState('');
    const [draggedItem, setDraggedItem] = useState<string | null>(null);

    // Initialize ordered pairs from selected pairs
    useEffect(() => {
        setInitialPairs(selectedPairs);
    }, [selectedPairs, setInitialPairs]);

    const updateGridClass = useCallback(() => {
        const width = document.querySelector('main')?.clientWidth || window.innerWidth;
        setGridClass(getGridClass(width));
    }, [getGridClass]);

    // Handle resize events
    useEffect(() => {
        const resizeObserver = new ResizeObserver(updateGridClass);
        const main = document.querySelector('main');
        if (main) {
            resizeObserver.observe(main);
        }

        return () => resizeObserver.disconnect();
    }, [updateGridClass]);

    // Handle store changes
    useEffect(() => {
        updateGridClass();
    }, [updateGridClass, breakpoints]);

    const handleDragStart = (pair: string) => {
        setDraggedItem(pair);
    };

    const handleDrag = (e: MouseEvent | TouchEvent | PointerEvent, pair: string) => {
        if (!draggedItem) return;

        const element = e.target as HTMLElement;
        const container = element.closest('[data-pair]');
        if (!container) return;

        const elements = document.querySelectorAll('[data-pair]');
        let closestEl = null;
        let minDistance = Infinity;

        elements.forEach((el) => {
            if (el === container) return;

            const rect = el.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            // Calculate center points
            const elCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            };
            const containerCenter = {
                x: containerRect.left + containerRect.width / 2,
                y: containerRect.top + containerRect.height / 2,
            };

            // Calculate distance with more weight on vertical position
            const dx = elCenter.x - containerCenter.x;
            const dy = elCenter.y - containerCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Update closest element if this one is closer
            if (distance < minDistance) {
                minDistance = distance;
                closestEl = el;
            }
        });

        // If we found a close element and it's within a reasonable distance, swap
        if (closestEl && minDistance < 150) {
            const targetPair = closestEl.getAttribute('data-pair');
            if (targetPair && targetPair !== draggedItem) {
                const newOrder = [...orderedPairs];
                const fromIndex = newOrder.indexOf(draggedItem);
                const toIndex = newOrder.indexOf(targetPair);

                // Only reorder if positions are different
                if (fromIndex !== toIndex) {
                    newOrder.splice(fromIndex, 1);
                    newOrder.splice(toIndex, 0, draggedItem);
                    reorderPairs(newOrder);
                }
            }
        }
    };

    if (!selectedPairs.length && !isLoading) {
        return (
            <main className='w-full px-2 pt-16 sm:px-4 lg:px-6 lg:pt-18'>
                <NoInstruments />
                <div className='mt-4 text-center text-sm text-gray-400'>Please complete the onboarding process to select your trading pairs.</div>
            </main>
        );
    }

    return (
        <main className='w-full px-2 pt-16 sm:px-4 lg:pt-18'>
            <div className={cn(gridClass, 'transition-[grid-template-columns] duration-300 ease-in-out')}>
                {orderedPairs.map((pair) => {
                    const data = pairData[pair];
                    if (!data?.boxes?.[0]) return null;

                    return (
                        <motion.div
                            key={pair}
                            initial={false}
                            layout='position'
                            drag
                            dragSnapToOrigin
                            onDragStart={() => handleDragStart(pair)}
                            onDrag={(e) => handleDrag(e, pair)}
                            onDragEnd={() => setDraggedItem(null)}
                            whileDrag={{ zIndex: 1 }}
                            transition={{
                                layout: {
                                    type: 'tween',
                                    duration: 0.2,
                                    ease: 'easeOut',
                                },
                            }}
                            className='relative cursor-grab active:cursor-grabbing'>
                            <div data-pair={pair}>
                                <PairResoBox
                                    pair={pair}
                                    boxSlice={{
                                        ...data.boxes[0],
                                        boxes: data.boxes[0].boxes.map((box) => ({
                                            ...box,
                                        })),
                                    }}
                                    boxColors={boxColors}
                                    isLoading={isLoading}
                                    currentOHLC={data.currentOHLC}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </main>
    );
}
