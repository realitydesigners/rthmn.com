import { useCallback, useEffect, useState } from 'react';

interface UseDraggableHeightProps {
    initialHeight: number;
    minHeight: number;
    maxHeight: number;
}

export const useDraggableHeight = ({ initialHeight, minHeight, maxHeight }: UseDraggableHeightProps) => {
    const [height, setHeight] = useState(initialHeight);
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [startHeight, setStartHeight] = useState(initialHeight);

    const handleDragStart = useCallback(
        (e: React.MouseEvent) => {
            setIsDragging(true);
            setStartY(e.clientY);
            setStartHeight(height);
        },
        [height]
    );

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleDrag = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return;
            const deltaY = startY - e.clientY;
            const newHeight = Math.min(Math.max(startHeight + deltaY, minHeight), maxHeight);
            setHeight(newHeight);
        },
        [isDragging, startY, startHeight, minHeight, maxHeight]
    );

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', handleDragEnd);
        } else {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', handleDragEnd);
        }
        return () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', handleDragEnd);
        };
    }, [isDragging, handleDrag, handleDragEnd]);

    return {
        height,
        isDragging,
        handleDragStart,
    };
};
