import React, { useState, useEffect, useCallback } from 'react';

export const DraggableBorder: React.FC<{
    onResize: (delta: number) => void;
}> = React.memo(({ onResize }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        e.preventDefault();
    }, []);

    useEffect(() => {
        if (!isDragging) return;

        const startX = window.innerWidth;
        let lastX = startX;

        const handleMouseMove = (e: MouseEvent) => {
            const currentX = e.clientX;
            const delta = lastX - currentX;
            lastX = currentX;
            onResize(delta);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, onResize]);

    return (
        <div
            className={`absolute top-0 bottom-0 left-0 z-10 w-[1px] cursor-ew-resize rounded-full bg-[#181818] transition-all duration-200 hover:w-[3px] hover:bg-blue-400 ${
                isDragging ? 'shadow-2xl shadow-blue-500' : 'hover:shadow-2xl hover:shadow-blue-500'
            }`}
            onMouseDown={handleDragStart}
        />
    );
});
