import React, { useCallback, useEffect, useState } from 'react';

interface DraggableBorderProps {
    onResize: (delta: number) => void;
    position?: 'left' | 'right';
}

export const DraggableBorder: React.FC<DraggableBorderProps> = ({ onResize, position = 'left' }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setStartX(e.clientX);
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return;

            const delta = e.clientX - startX;
            onResize(position === 'left' ? delta : -delta);
            setStartX(e.clientX);
        },
        [isDragging, startX, onResize, position]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div
            onMouseDown={handleMouseDown}
            className={`absolute top-0 bottom-0 ${position === 'left' ? '-left-[1px]' : '-right-[1px]'} z-[91] w-[1px] cursor-ew-resize rounded-full bg-[#181818] transition-all duration-200 hover:w-[3px] hover:bg-blue-400 ${
                isDragging ? 'shadow-2xl shadow-blue-500' : 'hover:shadow-2xl hover:shadow-blue-500'
            }`}
        />
    );
};
