import React from 'react';

export const DraggableBorder: React.FC<{
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
